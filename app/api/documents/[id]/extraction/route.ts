/**
 * app/api/documents/[id]/extraction/route.ts
 *
 * Medical Report Extraction & Patient Review API.
 *
 * Endpoints:
 * - GET  /api/documents/[id]/extraction — Retrieve extraction status, raw text, and structured fields.
 * - POST /api/documents/[id]/extraction — Trigger or retry the LangChain extraction pipeline.
 * - PUT  /api/documents/[id]/extraction — Confirm & save patient-verified fields, updating Document
 *                                        and the longitudinal ClinicalRecord timeline.
 *
 * Security:
 * - Strictly enforces session-based patient ownership on all read, trigger, and confirmation operations.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
} from "@/lib/api-response";
import { Types } from "mongoose";
import { Document, DocumentExtraction, ClinicalRecord } from "@/models";
import { processDocumentExtraction } from "@/services/document-processor";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET: Fetch Extraction Data ──────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients can access extraction details", 403);
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findOne({ _id: id, deletedAt: null }).lean();
    if (!doc) {
      return apiError("Document not found", 404);
    }

    // Ownership check
    if (doc.patientUuid !== session.patientUuid) {
      return apiError("Unauthorized access to document", 403);
    }

    const extraction = await DocumentExtraction.findOne({ documentId: doc._id }).lean();

    return apiSuccess({
      document: {
        id: doc._id.toString(),
        title: doc.title,
        originalFileName: doc.originalFileName,
        mimeType: doc.mimeType,
        facility: doc.facility,
        practitioner: doc.practitioner || null,
        clinicalDate: doc.clinicalDate,
        recordCategory: doc.recordCategory,
        status: doc.status,
      },
      extraction: extraction
        ? {
            id: extraction._id.toString(),
            status: extraction.status,
            extractedFormat: extraction.extractedFormat,
            rawText: extraction.rawText,
            structuredData: extraction.structuredData,
            confidenceScore: extraction.confidenceScore,
            uncertainFields: extraction.uncertainFields || [],
            userReviewed: extraction.userReviewed,
            reviewedAt: extraction.reviewedAt || null,
            errorDetails: extraction.errorDetails || null,
            updatedAt: extraction.updatedAt,
          }
        : null,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}

// ─── POST: Trigger or Retry Extraction ───────────────────────────────────────

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients can trigger document extraction", 403);
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findOne({ _id: id, deletedAt: null });
    if (!doc) {
      return apiError("Document not found", 404);
    }

    if (doc.patientUuid !== session.patientUuid) {
      return apiError("Unauthorized access to document", 403);
    }

    // Execute extraction pipeline
    const result = await processDocumentExtraction(id, session.patientUuid);

    if (!result.success) {
      return apiError(result.error || "Document extraction failed", 500);
    }

    const extraction = await DocumentExtraction.findById(result.extractionId).lean();

    return apiSuccess({
      message: "Extraction completed successfully",
      extraction,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}

// ─── PUT: Patient Review & Confirmation ──────────────────────────────────────

const ConfirmationSchema = z.object({
  title: z.string().min(2).max(300),
  recordCategory: z.enum([
    "prescription",
    "ct_mri_report",
    "xray_report",
    "lab_report",
    "discharge_summary",
    "consultation_note",
    "other",
  ]),
  clinicalDate: z.string().min(4),
  facility: z.string().min(2).max(300),
  practitioner: z.string().max(200).optional().nullable(),
  findings: z.string().max(5000).optional().nullable(),
  impression: z.string().max(3000).optional().nullable(),
  measurements: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        referenceRange: z.string().optional(),
        flag: z.enum(["normal", "high", "low", "abnormal"]).optional(),
      })
    )
    .optional(),
});

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients can confirm extraction details", 403);
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findOne({ _id: id, deletedAt: null });
    if (!doc) {
      return apiError("Document not found", 404);
    }

    if (doc.patientUuid !== session.patientUuid) {
      return apiError("Unauthorized access to document", 403);
    }

    const body = await req.json();
    const parsed = ConfirmationSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const data = parsed.data;
    const parsedDate = new Date(data.clinicalDate);
    const validClinicalDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    // 1. Update Document Extraction
    let extraction = await DocumentExtraction.findOne({ documentId: doc._id });
    if (!extraction) {
      extraction = new DocumentExtraction({
        documentId: doc._id,
        patientUuid: doc.patientUuid,
        status: "completed",
      });
    }

    extraction.userReviewed = true;
    extraction.reviewedAt = new Date();
    extraction.reviewedBy = session.patientUuid;
    extraction.correctedData = {
      title: data.title,
      documentType: data.recordCategory,
      clinicalDate: data.clinicalDate,
      facility: data.facility,
      clinician: data.practitioner || null,
      findings: data.findings || null,
      impression: data.impression || null,
      measurements: data.measurements || [],
    };
    await extraction.save();

    // 2. Update Document Record
    doc.title = data.title;
    doc.recordCategory = data.recordCategory;
    doc.clinicalDate = validClinicalDate;
    doc.facility = data.facility;
    doc.practitioner = data.practitioner || undefined;
    doc.notes = data.impression || data.findings || doc.notes;
    doc.status = "verified";
    await doc.save();

    // 3. Update or create linked ClinicalRecord in timeline
    const summaryText =
      data.impression ||
      data.findings ||
      `Verified ${data.recordCategory.replace(/_/g, " ")} from ${data.facility}`;

    if (doc.clinicalRecordId) {
      await ClinicalRecord.updateOne(
        { _id: doc.clinicalRecordId },
        {
          title: data.title,
          category: data.recordCategory,
          clinicalDate: validClinicalDate,
          facility: data.facility,
          practitioner: data.practitioner || undefined,
          summary: summaryText,
        }
      );
    } else {
      const newRec = await ClinicalRecord.create({
        patientUuid: doc.patientUuid,
        category: data.recordCategory,
        title: data.title,
        facility: data.facility,
        practitioner: data.practitioner || undefined,
        clinicalDate: validClinicalDate,
        summary: summaryText,
        tags: [data.recordCategory, "verified_extraction"],
        documentId: doc._id,
        encounterId: doc.encounterId,
        source: "patient_upload",
      });
      doc.clinicalRecordId = (newRec as { _id: Types.ObjectId })._id;
      await doc.save();
    }

    return apiSuccess({
      message: "Medical report verified and timeline updated successfully",
      document: {
        id: doc._id.toString(),
        title: doc.title,
        recordCategory: doc.recordCategory,
        clinicalDate: doc.clinicalDate,
        facility: doc.facility,
        status: doc.status,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
