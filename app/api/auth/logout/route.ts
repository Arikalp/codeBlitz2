/**
 * app/api/auth/logout/route.ts
 *
 * POST /api/auth/logout
 *
 * Clears the session cookie.
 */

import { clearSessionCookie } from "@/lib/auth";
import { apiSuccess, apiInternalError } from "@/lib/api-response";

export async function POST() {
  try {
    await clearSessionCookie();
    return apiSuccess({ message: "Logged out successfully" });
  } catch (err) {
    return apiInternalError(err);
  }
}
