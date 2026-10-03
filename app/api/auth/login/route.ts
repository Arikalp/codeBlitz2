/**
 * app/api/auth/login/route.ts
 *
 * POST /api/auth/login
 *
 * Authenticates a user by email + password.
 * - Returns the same error for invalid email OR wrong password (no enumeration)
 * - Sets an HttpOnly session cookie on success
 */

import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
} from "@/lib/api-response";
import { loginSchema } from "@/validators/auth";
import { User, Patient } from "@/models";

const GENERIC_AUTH_ERROR = "Invalid email or password";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { email, password } = parsed.data;

    // 2. Connect and look up user — explicitly select passwordHash
    await connectToDatabase();
    let user = await User.findOne({ email }).select("+passwordHash");

    // Automatically seed demo accounts on demand if attempting demo login
    if (!user && email.endsWith("@healthsetu.demo")) {
      const { seedDemoAccounts } = await import("@/lib/seed");
      await seedDemoAccounts();
      user = await User.findOne({ email }).select("+passwordHash");
    }

    // 3. Guard: user not found (same error as wrong password — no enumeration)
    if (!user || !user.isActive) {
      return apiError(GENERIC_AUTH_ERROR, 401);
    }

    // 4. Verify password — constant-time bcrypt compare
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiError(GENERIC_AUTH_ERROR, 401);
    }

    // 5. Get patient UUID if applicable
    let patientUuid: string | undefined;
    if (user.role === "patient") {
      const patient = await Patient.findOne({ userId: user._id }).select("internalUuid").lean();
      patientUuid = patient?.internalUuid;
    }

    // 6. Sign session and set cookie
    const token = await signSession({
      userId: user._id.toString(),
      role: user.role,
      patientUuid,
    });
    await setSessionCookie(token);

    return apiSuccess({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        patientUuid,
      },
    });
  } catch (err) {
    return apiInternalError(err);
  }
}
