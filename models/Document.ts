/**
 * models/Document.ts
 *
 * Mongoose model for uploaded medical documents (prescriptions, diagnostic scans, lab reports).
 *
 * Security:
 * - Documents belong strictly to a single patient identified by `patientUuid`.
 * - Never store public URLs as sole access control.
 * - Files are accessed exclusively via authorized API streams after validating session ownership.
 */

import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";
import type { MedicalRecordCategory } from "./ClinicalRecord";

export type DocumentStatus = "verified" | "pending_review" | "extracted";
export type StorageProviderType = "cloudinary" | "local";

export interface IDocument extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  patientUuid: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  recordCategory: MedicalRecordCategory;
  /** Clinical date of examination/record — tracked separately from upload timestamp */
  clinicalDate: Date;
  facility: string;
  practitioner?: string;
  notes?: string;
  storageKey: string;
  storageProvider: StorageProviderType;
  status: DocumentStatus;
  encounterId?: mongoose.Types.ObjectId;
  clinicalRecordId?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    patientUuid: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },
    recordCategory: {
      type: String,
      enum: [
        "prescription",
        "ct_mri_report",
        "xray_report",
        "lab_report",
        "discharge_summary",
        "consultation_note",
        "other",
      ],
      required: true,
      index: true,
    },
    clinicalDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    facility: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    practitioner: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "local"],
      required: true,
      default: "cloudinary",
    },
    status: {
      type: String,
      enum: ["verified", "pending_review", "extracted"],
      default: "verified",
    },
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
    },
    clinicalRecordId: {
      type: Schema.Types.ObjectId,
      ref: "ClinicalRecord",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for active document queries by patient
DocumentSchema.index({ patientUuid: 1, deletedAt: 1, clinicalDate: -1 });

const Document: Model<IDocument> =
  mongoose.models.Document ?? mongoose.model<IDocument>("Document", DocumentSchema);

export default Document;
