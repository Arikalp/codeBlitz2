/**
 * models/Patient.ts
 *
 * Mongoose model for a patient's profile.
 *
 * Security rules:
 * - `internalUuid` is the primary internal UUID v4 identifier.
 * - `patientUniqueId` is the unique human-friendly clinician identifier (e.g. HS-PT-842910).
 * - Each patient is linked to exactly one User document.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  /** UUID v4 — the stable, public-safe application identifier */
  internalUuid: string;
  /** Unique human-friendly Patient Health ID (e.g. HS-PT-842910) */
  patientUniqueId: string;
  /** Reference to the User auth record */
  userId: mongoose.Types.ObjectId;
  name: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bloodGroup?: string;
  phone?: string;
  address?: string;
  /** Optional legacy identifier field for backward compatibility */
  abhaIdDemo?: string;
  allergies: string[];
  conditions: string[];
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generates a physician-friendly unique patient identifier:
 * e.g. HS-PT-842910
 */
export function generatePatientUniqueId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `HS-PT-${digits}`;
}

const PatientSchema = new Schema<IPatient>(
  {
    internalUuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientUniqueId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    bloodGroup: { type: String, trim: true, maxlength: 10 },
    phone: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 500 },
    abhaIdDemo: {
      type: String,
      trim: true,
      maxlength: 50,
      // Not indexed — not a lookup key
    },
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    emergencyContact: {
      name:     { type: String, trim: true },
      relation: { type: String, trim: true },
      phone:    { type: String, trim: true },
    },
  },
  { timestamps: true }
);

PatientSchema.pre("validate", function () {
  if (!this.patientUniqueId) {
    this.patientUniqueId = generatePatientUniqueId();
  }
});

const Patient: Model<IPatient> =
  mongoose.models.Patient ?? mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
