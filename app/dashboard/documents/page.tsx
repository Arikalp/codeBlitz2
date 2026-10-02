/**
 * app/dashboard/documents/page.tsx
 *
 * /dashboard/documents — Uploaded medical documents.
 */

import type { Metadata } from "next";
import { FolderOpen, Upload, Search } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import DocumentCard from "@/components/documents/DocumentCard";
import EmptyState from "@/components/ui/EmptyState";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  const verified      = MOCK_DOCUMENTS.filter((d) => d.status === "verified");
  const needsReview   = MOCK_DOCUMENTS.filter((d) => d.status === "pending_review");
  const ocr           = MOCK_DOCUMENTS.filter((d) => d.status === "extracted");

  return (
    <AppShell title="My Documents">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Medical Documents</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {MOCK_DOCUMENTS.length} documents · {needsReview.length} need review
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
              <Search size={15} />
              <span className="text-xs">Search documents…</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-medium hover:bg-[var(--color-brand-700)] transition-colors shadow-sm"
            >
              <Upload size={15} />
              Upload
            </button>
          </div>
        </div>

        {/* Demo notice */}
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
          ⚠️ <strong>Demo Mode</strong> — Documents shown are synthetic. Upload functionality will be available in a future release.
        </div>

        {/* Needs review */}
        {needsReview.length > 0 && (
          <Section title="Needs Review" count={needsReview.length} accent="amber">
            {needsReview.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </Section>
        )}

        {/* OCR extracted */}
        {ocr.length > 0 && (
          <Section title="OCR Extracted — Verify fields" count={ocr.length} accent="blue">
            {ocr.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </Section>
        )}

        {/* Verified */}
        <Section title="Verified Documents" count={verified.length}>
          {verified.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No verified documents" description="Uploaded and verified documents will appear here." />
          ) : (
            verified.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent?: "amber" | "blue";
  children: React.ReactNode;
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-600"
      : accent === "blue"
      ? "text-blue-600"
      : "text-[var(--color-text-muted)]";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
          {title}
        </h2>
        <span className={["text-xs font-bold", accentClass].join(" ")}>({count})</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
