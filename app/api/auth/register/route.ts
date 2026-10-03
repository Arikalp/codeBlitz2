/**
 * app/api/auth/register/route.ts
 *
 * POST /api/auth/register
 *
 * Creates a new User + Patient record.
 * - Validates input with Zod
 * - Hashes password with bcrypt (12 rounds)
 * - Generates UUID for the patient's internalUuid
 * - Sets an HttpOnly session cookie on success
 *
 * Security: no plaintext passwords in logs or responses.
 */

import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
} from "@/lib/api-response";
import { registerSchema } from "@/validators/auth";
import { User, Patient, Practitioner, Facility } from "@/models";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const {
      name,
      email,
      role,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
    } = parsed.data;
    // Note: `password` is destructured but never logged or returned
    const { password } = parsed.data;

    // 2. Connect to DB
    await connectToDatabase();

    // 3. Check if email is already taken
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    // 4. Hash the password
    const passwordHash = await hashPassword(password);

    // 5. Create the User record
    const user = await User.create({ email, passwordHash, role });

    // 6. Create corresponding role entity
    let patientUuid: string | undefined;
    let patientUniqueId: string | undefined;

    if (role === "patient") {
      const uuid = uuidv4();
      const newPatient = await Patient.create({
        internalUuid: uuid,
        userId: user._id,
        name,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bloodGroup,
        address,
      });
      patientUuid = uuid;
      patientUniqueId = newPatient.patientUniqueId;
    } else if (role === "doctor") {
      await Practitioner.create({
        userId: user._id,
        name,
        phone,
        specialty: "General Medicine",
      });
    } else if (role === "facility_admin") {
      let facility = await Facility.findOne({ isDemo: true });
      if (!facility) {
        facility = await Facility.create({
          name: "Apex City Hospital (Demo)",
          type: "hospital",
          isDemo: true,
        });
      }
    }

    // 7. Sign a session token and set cookie
    const token = await signSession({
      userId: user._id.toString(),
      role,
      patientUuid,
    });
    await setSessionCookie(token);

    // 8. Return safe user data (no password, no hash)
    return apiSuccess(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name,
          patientUuid,
          patientUniqueId,
        },
      },
      201
    );
  } catch (err) {
    return apiInternalError(err);
  }
}
