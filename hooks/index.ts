/**
 * hooks/index.ts
 *
 * Barrel export for all custom React hooks.
 * Hooks are client-side utilities — use them only in Client Components.
 *
 * Example (to be added in future phases):
 *   export * from "./useHealthTimeline";
 *   export * from "./useConsentRequest";
 */

export { useAuth } from "@/context/AuthContext";
export type { UserSession, PatientProfile, PractitionerProfile, FacilityProfile } from "@/context/AuthContext";
