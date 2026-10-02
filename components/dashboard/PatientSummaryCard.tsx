/**
 * components/dashboard/PatientSummaryCard.tsx
 *
 * Displays the patient's profile summary at the top of the dashboard.
 * Server component — receives data as props (ready for backend wiring).
 */

import {
  User,
  Phone,
  Mail,
  Droplets,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import Card from "@/components/ui/Card";
import type { MOCK_PATIENT } from "@/lib/mock-data";

type Patient = typeof MOCK_PATIENT;

interface PatientSummaryCardProps {
  patient: Patient;
}

export default function PatientSummaryCard({ patient }: PatientSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Decorative gradient strip */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-500))" }}
      />

      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {/* Avatar */}
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))" }}
          aria-hidden="true"
        >
          {patient.name.charAt(0)}
        </div>

        {/* Primary info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{patient.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              ⚠️ DEMO — Synthetic Patient
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            {patient.age} years · {patient.gender} · {patient.bloodGroup}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <InfoRow icon={Phone} label={patient.phone} />
            <InfoRow icon={Mail} label={patient.email} />
            <InfoRow icon={Calendar} label={`DOB: ${formatDate(patient.dateOfBirth)}`} />
            <InfoRow icon={User} label={`ABHA (Demo): ${patient.abhaId}`} />
          </div>
        </div>

        {/* Medical flags */}
        <div className="flex flex-col gap-2 text-sm flex-shrink-0">
          {patient.bloodGroup && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100">
              <Droplets size={14} className="text-red-500" />
              <span className="font-semibold text-red-700">{patient.bloodGroup}</span>
            </div>
          )}
          {patient.allergies.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100">
              <ShieldAlert size={14} className="text-orange-500" />
              <span className="text-orange-700 text-xs">Allergic: {patient.allergies.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      {patient.conditions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
            Active Conditions
          </p>
          <div className="flex flex-wrap gap-2">
            {patient.conditions.map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoRow({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
      <Icon size={13} className="flex-shrink-0 text-[var(--color-text-muted)]" />
      <span className="truncate text-xs">{label}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
