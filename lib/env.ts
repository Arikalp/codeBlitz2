/**
 * lib/env.ts
 *
 * Type-safe environment variable access.
 * Server-only variables are accessed via `getServerEnv()` which is
 * called lazily (inside route handlers / server actions), not at
 * module evaluation time.  This prevents accidental bundling into
 * client code and avoids startup errors in environments where the
 * variable is present but the module is evaluated before the env
 * is fully loaded.
 *
 * IMPORTANT: Never import `getServerEnv` in Client Components.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: "${name}". ` +
        `Copy .env.example to .env.local and fill in the value.`
    );
  }
  return value;
}

/**
 * Returns server-only env vars.
 * Call this inside route handlers, server actions, or server utilities.
 */
export function getServerEnv() {
  return {
    mongodbUri: requireEnv("MONGODB_URI"),
    sessionSecret: requireEnv("SESSION_SECRET"),
  } as const;
}

/**
 * Public (browser-safe) env vars.
 */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8000",
} as const;
