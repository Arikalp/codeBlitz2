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
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50  text-amber-800  border-amber-200",
  error:   "bg-red-50    text-red-800    border-red-200",
  info:    "bg-[var(--color-brand-50)] text-[var(--color-accent-500)] border-[var(--color-border)]",
  neutral: "bg-stone-50  text-stone-700  border-stone-200",
  purple:  "bg-orange-50 text-orange-800 border-orange-200",
};

export default function StatusBadge({ label, variant, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium",
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
