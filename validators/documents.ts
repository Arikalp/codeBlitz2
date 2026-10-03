/**
 * validators/documents.ts
 *
 * Zod schemas and security validation rules for medical document uploads.
 * Enforces file size limits, MIME type verification, extension checks,
 * and metadata sanitization.
 */

import { z } from "zod";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

export const RECORD_CATEGORIES = [
  "prescription",
  "ct_mri_report",
  "xray_report",
  "lab_report",
  "discharge_summary",
  "consultation_note",
  "other",
] as const;

export const RECORD_CATEGORY_LABELS: Record<(typeof RECORD_CATEGORIES)[number], string> = {
  prescription: "Prescription",
  ct_mri_report: "CT / MRI Report",
  xray_report: "X-ray Report",
  lab_report: "Laboratory Report",
  discharge_summary: "Discharge Summary",
  consultation_note: "Consultation Note",
  other: "Other Medical Document",
};

export const documentUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(300, "Title is too long"),
  recordCategory: z.enum(RECORD_CATEGORIES, {
    message: "Select a valid medical record category",
  }),
  clinicalDate: z
    .string()
    .min(1, "Examination/clinical date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid clinical date",
    }),
  facility: z
    .string()
    .trim()
    .min(2, "Facility or hospital name is required")
    .max(300, "Facility name is too long"),
  practitioner: z
    .string()
    .trim()
    .max(200, "Doctor name is too long")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  notes: z
    .string()
    .trim()
    .max(4000, "Notes are too long")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  encounterId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * Validate file properties: size, MIME type, and extension.
 */
export function validateUploadedFile(file: File | { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum size of 10 MB (file is ${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: "File cannot be empty (0 bytes)" };
  }

  const mime = file.type.toLowerCase();
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(mime as (typeof ALLOWED_MIME_TYPES)[number]);

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);

  if (!isAllowedMime || !isAllowedExt) {
    return {
      valid: false,
      error: `Invalid file format "${file.type || ext}". Only PDF, JPG, JPEG, and PNG files are accepted.`,
    };
  }

  return { valid: true };
}
