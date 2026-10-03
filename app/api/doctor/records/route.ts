/**
 * app/api/doctor/records/route.ts
 *
 * POST /api/doctor/records
 *
 * Allows an authorized doctor or facility administrator to add a new clinical
 * record (consultation note, prescription, or diagnostic impression) directly
 * to a patient's longitudinal timeline after looking them up.
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { apiSuccess, apiError, apiInternalError } from "@/lib/api-response";
import { Patient, ClinicalRecord, Practitioner, type MedicalRecordCategory } from "@/models";

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["doctor", "facility_admin"]);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const {
      patientId, // can be patientUniqueId or internalUuid
      title,
      category = "consultation_note",
      clinicalDate,
      summary,
      facility,
      tags = [],
    } = body;

    if (!patientId || !title || !summary) {
      return apiError("Missing required fields: patientId, title, and summary", 400);
    }

    await connectToDatabase();

    // 1. Resolve patient
    const cleanId = String(patientId).trim();
    const patient = await Patient.findOne({
      $or: [
        { patientUniqueId: cleanId.toUpperCase() },
        { internalUuid: cleanId },
      ],
    }).lean();

    if (!patient) {
      return apiError("Patient not found", 404);
    }

    // 2. Resolve practitioner
    const practitioner = await Practitioner.findOne({ userId: session.userId }).lean();
    const doctorName = practitioner?.name || "Dr. Priya Sharma";
    const facilityName = facility || "Apex Multi-Specialty Hospital";

    // 3. Map category to ClinicalRecord format
    let validCategory: MedicalRecordCategory = "consultation_note";
    if (category === "prescription") validCategory = "prescription";
    else if (category === "lab_report") validCategory = "lab_report";
    else if (category === "discharge_summary") validCategory = "discharge_summary";
    else if (category === "imaging") validCategory = "xray_report";
    else if (category === "ct_mri_report") validCategory = "ct_mri_report";
    else if (category === "xray_report") validCategory = "xray_report";
    else if (category === "consultation_note" || category === "consultation") validCategory = "consultation_note";
    else validCategory = "other";

    // 4. Create ClinicalRecord
    const record = await ClinicalRecord.create({
      patientUuid: patient.internalUuid,
      title: title.trim(),
      category: validCategory,
      clinicalDate: clinicalDate ? new Date(clinicalDate) : new Date(),
      facility: facilityName,
      practitioner: doctorName,
      summary: summary.trim(),
      tags: Array.isArray(tags) && tags.length > 0 ? tags : [validCategory, "doctor_entry"],
      source: "hospital_system",
    });

    return apiSuccess(
      {
        record: {
          id: record._id.toString(),
          title: record.title,
          category: record.category,
          clinicalDate: record.clinicalDate.toISOString(),
          facility: record.facility,
          doctor: record.practitioner,
          summary: record.summary,
          tags: record.tags,
          hasDocument: false,
          documentId: null,
          source: record.source,
        },
      },
      201
    );
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
