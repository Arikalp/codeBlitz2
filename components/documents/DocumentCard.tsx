/**
 * components/documents/DocumentCard.tsx
 *
 * Card representing a medical document with secure preview, download, delete,
 * and AI extraction review actions.
 * Displays clinical examination date, facility, practitioner, record category,
 * and AI extraction review status badge.
 */

"use client";

import {
  FileText,
  ImageIcon,
  Download,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { RECORD_CATEGORY_LABELS, type RECORD_CATEGORIES } from "@/validators/documents";

export interface DocumentItem {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  recordCategory: (typeof RECORD_CATEGORIES)[number] | string;
  clinicalDate: string | Date;
  facility: string;
  practitioner?: string | null;
  notes?: string | null;
  status: "verified" | "pending_review" | "extracted";
  extraction?: {
    id: string;
    status: "pending" | "processing" | "completed" | "failed";
    userReviewed: boolean;
    confidenceScore?: number;
    uncertainFields?: string[];
  } | null;
  createdAt?: string | Date;
}

interface DocumentCardProps {
  document: DocumentItem;
  onPreview: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
  onReviewExtraction?: (docId: string) => void;
}

export default function DocumentCard({
  document: doc,
  onPreview,
  onDelete,
  onReviewExtraction,
}: DocumentCardProps) {
  const isPdf = doc.mimeType === "application/pdf" || doc.originalFileName.endsWith(".pdf");
  const downloadUrl = `/api/documents/${doc.id}/download`;

  const categoryLabel =
    RECORD_CATEGORY_LABELS[doc.recordCategory as keyof typeof RECORD_CATEGORY_LABELS] ||
    doc.recordCategory.replace(/_/g, " ");

  const ext = doc.extraction;
  const isReviewed = ext?.userReviewed || doc.status === "verified";
  const isProcessing = ext?.status === "processing" || ext?.status === "pending";
  const isReadyForReview = ext?.status === "completed" && !ext?.userReviewed;
  const isFailed = ext?.status === "failed";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-300)] hover:shadow-md transition-all duration-200 group">
      {/* File type icon & details */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={[
            "flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs",
            isPdf
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-blue-50 text-blue-600 border border-blue-100",
          ].join(" ")}
          aria-hidden="true"
        >
          {isPdf ? <FileText size={24} strokeWidth={1.8} /> : <ImageIcon size={24} strokeWidth={1.8} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-sm text-[var(--color-text-primary)] truncate max-w-md">
              {doc.title}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border border-[var(--color-brand-200)]">
              {categoryLabel}
            </span>

            {/* AI Extraction Status Pill */}
            {isReviewed ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} />
                <span>Patient Verified</span>
              </span>
            ) : isReadyForReview ? (
              <button
                type="button"
                onClick={() => onReviewExtraction?.(doc.id)}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors animate-pulse"
              >
                <Sparkles size={11} className="text-amber-700" />
                <span>Review Extracted Data</span>
              </button>
            ) : isProcessing ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                <Clock size={11} className="animate-spin" />
                <span>Extracting...</span>
              </span>
            ) : isFailed ? (
              <button
                type="button"
                onClick={() => onReviewExtraction?.(doc.id)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              >
                <AlertCircle size={11} />
                <span>Retry Extraction</span>
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3.5 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1 font-medium text-[var(--color-text-secondary)]">
              <Calendar size={13} className="text-[var(--color-brand-500)]" />
              Examined: {formatDate(String(doc.clinicalDate))}
            </span>
            <span className="flex items-center gap-1">
              <Building2 size={13} /> {doc.facility}
            </span>
            {doc.practitioner && (
              <span className="flex items-center gap-1">
                <Stethoscope size={13} /> {doc.practitioner}
              </span>
            )}
            <span>{(doc.fileSizeBytes / 1024).toFixed(0)} KB</span>
          </div>

          {doc.notes && (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-1 italic">
              &quot;{doc.notes}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)] w-full sm:w-auto justify-end">
        {onReviewExtraction && (
          <button
            type="button"
            onClick={() => onReviewExtraction(doc.id)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] border border-[var(--color-brand-200)] transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Review AI structured extraction"
          >
            <Sparkles size={14} className="text-[var(--color-brand-600)]" />
            <span>Review Data</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onPreview(doc)}
          className="p-2 rounded-xl hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1 text-xs font-semibold"
          aria-label={`Preview ${doc.title}`}
          title="Preview document"
        >
          <Eye size={16} />
          <span className="sm:hidden">Preview</span>
        </button>

        <a
          href={downloadUrl}
          download
          className="p-2 rounded-xl hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1 text-xs font-semibold"
          aria-label={`Download ${doc.title}`}
          title="Download file"
        >
          <Download size={16} />
          <span className="sm:hidden">Download</span>
        </a>

        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          className="p-2 rounded-xl hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-600 transition-colors flex items-center gap-1 text-xs font-semibold"
          aria-label={`Delete ${doc.title}`}
          title="Delete document"
        >
          <Trash2 size={16} />
          <span className="sm:hidden">Delete</span>
        </button>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
