/**
 * models/DocumentExtraction.ts
 *
 * Mongoose model for AI/OCR document extractions.
 * Stores extracted text, structured clinical fields, confidence indicators,
 * and user review status separately from the original Document.
 *
 * Medical Safety Constraints:
 * - Preserves the original file untouched.
 * - Tracks confidence and uncertainty indicators.
 * - Extracted fields are drafts until explicitly reviewed and confirmed by the patient.
 * - Error details contain only safe, sanitized operational logs without sensitive clinical data.
 */

import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";
import type { MedicalRecordCategory } from "./ClinicalRecord";

export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";
export type ExtractedFormat = "digital_pdf" | "scanned_pdf" | "image" | "unknown";

export interface IMeasurement {
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  flag?: "normal" | "high" | "low" | "abnormal";
}

export interface IStructuredExtraction {
  documentType: MedicalRecordCategory;
  title: string;
  clinicalDate?: string | null;
  facility?: string | null;
  clinician?: string | null;
  findings?: string | null;
  impression?: string | null;
  measurements?: IMeasurement[];
}

export interface IDocumentExtraction extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  patientUuid: string;
  status: ExtractionStatus;
  extractedFormat: ExtractedFormat;
  rawText: string;
  structuredData: IStructuredExtraction;
  confidenceScore: number;
  uncertainFields: string[];
  userReviewed: boolean;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  correctedData?: Partial<IStructuredExtraction> | null;
  errorDetails?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const MeasurementSubSchema = new Schema<IMeasurement>(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    unit: { type: String, trim: true },
    referenceRange: { type: String, trim: true },
    flag: {
      type: String,
      enum: ["normal", "high", "low", "abnormal"],
      default: "normal",
    },
  },
  { _id: false }
);

const StructuredDataSubSchema = new Schema<IStructuredExtraction>(
  {
    documentType: {
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
      default: "other",
    },
    title: { type: String, default: "Extracted Medical Report" },
    clinicalDate: { type: String, default: null },
    facility: { type: String, default: null },
    clinician: { type: String, default: null },
    findings: { type: String, default: null },
    impression: { type: String, default: null },
    measurements: { type: [MeasurementSubSchema], default: [] },
  },
  { _id: false }
);

const DocumentExtractionSchema = new Schema<IDocumentExtraction>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    patientUuid: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    extractedFormat: {
      type: String,
      enum: ["digital_pdf", "scanned_pdf", "image", "unknown"],
      default: "unknown",
    },
    rawText: {
      type: String,
      default: "",
    },
    structuredData: {
      type: StructuredDataSubSchema,
      default: () => ({}),
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8,
    },
    uncertainFields: {
      type: [String],
      default: [],
    },
    userReviewed: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    correctedData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    errorDetails: {
      type: String,
      default: null,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

DocumentExtractionSchema.index({ documentId: 1, patientUuid: 1 });

const DocumentExtraction: Model<IDocumentExtraction> =
  mongoose.models.DocumentExtraction ??
  mongoose.model<IDocumentExtraction>("DocumentExtraction", DocumentExtractionSchema);

export default DocumentExtraction;
