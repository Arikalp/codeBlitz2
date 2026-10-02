/**
 * components/documents/DocumentCard.tsx
 *
 * Card representing a single uploaded document.
 */

import { FileText, Image, Download, Eye } from "lucide-react";
import type { UploadedDocument } from "@/lib/mock-data";
import { documentStatusBadge, categoryBadge } from "@/components/ui/StatusBadge";

interface DocumentCardProps {
  document: UploadedDocument;
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const isPdf = doc.type === "pdf";

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-300)] hover:shadow-md transition-all duration-200 group">
      {/* File icon */}
      <div
        className={[
          "flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl",
          isPdf ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500",
        ].join(" ")}
        aria-hidden="true"
      >
        {isPdf ? <FileText size={22} strokeWidth={1.5} /> : <Image size={22} strokeWidth={1.5} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[var(--color-text-primary)] truncate mb-1">
          {doc.name}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          {documentStatusBadge(doc.status)}
          {categoryBadge(doc.category)}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
          <span>{doc.size}</span>
          <span>🏥 {doc.facility}</span>
          <span>📅 Uploaded {formatDate(doc.uploadedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] transition-colors"
          aria-label={`Preview ${doc.name}`}
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] transition-colors"
          aria-label={`Download ${doc.name}`}
        >
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
