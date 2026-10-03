/**
 * components/documents/DocumentPreviewModal.tsx
 *
 * In-app preview modal for authenticated medical documents (PDF & Images).
 * Fetches content directly from the secure /api/documents/[id]/view endpoint.
 */

"use client";

import { X, Download, FileText, Calendar, Building2, Stethoscope } from "lucide-react";
import Button from "@/components/ui/Button";

interface PreviewDoc {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  facility: string;
  practitioner?: string | null;
  clinicalDate: string | Date;
}

interface DocumentPreviewModalProps {
  document: PreviewDoc | null;
  onClose: () => void;
}

export default function DocumentPreviewModal({
  document: doc,
  onClose,
}: DocumentPreviewModalProps) {
  if (!doc) return null;

  const isPdf = doc.mimeType === "application/pdf";
  const viewUrl = `/api/documents/${doc.id}/view`;
  const downloadUrl = `/api/documents/${doc.id}/download`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <div className="min-w-0 pr-4">
            <h2
              id="preview-modal-title"
              className="text-base font-bold text-[var(--color-text-primary)] truncate"
            >
              {doc.title}
            </h2>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)] mt-0.5">
              <span className="flex items-center gap-1">
                <Building2 size={12} /> {doc.facility}
              </span>
              {doc.practitioner && (
                <span className="flex items-center gap-1">
                  <Stethoscope size={12} /> {doc.practitioner}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {formatDate(String(doc.clinicalDate))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={downloadUrl} download>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-4 overflow-auto bg-slate-900/5 flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <iframe
              src={viewUrl}
              title={doc.title}
              className="w-full h-[65vh] rounded-xl border border-[var(--color-border)] bg-white shadow-xs"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewUrl}
              alt={doc.title}
              className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md border border-[var(--color-border)] bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1 truncate max-w-md">
            <FileText size={13} /> {doc.originalFileName} ({doc.mimeType})
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
            ✓ End-to-end Encrypted
          </span>
        </div>
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
