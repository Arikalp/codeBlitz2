/**
 * models/Consent.ts
 *
 * Mongoose model for ABDM-aligned patient consent & report access requests.
 * Allows doctors to request clinical reports and medical records from a patient
 * using their Unique Health ID (e.g. HS-PT-842910).
 *
 * State lifecycle:
 *   pending -> approved (doctor granted access)
 *   pending -> denied
 *   approved -> revoked (patient revokes prior access)
 */

import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export type ConsentStatus = "pending" | "approved" | "denied" | "revoked";

export interface IConsent extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  consentId: string;
  patientUuid: string;
  patientUniqueId: string;
  patientName: string;
  requesterId?: mongoose.Types.ObjectId;
  requestedBy: string;
  facility: string;
  purpose: string;
  requestedRecords: string[];
  status: ConsentStatus;
  requestedAt: Date;
  expiresAt: Date;
  approvedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    consentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientUuid: {
      type: String,
      required: true,
      index: true,
    },
    patientUniqueId: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    facility: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    requestedRecords: {
      type: [String],
      default: ["Diagnostic Lab Reports", "Prescriptions"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "revoked"],
      default: "pending",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    approvedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ConsentSchema.index({ patientUuid: 1, status: 1 });
ConsentSchema.index({ patientUniqueId: 1, status: 1 });

const Consent: Model<IConsent> =
  mongoose.models.Consent ?? mongoose.model<IConsent>("Consent", ConsentSchema);

export default Consent;
