/**
 * app/api/patient/profile/route.ts
 *
 * GET  /api/patient/profile — fetch current patient's profile
 * PATCH /api/patient/profile — update current patient's profile
 *
 * Authorization:
 * - Patient can only access their OWN profile (enforced by session UUID)
 * - Never allow cross-patient data access
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
} from "@/lib/api-response";
import { patientProfileSchema } from "@/validators/auth";
import { Patient } from "@/models";

export async function GET() {
  try {
    const session = await requireRole("patient");

    await connectToDatabase();

    // Only fetch the patient whose UUID matches the session
    const patient = await Patient.findOne({
      internalUuid: session.patientUuid,
    }).lean();

    if (!patient) {
      return apiError("Patient profile not found", 404);
    }

    return apiSuccess({
      uuid: patient.internalUuid,
      patientUniqueId: patient.patientUniqueId || `HS-PT-${patient.internalUuid.slice(0, 6).toUpperCase()}`,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      phone: patient.phone,
      address: patient.address,
      allergies: patient.allergies,
      conditions: patient.conditions,
      emergencyContact: patient.emergencyContact,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireRole("patient");

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = patientProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = {
      name: parsed.data.name,
      gender: parsed.data.gender,
      bloodGroup: parsed.data.bloodGroup,
      phone: parsed.data.phone,
      address: parsed.data.address,
      allergies: parsed.data.allergies,
      conditions: parsed.data.conditions,
      emergencyContact: parsed.data.emergencyContact,
    };

    if (parsed.data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null;
    }

    // Ensure the patient being updated belongs to the current session (Authorization check)
    const patient = await Patient.findOneAndUpdate(
      { internalUuid: session.patientUuid },
      { $set: updateData },
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!patient) {
      return apiError("Patient profile not found", 404);
    }

    return apiSuccess({
      uuid: patient.internalUuid,
      patientUniqueId: patient.patientUniqueId || `HS-PT-${patient.internalUuid.slice(0, 6).toUpperCase()}`,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      phone: patient.phone,
      address: patient.address,
      allergies: patient.allergies,
      conditions: patient.conditions,
      emergencyContact: patient.emergencyContact,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
