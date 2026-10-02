/**
 * models/ClinicalRecord.ts
 *
 * Mongoose model for entries in the patient's longitudinal health timeline.
 * Represents clinical events: prescriptions, imaging reports, lab results,
 * consultation notes, and discharge summaries.
 *
 * Requirements:
 * - Tracks clinical date separately from upload date.
 * - Timeline queries use `clinicalDate` for clinical accuracy.
 * - Links to Document and Encounter where applicable.
 */

import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export type MedicalRecordCategory =
  | "prescription"
  | "ct_mri_report"
  | "xray_report"
  | "lab_report"
  | "discharge_summary"
  | "consultation_note"
  | "other";

export type RecordSource =
  | "patient_upload"
  | "hospital_system"
  | "abdm_consent"
  | "demo_seed";

export interface IClinicalRecord extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  patientUuid: string;
  encounterId?: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  title: string;
  category: MedicalRecordCategory;
  /** Clinical date of examination/consultation — separate from record creation timestamp */
  clinicalDate: Date;
  facility: string;
  practitioner?: string;
  summary: string;
  tags: string[];
  source: RecordSource;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicalRecordSchema = new Schema<IClinicalRecord>(
  {
    patientUuid: {
      type: String,
      required: true,
      index: true,
    },
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    category: {
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
    summary: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ["patient_upload", "hospital_system", "abdm_consent", "demo_seed"],
      default: "patient_upload",
    },
  },
  { timestamps: true }
);

// Compound index for timeline chronological ordering by patient
ClinicalRecordSchema.index({ patientUuid: 1, clinicalDate: -1 });

const ClinicalRecord: Model<IClinicalRecord> =
  mongoose.models.ClinicalRecord ??
  mongoose.model<IClinicalRecord>("ClinicalRecord", ClinicalRecordSchema);

export default ClinicalRecord;
