/**
 * app/api/documents/[id]/route.ts
 *
 * GET    /api/documents/[id] — Retrieve metadata for a specific document.
 * DELETE /api/documents/[id] — Delete a document and its storage file.
 *
 * Security:
 * - Patient ownership check: strictly prevents any patient from reading or deleting
 *   another patient's records.
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getStorageProvider } from "@/lib/storage";
import { apiSuccess, apiError, apiInternalError } from "@/lib/api-response";
import { Document, ClinicalRecord } from "@/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findOne({
      _id: id,
      deletedAt: null,
    }).lean();

    if (!doc) {
      return apiError("Document not found", 404);
    }

    // Access control: Patient owner or authorized medical practitioner
    const isPatientOwner = session.patientUuid && doc.patientUuid === session.patientUuid;
    const isAuthorizedDoctor = session.role === "doctor" || session.role === "facility_admin";

    if (!isPatientOwner && !isAuthorizedDoctor) {
      return apiError("You do not have permission to view this document", 403);
    }

    return apiSuccess({
      document: {
        id: doc._id.toString(),
        title: doc.title,
        originalFileName: doc.originalFileName,
        mimeType: doc.mimeType,
        fileSizeBytes: doc.fileSizeBytes,
        recordCategory: doc.recordCategory,
        clinicalDate: doc.clinicalDate,
        facility: doc.facility,
        practitioner: doc.practitioner || null,
        notes: doc.notes || null,
        status: doc.status,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients can delete personal documents", 403);
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!doc) {
      return apiError("Document not found", 404);
    }

    // Strict ownership enforcement: Cannot delete another patient's document
    if (doc.patientUuid !== session.patientUuid) {
      return apiError("You do not have permission to delete this document", 403);
    }

    // 1. Delete physical asset from Storage (Cloudinary / Local)
    const storageProvider = getStorageProvider();
    const isPdf = doc.mimeType === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    await storageProvider.deleteFile(doc.storageKey, resourceType);

    // 2. Delete linked ClinicalRecord from Timeline
    if (doc.clinicalRecordId) {
      await ClinicalRecord.deleteOne({ _id: doc.clinicalRecordId });
    } else {
      await ClinicalRecord.deleteMany({ documentId: doc._id });
    }

    // 3. Mark document as deleted in MongoDB
    doc.deletedAt = new Date();
    await doc.save();

    return apiSuccess({ message: "Document deleted successfully" });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
