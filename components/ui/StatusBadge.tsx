/**
 * components/ui/StatusBadge.tsx
 *
 * Compact status badge with colour-coded variants.
 */

import type { ConsentStatus, DocumentStatus } from "@/lib/mock-data";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-badge-verified-bg)] text-[var(--color-badge-verified-text)] border-[#D4EAD9]",
  warning: "bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] border-[#F9DECB]",
  error:   "bg-[var(--color-error-container)] text-[var(--color-error-text)] border-[var(--color-error-container)]",
  info:    "bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] border-[#F9DECB]",
  neutral: "bg-[var(--color-badge-lab-bg)] text-[var(--color-badge-lab-text)] border-[#EAE4D7]",
  purple:  "bg-[var(--color-badge-lab-bg)] text-[var(--color-badge-lab-text)] border-[#EAE4D7]",
};

export default function StatusBadge({ label, variant, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wider uppercase",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

// ─── Category helpers ──────────────────────────────────────────────────────

export function categoryBadge(category: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    prescription:      { label: "Prescription",     variant: "info" },
    lab_report:        { label: "Lab Report",       variant: "purple" },
    ct_mri_report:     { label: "CT & MRI Report",  variant: "warning" },
    xray_report:       { label: "X-ray Report",     variant: "warning" },
    imaging:           { label: "Imaging",          variant: "warning" },
    discharge_summary: { label: "Discharge Summary",variant: "neutral" },
    consultation_note: { label: "Consultation Note",variant: "neutral" },
    consultation:      { label: "Consultation",     variant: "neutral" },
    vaccination:       { label: "Vaccination",      variant: "success" },
    other:             { label: "Other Document",   variant: "neutral" },
  };
  const item = map[category] || { label: category.replace(/_/g, " "), variant: "neutral" };
  return <StatusBadge label={item.label} variant={item.variant} />;
}

export function consentBadge(status: ConsentStatus) {
  const map: Record<ConsentStatus, { label: string; variant: BadgeVariant }> = {
    approved: { label: "Approved", variant: "success" },
    pending:  { label: "Pending",  variant: "warning" },
    denied:   { label: "Denied",   variant: "error" },
    revoked:  { label: "Revoked",  variant: "neutral" },
  };
  const { label, variant } = map[status];
  return <StatusBadge label={label} variant={variant} />;
}

export function documentStatusBadge(status: DocumentStatus) {
  const map: Record<DocumentStatus, { label: string; variant: BadgeVariant }> = {
    verified:       { label: "Verified",       variant: "success" },
    pending_review: { label: "Needs Review",   variant: "warning" },
    extracted:      { label: "OCR Extracted",  variant: "info" },
  };
  const { label, variant } = map[status];
  return <StatusBadge label={label} variant={variant} />;
}
