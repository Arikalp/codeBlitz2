/**
 * components/timeline/TimelineItem.tsx
 *
 * A single entry in the longitudinal medical timeline styled with the
 * Warm Parchment Clinical design system: continuous amber connector rail,
 * circular node icons, and inset clinical metrics sub-cards.
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
  CheckCircle,
  Building2,
  UserRound,
  Bot,
} from "lucide-react";
import Link from "next/link";
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

  const categoryLabel =
    RECORD_CATEGORY_LABELS[record.category as keyof typeof RECORD_CATEGORY_LABELS] ||
    record.category.replace(/_/g, " ");

  const isLab = record.category === "lab_report";
  const isConsultation = record.category.includes("consultation");
  const isPrescription = record.category === "prescription";

  const badgeStyle = isLab
    ? "bg-[var(--color-badge-lab-bg)] text-[var(--color-badge-lab-text)] border-[#EAE4D7]"
    : isConsultation
    ? "bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] border-[#F9DECB]"
    : isPrescription
    ? "bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] border-[#F9DECB]"
    : "bg-[var(--color-surface-container-high)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]";

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Continuous Amber Spine Rail */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-[19px] sm:left-[21px] top-6 bottom-0 w-[2px] bg-[var(--color-timeline-connector)] opacity-60"
        />
      )}

      {/* Node Icon */}
      <div
        className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--color-timeline-node-bg)] border border-[var(--color-border-subtle)] shadow-sm flex items-center justify-center shrink-0 text-[var(--color-primary-container)] group-hover:scale-105 transition-transform"
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>

      {/* Card Container */}
      <div className="flex-1 pb-10 min-w-0">
        <div className="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border-subtle)] p-5 sm:p-6 shadow-sm hover:shadow-warm hover:border-[var(--color-primary-container)]/40 transition-all duration-200">
          {/* Card Header & Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase border font-semibold ${badgeStyle}`}>
                {categoryLabel}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] text-[11px] font-mono font-semibold uppercase tracking-wider">
                <CheckCircle size={11} /> Verified
              </span>
            </div>
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              {formatDate(record.clinicalDate)}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-heading font-bold text-lg text-[var(--color-text-primary)]">
            {record.title}
          </h2>

          {/* Facility & Clinician Info */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] font-mono">
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-[var(--color-text-muted)]" />
              <span>Facility: <strong className="text-[var(--color-text-primary)] font-medium">{record.facility}</strong></span>
            </div>
            {record.doctor && (
              <div className="flex items-center gap-1.5">
                <UserRound size={12} className="text-[var(--color-text-muted)]" />
                <span>Clinician: <strong className="text-[var(--color-text-primary)] font-medium">{record.doctor}</strong></span>
              </div>
            )}
          </div>

          {/* Key Details Inset Container */}
          {record.summary && (
            <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)]/70">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1.5">
                Clinical Details
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {record.summary}
              </p>
            </div>
          )}

          {/* Actions & Tags Footer */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {record.hasDocument && record.documentId ? (
                <button
                  type="button"
                  onClick={() => onViewDocument?.(record.documentId!, record.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-container-high)] text-[var(--color-text-primary)] hover:bg-[var(--color-timeline-node-bg)] text-xs font-semibold transition-colors cursor-pointer border border-[var(--color-border-subtle)]"
                >
                  <ExternalLink size={13} />
                  <span>View Original PDF</span>
                </button>
              ) : null}

              <Link
                href="/dashboard/ai"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] hover:opacity-90 text-xs font-semibold transition-opacity border border-[#F9DECB]"
              >
                <Bot size={13} />
                <span>Explain with AI</span>
              </Link>
            </div>

            {record.tags && record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {record.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-text-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
