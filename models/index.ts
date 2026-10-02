/**
 * models/index.ts
 *
 * Barrel export for all Mongoose models.
 * Import models from here to avoid circular reference issues.
 */

export { default as User } from "./User";
export { default as Patient } from "./Patient";
export { default as Facility } from "./Facility";
export { default as Practitioner } from "./Practitioner";

export type { IUser, UserRole } from "./User";
export type { IPatient } from "./Patient";
export type { IFacility } from "./Facility";
export type { IPractitioner } from "./Practitioner";
