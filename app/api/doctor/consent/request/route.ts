/**
 * app/api/doctor/consent/request/route.ts
 *
 * POST /api/doctor/consent/request
 *
 * Doctor Patient-Report Request Endpoint.
 * Allows an authenticated medical practitioner to request medical records and
 * diagnostic reports from a patient using their Unique Patient ID (e.g. HS-PT-842910).
 *
 * Security:
 * - Requires active session with role: "doctor" | "facility_admin".
 * - Validates patient existence by Unique Health ID / UUID.
 * - Stores consent request in MongoDB with status: "pending".
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { apiSuccess, apiError, apiInternalError } from "@/lib/api-response";
import { Patient, Consent, Practitioner } from "@/models";

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
      patientId, // Unique Health ID (HS-PT-XXXXXX) or internal UUID
      purpose,
      requestedRecords = ["Diagnostic Lab Reports", "Prescriptions"],
      durationDays = 30,
    } = body;

    if (!patientId || typeof patientId !== "string" || !patientId.trim()) {
      return apiError("Patient Unique ID is required", 400);
    }

    if (!purpose || typeof purpose !== "string" || !purpose.trim()) {
      return apiError("Clinical purpose for record request is required", 400);
    }

    await connectToDatabase();

    // 1. Resolve Patient by Unique ID or UUID
    const cleanId = patientId.trim();
    const upperId = cleanId.toUpperCase();
    const formattedWithPrefix = upperId.startsWith("HS-PT-") ? upperId : `HS-PT-${upperId}`;
    const safeRegex = cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const patient = await Patient.findOne({
      $or: [
        { patientUniqueId: upperId },
        { patientUniqueId: formattedWithPrefix },
        { patientUniqueId: { $regex: `^${safeRegex}$`, $options: "i" } },
        { internalUuid: cleanId },
      ],
    }).lean();

    if (!patient) {
      return apiError(`Patient not found with Unique ID: "${cleanId}"`, 404);
    }

    // 2. Resolve Doctor & Facility
    const practitioner = await Practitioner.findOne({ userId: session.userId }).lean();
    const doctorName = practitioner?.name || "Dr. Priya Sharma";
    const facilityName = "Apex Multi-Specialty Hospital";

    // 3. Create Consent Request Artifact
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const consentId = `REQ-${randomSuffix}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const consent = await Consent.create({
      consentId,
      patientUuid: patient.internalUuid,
      patientUniqueId: patient.patientUniqueId || `HS-PT-${patient.internalUuid.slice(0, 6).toUpperCase()}`,
      patientName: patient.name,
      requesterId: session.userId,
      requestedBy: doctorName,
      facility: facilityName,
      purpose: purpose.trim(),
      requestedRecords: Array.isArray(requestedRecords) && requestedRecords.length > 0
        ? requestedRecords
        : ["Diagnostic Lab Reports", "Prescriptions", "Consultation Notes"],
      status: "pending",
      requestedAt: now,
      expiresAt,
    });

    return apiSuccess(
      {
        consent: {
          id: consent._id.toString(),
          consentId: consent.consentId,
          patientUniqueId: consent.patientUniqueId,
          patientName: consent.patientName,
          requestedBy: consent.requestedBy,
          facility: consent.facility,
          purpose: consent.purpose,
          requestedRecords: consent.requestedRecords,
          status: consent.status,
          requestedAt: consent.requestedAt.toISOString(),
          expiresAt: consent.expiresAt.toISOString(),
        },
      },
      201
    );
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
