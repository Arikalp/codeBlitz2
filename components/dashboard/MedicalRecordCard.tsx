/**
 * components/dashboard/MedicalRecordCard.tsx
 *
 * Card displaying a single clinical record in the Warm Parchment Clinical style.
 * Features structured metadata, category icons, and an inset key details sub-card.
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
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { categoryBadge } from "@/components/ui/StatusBadge";

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  prescription:      ClipboardList,
  lab_report:        FlaskConical,
  ct_mri_report:     Scan,
  xray_report:       Scan,
  imaging:           Scan,
  discharge_summary: FileText,
  consultation_note: Stethoscope,
  vaccination:       Syringe,
  consultation:      Stethoscope,
  other:             FileText,
};

interface MedicalRecordCardProps {
  record: {
    id: string;
    category: string;
    title: string;
    facility: string;
    doctor?: string;
    clinicalDate: string;
    summary: string;
    tags?: string[];
    hasDocument?: boolean;
  };
  onClick?: () => void;
}

export default function MedicalRecordCard({ record, onClick }: MedicalRecordCardProps) {
  const Icon = CATEGORY_ICONS[record.category] || FileText;

  return (
    <article
      onClick={onClick}
      className="w-full text-left group flex items-start gap-4 p-4 sm:p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] hover:border-[var(--color-primary-container)]/50 hover:shadow-warm transition-all duration-200 cursor-pointer relative"
    >
      {/* Category Node Icon */}
      <div
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-timeline-node-bg)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] flex-shrink-0 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
        aria-hidden="true"
      >
        <Icon size={20} strokeWidth={2} className="text-[var(--color-primary-container)]" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            {categoryBadge(record.category)}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] text-[11px] font-mono font-semibold uppercase tracking-wider">
              <CheckCircle size={11} /> Verified
            </span>
          </div>
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {formatDate(record.clinicalDate)}
          </span>
        </div>

        <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-container)] transition-colors">
          {record.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] mt-1 font-mono">
          <span className="flex items-center gap-1.5">
            <Building2 size={12} className="text-[var(--color-text-muted)]" />
            <span>Facility: <strong className="text-[var(--color-text-primary)] font-medium">{record.facility}</strong></span>
          </span>
          {record.doctor && (
            <span className="flex items-center gap-1.5">
              <UserRound size={12} className="text-[var(--color-text-muted)]" />
              <span>Clinician: <strong className="text-[var(--color-text-primary)] font-medium">{record.doctor}</strong></span>
            </span>
          )}
        </div>

        {/* Key Summary Inset Box */}
        {record.summary && (
          <div className="mt-3 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)]/70 rounded-lg p-3">
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider block mb-1">
              Clinical Summary
            </span>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {record.summary}
            </p>
          </div>
        )}

        {record.hasDocument && (
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-mono text-[var(--color-primary-container)] font-semibold">
            <FileCheck size={13} />
            <span>Original digital scan attached · Click to view</span>
          </div>
        )}
      </div>
    </article>
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
