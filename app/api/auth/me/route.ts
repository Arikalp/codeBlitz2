/**
 * app/api/auth/me/route.ts
 *
 * GET /api/auth/me
 *
 * Returns the current session's user and patient profile.
 * Used by the client to check auth state on page load.
 */

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { apiSuccess, apiError, apiInternalError } from "@/lib/api-response";
import { User, Patient, Practitioner, Facility } from "@/models";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Not authenticated", 401);
    }

    await connectToDatabase();

    const user = await User.findById(session.userId).lean();
    if (!user || !user.isActive) {
      return apiError("User not found or inactive", 401);
    }

    let patientProfile = null;
    let practitionerProfile = null;
    let facilityProfile = null;

    if (session.role === "patient" && session.patientUuid) {
      patientProfile = await Patient.findOne({ internalUuid: session.patientUuid }).lean();
    } else if (session.role === "doctor") {
      practitionerProfile = await Practitioner.findOne({ userId: user._id }).lean();
    } else if (session.role === "facility_admin") {
      facilityProfile = await Facility.findOne({ isDemo: true }).lean();
    }

    return apiSuccess({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      patient: patientProfile
        ? {
            uuid: patientProfile.internalUuid,
            name: patientProfile.name,
            dateOfBirth: patientProfile.dateOfBirth,
            gender: patientProfile.gender,
            bloodGroup: patientProfile.bloodGroup,
            phone: patientProfile.phone,
            address: patientProfile.address,
            allergies: patientProfile.allergies,
            conditions: patientProfile.conditions,
            emergencyContact: patientProfile.emergencyContact,
            abhaIdDemo: patientProfile.abhaIdDemo ?? null,
          }
        : null,
      practitioner: practitionerProfile
        ? {
            id: practitionerProfile._id.toString(),
            name: practitionerProfile.name,
            specialty: practitionerProfile.specialty,
            phone: practitionerProfile.phone,
          }
        : null,
      facility: facilityProfile
        ? {
            id: facilityProfile._id.toString(),
            name: facilityProfile.name,
            type: facilityProfile.type,
          }
        : null,
    });
  } catch (err) {
    return apiInternalError(err);
  }
}
