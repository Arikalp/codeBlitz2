/**
 * app/api/timeline/route.ts
 *
 * GET /api/timeline — Longitudinal medical records timeline for authenticated patient.
 *
 * Requirements:
 * - Orders records by clinical event date (`clinicalDate: -1`), not upload date.
 * - Enforces session-based patient ownership.
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { apiSuccess, apiError, apiInternalError } from "@/lib/api-response";
import { ClinicalRecord, type MedicalRecordCategory } from "@/models";
import { MOCK_RECORDS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("Only patients can access their longitudinal timeline", 403);
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = {
      patientUuid: session.patientUuid,
    };

    if (category && category !== "All" && category !== "all") {
      filter.category = category;
    }

    // Query sorted by clinical event date
    const dbRecords = await ClinicalRecord.find(filter)
      .sort({ clinicalDate: -1 })
      .lean();

    // Map database records
    const mappedDbRecords = dbRecords.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      category: r.category,
      clinicalDate: r.clinicalDate.toISOString(),
      facility: r.facility,
      doctor: r.practitioner || "Treating Physician",
      summary: r.summary,
      tags: r.tags,
      hasDocument: !!r.documentId,
      documentId: r.documentId ? r.documentId.toString() : null,
      source: r.source,
    }));

    // If patient has their own records, return them.
    // If empty (newly registered patient or demo patient before first upload),
    // include synthetic demo records tagged as demo.
    let records = mappedDbRecords;
    if (records.length === 0) {
      records = MOCK_RECORDS.map((m) => {
        let cat = m.category as string;
        if (cat === "imaging") cat = "xray_report";
        else if (cat === "consultation") cat = "consultation_note";
        return {
          id: m.id,
          title: m.title,
          category: cat as MedicalRecordCategory,
          clinicalDate: m.clinicalDate,
          facility: m.facility,
          doctor: m.doctor,
          summary: m.summary,
          tags: [...m.tags],
          hasDocument: m.hasDocument,
          documentId: null,
          source: "demo_seed" as const,
        };
      });
    }

    return apiSuccess({ records });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
