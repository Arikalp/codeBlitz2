/**
 * app/api/documents/route.ts
 *
 * GET  /api/documents — List all uploaded documents for the authenticated patient.
 * POST /api/documents — Upload a new medical document with metadata, store file
 *                       in private storage, and create a timeline clinical record.
 *
 * Security:
 * - Session-authenticated only.
 * - Resolves patientUuid strictly from server session (never from client request).
 * - Enforces file size limits, MIME type verification, and extension whitelist.
 * - Never returns public raw storage URLs.
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getStorageProvider } from "@/lib/storage";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
} from "@/lib/api-response";
import {
  documentUploadSchema,
  validateUploadedFile,
} from "@/validators/documents";
import {
  Document,
  ClinicalRecord,
  Encounter,
  Patient,
  DocumentExtraction,
} from "@/models";
import { processDocumentExtraction } from "@/services/document-processor";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients have a personal document library", 403);
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const filter: Record<string, unknown> = {
      patientUuid: session.patientUuid,
      deletedAt: null,
    };

    if (category && category !== "all") {
      filter.recordCategory = category;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { facility: { $regex: query, $options: "i" } },
        { practitioner: { $regex: query, $options: "i" } },
      ];
    }

    const docs = await Document.find(filter)
      .sort({ clinicalDate: -1, createdAt: -1 })
      .lean();

    const docIds = docs.map((d) => d._id);
    const extractions = await DocumentExtraction.find({ documentId: { $in: docIds } }).lean();
    const extractionMap = new Map(extractions.map((e) => [e.documentId.toString(), e]));

    const safeDocs = docs.map((d) => {
      const ext = extractionMap.get(d._id.toString());
      return {
        id: d._id.toString(),
        title: d.title,
        originalFileName: d.originalFileName,
        mimeType: d.mimeType,
        fileSizeBytes: d.fileSizeBytes,
        recordCategory: d.recordCategory,
        clinicalDate: d.clinicalDate,
        facility: d.facility,
        practitioner: d.practitioner || null,
        notes: d.notes || null,
        status: d.status,
        encounterId: d.encounterId ? d.encounterId.toString() : null,
        extraction: ext
          ? {
              id: ext._id.toString(),
              status: ext.status,
              userReviewed: ext.userReviewed,
              confidenceScore: ext.confidenceScore,
              uncertainFields: ext.uncertainFields || [],
            }
          : null,
        createdAt: d.createdAt,
      };
    });

    return apiSuccess({ documents: safeDocs });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients can upload personal medical documents", 403);
    }

    // 1. Parse Multipart Form Data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError("Invalid multipart/form-data request", 400);
    }

    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return apiError("Medical document file is required", 400);
    }

    // 2. Validate File Size, MIME type, and Extension
    const fileValidation = validateUploadedFile(file as File);
    if (!fileValidation.valid) {
      return apiError(fileValidation.error || "Invalid file", 400);
    }

    // 3. Extract and Validate Metadata with Zod
    const rawMetadata = {
      title: formData.get("title")?.toString() || "",
      recordCategory: formData.get("recordCategory")?.toString() || "",
      clinicalDate: formData.get("clinicalDate")?.toString() || "",
      facility: formData.get("facility")?.toString() || "",
      practitioner: formData.get("practitioner")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
      encounterId: formData.get("encounterId")?.toString() || undefined,
    };

    const parsed = documentUploadSchema.safeParse(rawMetadata);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const {
      title,
      recordCategory,
      clinicalDate,
      facility,
      practitioner,
      notes,
      encounterId,
    } = parsed.data;

    // 4. Connect to DB and verify patient profile exists
    await connectToDatabase();
    const patientExists = await Patient.findOne({ internalUuid: session.patientUuid }).lean();
    if (!patientExists) {
      return apiError("Patient profile not found", 404);
    }

    // 5. Read File Buffer
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload to Private Storage Abstraction (Cloudinary / Local)
    const storageProvider = getStorageProvider();
    const stored = await storageProvider.upload(
      buffer,
      (file as File).name,
      (file as File).type,
      session.patientUuid
    );

    const parsedClinicalDate = new Date(clinicalDate);

    // 7. Associate or create Encounter if encounterId provided or default
    let linkedEncounterId = undefined;
    if (encounterId) {
      const existingEncounter = await Encounter.findOne({
        _id: encounterId,
        patientUuid: session.patientUuid,
      }).lean();
      if (existingEncounter) {
        linkedEncounterId = existingEncounter._id;
      }
    }

    // 8. Create Document record in MongoDB
    const doc = await Document.create({
      patientUuid: session.patientUuid,
      title,
      originalFileName: (file as File).name,
      mimeType: (file as File).type,
      fileSizeBytes: stored.fileSizeBytes,
      recordCategory,
      clinicalDate: parsedClinicalDate,
      facility,
      practitioner,
      notes,
      storageKey: stored.storageKey,
      storageProvider: stored.storageProvider,
      status: "verified",
      encounterId: linkedEncounterId,
    });

    // 9. Automatically create ClinicalRecord for Longitudinal Timeline
    const clinicalRecord = await ClinicalRecord.create({
      patientUuid: session.patientUuid,
      encounterId: linkedEncounterId,
      documentId: doc._id,
      title,
      category: recordCategory,
      clinicalDate: parsedClinicalDate,
      facility,
      practitioner,
      summary: notes || `Uploaded ${recordCategory.replace(/_/g, " ")} from ${facility}`,
      tags: [recordCategory, facility.toLowerCase().replace(/\s+/g, "_")],
      source: "patient_upload",
    });

    // Link clinicalRecordId on Document
    doc.clinicalRecordId = clinicalRecord._id;
    await doc.save();

    // 10. Trigger document extraction pipeline
    try {
      processDocumentExtraction(doc._id.toString(), session.patientUuid).catch((err) => {
        console.warn("Background extraction processing warning:", err);
      });
    } catch (e) {
      console.warn("Failed to trigger background extraction:", e);
    }

    return apiSuccess(
      {
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
          status: doc.status,
          createdAt: doc.createdAt,
        },
      },
      201
    );
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
