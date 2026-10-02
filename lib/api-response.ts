/**
 * lib/api-response.ts
 *
 * Reusable helpers for building consistent JSON API responses.
 *
 * Usage (in a Route Handler):
 *   return apiSuccess({ user }, 201);
 *   return apiError("Not found", 404);
 *   return apiValidationError(zodError);
 */

import { ZodError } from "zod";

// ─── Response Shape ────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  /** Field-level validation errors, present only when relevant. */
  fieldErrors?: Record<string, string[]>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns a 2xx JSON response with a `{ success: true, data }` envelope.
 */
export function apiSuccess<T = unknown>(
  data: T,
  status: number = 200
): Response {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return Response.json(body, { status });
}

/**
 * Returns an error JSON response with a `{ success: false, error }` envelope.
 */
export function apiError(message: string, status: number = 500): Response {
  const body: ApiErrorResponse = { success: false, error: message };
  return Response.json(body, { status });
}

/**
 * Converts a ZodError into a 422 validation-error response with per-field
 * messages included in the body.
 */
export function apiValidationError(err: ZodError): Response {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }

  const body: ApiErrorResponse = {
    success: false,
    error: "Validation failed",
    fieldErrors,
  };

  return Response.json(body, { status: 422 });
}

/**
 * Wraps any unknown thrown value into a safe 500 API error response.
 * Logs the original error server-side.
 */
export function apiInternalError(err: unknown): Response {
  console.error("[API] Internal error:", err);
  return apiError("An unexpected error occurred. Please try again later.", 500);
}
