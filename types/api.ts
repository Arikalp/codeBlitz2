/**
 * types/api.ts
 *
 * Shared TypeScript types for API responses used across both
 * server (Route Handlers) and client (fetch callers).
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

/** Union type returned by all HealthSetu API routes. */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
