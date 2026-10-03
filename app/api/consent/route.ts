/**
 * app/api/consent/route.ts
 *
 * GET /api/consent
 *
 * Retrieves consent & record authorization requests.
 * - For Patients: Returns all requests directed to their profile, ordered by date descending.
 * - For Doctors: Returns requests initiated by the doctor or for a specific queried patient.
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { apiSuccess, apiError, apiInternalError } from "@/lib/api-response";
import { Consent, Patient } from "@/models";
import { MOCK_CONSENTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const queriedPatientId = searchParams.get("patientId") || searchParams.get("patientUuid");

    let filter: Record<string, unknown> = {};

    if (session.role === "patient") {
      if (!session.patientUuid) {
        return apiError("Patient session has no linked identifier", 403);
      }
      filter.patientUuid = session.patientUuid;
    } else if (session.role === "doctor" || session.role === "facility_admin") {
      if (queriedPatientId) {
        const clean = queriedPatientId.trim().toUpperCase();
        filter.$or = [
          { patientUniqueId: clean },
          { patientUniqueId: clean.startsWith("HS-PT-") ? clean : `HS-PT-${clean}` },
          { patientUuid: queriedPatientId.trim() },
        ];
      } else {
        filter.$or = [
          { requesterId: session.userId },
          { requestedBy: { $regex: "Dr.", $options: "i" } },
        ];
      }
    }

    const dbConsents = await Consent.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    let consents = dbConsents.map((c) => ({
      id: c._id.toString(),
      consentId: c.consentId,
      patientUniqueId: c.patientUniqueId,
      patientName: c.patientName,
      requestedBy: c.requestedBy,
      facility: c.facility,
      purpose: c.purpose,
      requestedRecords: c.requestedRecords,
      status: c.status,
      requestedAt: c.requestedAt.toISOString(),
      expiresAt: c.expiresAt.toISOString(),
      approvedAt: c.approvedAt ? c.approvedAt.toISOString() : null,
      revokedAt: c.revokedAt ? c.revokedAt.toISOString() : null,
    }));

    // If a newly created or demo patient has no database consents yet, provide initial baseline demo requests
    if (consents.length === 0 && session.role === "patient") {
      consents = MOCK_CONSENTS.map((m) => ({
        id: m.id,
        consentId: `REQ-${m.id.replace(/\D/g, "") || "10284"}`,
        patientUniqueId: "HS-PT-842910",
        patientName: "Ramesh Patel",
        requestedBy: m.requestedBy,
        facility: m.facility,
        purpose: m.purpose,
        requestedRecords: m.requestedRecords,
        status: m.status,
        requestedAt: new Date(m.requestedAt).toISOString(),
        expiresAt: new Date(m.expiresAt).toISOString(),
        approvedAt: m.status === "approved" ? new Date().toISOString() : null,
        revokedAt: null,
      }));
    }

    return apiSuccess({ consents });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
