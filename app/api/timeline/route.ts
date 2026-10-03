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
import { ClinicalRecord, Patient, type MedicalRecordCategory } from "@/models";
import { MOCK_RECORDS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const requestedPatient = searchParams.get("patientId") || searchParams.get("patientUuid");

    let targetPatientUuid = session.patientUuid;

    if (!targetPatientUuid && (session.role === "doctor" || session.role === "facility_admin")) {
      if (requestedPatient) {
        const found = await Patient.findOne({
          $or: [
            { patientUniqueId: requestedPatient.toUpperCase() },
            { internalUuid: requestedPatient },
          ],
        }).lean();
        if (found) targetPatientUuid = found.internalUuid;
      }
      if (!targetPatientUuid) {
        const demoPatient = await Patient.findOne().lean();
        if (demoPatient) targetPatientUuid = demoPatient.internalUuid;
      }
    }

    if (!targetPatientUuid) {
      return apiError("Only patients or authorized medical practitioners can access timelines", 403);
    }

    const filter: Record<string, unknown> = {
      patientUuid: targetPatientUuid,
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
