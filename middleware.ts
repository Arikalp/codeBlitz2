/**
 * middleware.ts
 *
 * Next.js Edge Middleware — runs before every matched request.
 *
 * Responsibilities:
 * - Protect /dashboard/* routes: redirect unauthenticated users to /login
 * - Redirect already-authenticated users away from /login and /register
 *
 * Uses jose (Web Crypto) so it runs correctly in the Edge runtime.
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "hs_session";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIX = "/dashboard";

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Determine auth state from cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
      isAuthenticated = true;
    } catch {
      // Invalid or expired — treat as unauthenticated
      isAuthenticated = false;
    }
  }

  // 1. Redirect authenticated users away from login/register
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Protect dashboard routes
  if (pathname.startsWith(PROTECTED_PREFIX) && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js assets)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - /api/* (API routes handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
