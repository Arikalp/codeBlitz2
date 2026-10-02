/**
 * lib/auth.ts
 *
 * Core server-side authentication utilities.
 * - JWT session tokens via jose (Web Crypto, edge-safe)
 * - Password hashing via bcryptjs
 * - Cookie read/write helpers (HttpOnly, Secure, SameSite)
 *
 * IMPORTANT: Server-side only — never import in Client Components.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { UserRole } from "@/models/User";

// ─── Constants ──────────────────────────────────────────────────────────────

const COOKIE_NAME = "hs_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_ROUNDS = 12;

// ─── JWT secret ─────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Missing or too-short SESSION_SECRET environment variable. " +
        "Add a random 64-char string to .env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

// ─── Session payload ─────────────────────────────────────────────────────────

export interface SessionPayload extends JWTPayload {
  userId: string;
  role: UserRole;
  patientUuid?: string; // only present for "patient" role
}

// ─── Password helpers ────────────────────────────────────────────────────────

/**
 * Hash a plaintext password. Never store or log the input.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Session token helpers ───────────────────────────────────────────────────

/**
 * Sign a JWT session token.
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

/**
 * Verify and decode a JWT session token.
 * Returns null instead of throwing on invalid/expired tokens.
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};

/**
 * Write the session cookie. Call from Route Handlers only.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Clear the session cookie. Call from Route Handlers only.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Read and verify the current session from the request cookies.
 * Returns null if not authenticated or session expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Require a valid session. Returns the payload or throws a Response (401).
 * Use inside Route Handlers: `const session = await requireSession()`.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw Response.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }
  return session;
}

/**
 * Require a specific role. Throws 403 if role does not match.
 */
export async function requireRole(
  role: UserRole | UserRole[]
): Promise<SessionPayload> {
  const session = await requireSession();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.role)) {
    throw Response.json(
      { success: false, error: "You do not have permission to perform this action" },
      { status: 403 }
    );
  }
  return session;
}
