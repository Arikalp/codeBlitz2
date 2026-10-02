/**
 * components/dashboard/MedicalRecordCard.tsx
 *
 * Card displaying a single medical record in a list.
 */

import {
  FileText,
  FlaskConical,
  Scan,
  ClipboardList,
  Syringe,
  Stethoscope,
  Building2,
  CalendarDays,
  UserRound,
  ChevronRight,
} from "lucide-react";
import type { MedicalRecord, RecordCategory } from "@/lib/mock-data";
import { categoryBadge } from "@/components/ui/StatusBadge";

const CATEGORY_ICONS: Record<RecordCategory, typeof FileText> = {
  prescription:     ClipboardList,
  lab_report:       FlaskConical,
  imaging:          Scan,
  discharge_summary: FileText,
  vaccination:      Syringe,
  consultation:     Stethoscope,
};

const CATEGORY_COLORS: Record<RecordCategory, string> = {
  prescription:     "bg-blue-50 text-blue-600",
  lab_report:       "bg-violet-50 text-violet-600",
  imaging:          "bg-amber-50 text-amber-600",
  discharge_summary: "bg-slate-100 text-slate-600",
  vaccination:      "bg-emerald-50 text-emerald-600",
  consultation:     "bg-teal-50 text-teal-600",
};

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onClick?: () => void;
}

export default function MedicalRecordCard({ record, onClick }: MedicalRecordCardProps) {
  const Icon = CATEGORY_ICONS[record.category];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left group flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-300)] hover:shadow-md transition-all duration-200"
    >
      {/* Icon */}
      <div
        className={[
          "flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl",
          CATEGORY_COLORS[record.category],
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
            {record.title}
          </span>
          {categoryBadge(record.category)}
        </div>

        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-2">
          {record.summary}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <CalendarDays size={11} /> {formatDate(record.clinicalDate)}
          </span>
          <span className="flex items-center gap-1">
            <Building2 size={11} /> {record.facility}
          </span>
          <span className="flex items-center gap-1">
            <UserRound size={11} /> {record.doctor}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight
        size={16}
        className="flex-shrink-0 mt-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)] transition-colors"
      />
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
