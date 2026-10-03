/**
 * models/Patient.ts
 *
 * Mongoose model for a patient's profile.
 *
 * Security rules:
 * - `internalUuid` is the primary application identifier (generated UUID v4).
 * - ABHA ID is optional, unverified in this demo, and stored separately.
 *   It must NEVER be used as a database primary key or exposed in public URLs.
 * - Each patient is linked to exactly one User document.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  /** UUID v4 — the stable, public-safe application identifier */
  internalUuid: string;
  /** Reference to the User auth record */
  userId: mongoose.Types.ObjectId;
  name: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bloodGroup?: string;
  phone?: string;
  address?: string;
  /** Optional, unverified ABHA linkage — never used as a key */
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

const PatientSchema = new Schema<IPatient>(
  {
    internalUuid: {
      type: String,
      required: true,
      unique: true,
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

const Patient: Model<IPatient> =
  mongoose.models.Patient ?? mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
