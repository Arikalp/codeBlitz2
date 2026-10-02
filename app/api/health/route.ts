/**
 * app/api/health/route.ts
 *
 * GET /api/health
 *
 * Health-check endpoint. Returns the application status and a
 * timestamp. Useful for monitoring, uptime checks, and verifying
 * the deployment is reachable.
 *
 * Does NOT connect to the database so it can respond immediately
 * even when MongoDB is temporarily unavailable.
 */

import { apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic"; // always respond at request time

export async function GET() {
  return apiSuccess({
    status: "ok",
    service: "HealthSetu API",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
