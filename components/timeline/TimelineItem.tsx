/**
 * components/timeline/TimelineItem.tsx
 *
 * A single entry in the longitudinal medical timeline.
 */

import {
  FileText,
  FlaskConical,
  Scan,
  ClipboardList,
  Syringe,
  Stethoscope,
} from "lucide-react";
import type { MedicalRecord, RecordCategory } from "@/lib/mock-data";
import { categoryBadge } from "@/components/ui/StatusBadge";

const ICONS: Record<RecordCategory, typeof FileText> = {
  prescription:     ClipboardList,
  lab_report:       FlaskConical,
  imaging:          Scan,
  discharge_summary: FileText,
  vaccination:      Syringe,
  consultation:     Stethoscope,
};

const ICON_COLORS: Record<RecordCategory, string> = {
  prescription:     "bg-blue-100 text-blue-600 border-blue-200",
  lab_report:       "bg-violet-100 text-violet-600 border-violet-200",
  imaging:          "bg-amber-100 text-amber-600 border-amber-200",
  discharge_summary: "bg-slate-100 text-slate-600 border-slate-200",
  vaccination:      "bg-emerald-100 text-emerald-600 border-emerald-200",
  consultation:     "bg-teal-100 text-teal-600 border-teal-200",
};

interface TimelineItemProps {
  record: MedicalRecord;
  isLast?: boolean;
}

export default function TimelineItem({ record, isLast = false }: TimelineItemProps) {
  const Icon = ICONS[record.category];

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
          "relative z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border-2",
          ICON_COLORS[record.category],
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={2} />
      </div>

      {/* Content card */}
      <div className="flex-1 pb-8">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">
                {formatDate(record.clinicalDate)}
              </p>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                {record.title}
              </h3>
            </div>
            {categoryBadge(record.category)}
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
            {record.summary}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
            <span>🏥 {record.facility}</span>
            <span>👤 {record.doctor}</span>
            {record.hasDocument && (
              <span className="text-[var(--color-brand-600)] font-medium cursor-pointer hover:underline">
                📄 View Document
              </span>
            )}
          </div>

          {record.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
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
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
