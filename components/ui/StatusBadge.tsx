/**
 * components/ui/StatusBadge.tsx
 *
 * Compact status badge with colour-coded variants.
 */

import type { RecordCategory, ConsentStatus, DocumentStatus } from "@/lib/mock-data";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50  text-amber-700  border-amber-200",
  error:   "bg-red-50    text-red-700    border-red-200",
  info:    "bg-blue-50   text-blue-700   border-blue-200",
  neutral: "bg-slate-50  text-slate-600  border-slate-200",
  purple:  "bg-violet-50 text-violet-700 border-violet-200",
};

export default function StatusBadge({ label, variant, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

// ─── Category helpers ──────────────────────────────────────────────────────

export function categoryBadge(category: RecordCategory) {
  const map: Record<RecordCategory, { label: string; variant: BadgeVariant }> = {
    prescription:    { label: "Prescription",    variant: "info" },
    lab_report:      { label: "Lab Report",      variant: "purple" },
    imaging:         { label: "Imaging",         variant: "warning" },
    discharge_summary: { label: "Discharge",     variant: "neutral" },
    vaccination:     { label: "Vaccination",     variant: "success" },
    consultation:    { label: "Consultation",    variant: "neutral" },
  };
  const { label, variant } = map[category];
  return <StatusBadge label={label} variant={variant} />;
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
