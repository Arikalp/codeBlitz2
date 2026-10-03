/**
 * components/timeline/TimelineItem.tsx
 *
 * A single entry in the longitudinal medical timeline.
 * Displays clinical event date, facility, doctor, category badge, and interactive
 * document view triggers.
 */

"use client";

import {
  FileText,
  FlaskConical,
  Scan,
  ClipboardList,
  Syringe,
  Stethoscope,
  ExternalLink,
} from "lucide-react";
import { RECORD_CATEGORY_LABELS } from "@/validators/documents";

export interface TimelineRecordItem {
  id: string;
  title: string;
  category: string;
  clinicalDate: string;
  facility: string;
  doctor?: string;
  summary: string;
  tags: string[];
  hasDocument: boolean;
  documentId?: string | null;
  source?: string;
}

const ICONS: Record<string, typeof FileText> = {
  prescription: ClipboardList,
  ct_mri_report: Scan,
  xray_report: Scan,
  imaging: Scan,
  lab_report: FlaskConical,
  discharge_summary: FileText,
  consultation_note: Stethoscope,
  consultation: Stethoscope,
  vaccination: Syringe,
  other: FileText,
};

const ICON_COLORS: Record<string, string> = {
  prescription: "bg-blue-100 text-blue-600 border-blue-200",
  ct_mri_report: "bg-amber-100 text-amber-600 border-amber-200",
  xray_report: "bg-amber-100 text-amber-600 border-amber-200",
  imaging: "bg-amber-100 text-amber-600 border-amber-200",
  lab_report: "bg-violet-100 text-violet-600 border-violet-200",
  discharge_summary: "bg-slate-100 text-slate-600 border-slate-200",
  consultation_note: "bg-teal-100 text-teal-600 border-teal-200",
  consultation: "bg-teal-100 text-teal-600 border-teal-200",
  vaccination: "bg-emerald-100 text-emerald-600 border-emerald-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

interface TimelineItemProps {
  record: TimelineRecordItem;
  isLast?: boolean;
  onViewDocument?: (docId: string, title: string) => void;
}

export default function TimelineItem({
  record,
  isLast = false,
  onViewDocument,
}: TimelineItemProps) {
  const Icon = ICONS[record.category] || FileText;
  const iconColor = ICON_COLORS[record.category] || "bg-gray-100 text-gray-600 border-gray-200";

  const categoryLabel =
    RECORD_CATEGORY_LABELS[record.category as keyof typeof RECORD_CATEGORY_LABELS] ||
    record.category.replace(/_/g, " ");

  return (
    <div className="relative flex gap-4">
      {/* Connector line */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-5 top-10 bottom-0 w-px bg-[var(--color-border)]"
        />
      )}

      {/* Icon node */}
      <div
        className={[
          "relative z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-xs",
          iconColor,
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={2} />
      </div>

      {/* Content card */}
      <div className="flex-1 pb-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-brand-300)] hover:shadow-md transition-all duration-200">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-semibold text-[var(--color-brand-700)] mb-0.5">
                Clinical Date: {formatDate(record.clinicalDate)}
              </p>
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                {record.title}
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {categoryLabel}
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
            {record.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span>🏥 {record.facility}</span>
            <span>👤 {record.doctor}</span>

            {record.hasDocument && record.documentId && (
              <button
                type="button"
                onClick={() => onViewDocument?.(record.documentId!, record.title)}
                className="text-[var(--color-brand-600)] font-semibold hover:underline flex items-center gap-1 ml-auto"
              >
                <span>View Attached Document</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>

          {record.tags && record.tags.length > 0 && (
            <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex flex-wrap gap-1.5">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
