/**
 * models/Encounter.ts
 *
 * Mongoose model for clinical encounters (hospital visits, consultations, admissions).
 * Represents a discrete interaction between a patient and healthcare providers.
 *
 * Security:
 * - Tied to Patient via internalUuid (never exposed in public URLs).
 * - Enforces patient ownership on all operations.
 */

import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export type EncounterType =
  | "outpatient"
  | "inpatient"
  | "emergency"
  | "teleconsultation"
  | "diagnostic"
  | "other";

export type EncounterStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface IEncounter extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  patientUuid: string;
  facilityName: string;
  practitionerName?: string;
  encounterDate: Date;
  type: EncounterType;
  status: EncounterStatus;
  reason?: string;
  clinicalNotes?: string;
  diagnosis?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EncounterSchema = new Schema<IEncounter>(
  {
    patientUuid: {
      type: String,
      required: true,
      index: true,
    },
    facilityName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    practitionerName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    encounterDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    type: {
      type: String,
      enum: ["outpatient", "inpatient", "emergency", "teleconsultation", "diagnostic", "other"],
      required: true,
      default: "outpatient",
    },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "cancelled"],
      required: true,
      default: "completed",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    clinicalNotes: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    diagnosis: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for chronological querying by patient
EncounterSchema.index({ patientUuid: 1, encounterDate: -1 });

const Encounter: Model<IEncounter> =
  mongoose.models.Encounter ?? mongoose.model<IEncounter>("Encounter", EncounterSchema);

export default Encounter;
