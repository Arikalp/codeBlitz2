/**
 * components/dashboard/PatientSummaryCard.tsx
 *
 * Displays the patient's profile summary at the top of the dashboard.
 * Client component — connects to live authenticated patient data via useAuth(),
 * falling back gracefully to mock demonstration data.
 */

"use client";

import {
  User,
  Phone,
  Mail,
  Droplets,
  ShieldAlert,
  Calendar,
  Fingerprint,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { MOCK_PATIENT } from "@/lib/mock-data";

interface PatientSummaryCardProps {
  patient?: typeof MOCK_PATIENT;
}

export default function PatientSummaryCard({ patient: propPatient }: PatientSummaryCardProps) {
  const { user, patient: authPatient } = useAuth();

  const name = authPatient?.name || propPatient?.name || MOCK_PATIENT.name;
  const email = user?.email || propPatient?.email || MOCK_PATIENT.email;
  const phone = authPatient?.phone || propPatient?.phone || MOCK_PATIENT.phone;
  const gender = authPatient?.gender || propPatient?.gender || MOCK_PATIENT.gender;
  const bloodGroup = authPatient?.bloodGroup || propPatient?.bloodGroup || MOCK_PATIENT.bloodGroup;
  const abhaId = authPatient?.abhaIdDemo || propPatient?.abhaId || MOCK_PATIENT.abhaId;
  const allergies = authPatient?.allergies?.length ? authPatient.allergies : propPatient?.allergies || MOCK_PATIENT.allergies;
  const conditions = authPatient?.conditions?.length ? authPatient.conditions : propPatient?.conditions || MOCK_PATIENT.conditions;
  const internalUuid = authPatient?.uuid;

  const dobStr = authPatient?.dateOfBirth
    ? formatDate(String(authPatient.dateOfBirth))
    : propPatient?.dateOfBirth
    ? formatDate(propPatient.dateOfBirth)
    : formatDate(MOCK_PATIENT.dateOfBirth);

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
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))" }}
          aria-hidden="true"
        >
          {name.charAt(0)}
        </div>

        {/* Primary info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{name}</h2>
            {internalUuid ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                <Fingerprint size={12} />
                UUID: {internalUuid.slice(0, 8)}...
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                ⚠️ DEMO — Synthetic Patient
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-3 capitalize">
            {gender} {bloodGroup ? `· ${bloodGroup}` : ""} · Logged in as {user?.role || "Patient"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <InfoRow icon={Phone} label={phone || "No phone provided"} />
            <InfoRow icon={Mail} label={email} />
            <InfoRow icon={Calendar} label={`DOB: ${dobStr}`} />
            <InfoRow icon={User} label={`ABHA (Demo): ${abhaId || "Unlinked"}`} />
          </div>
        </div>

        {/* Medical flags */}
        <div className="flex flex-col gap-2 text-sm flex-shrink-0">
          {bloodGroup && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100">
              <Droplets size={14} className="text-red-500" />
              <span className="font-semibold text-red-700">{bloodGroup}</span>
            </div>
          )}
          {allergies.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100">
              <ShieldAlert size={14} className="text-orange-500" />
              <span className="text-orange-700 text-xs">Allergic: {allergies.slice(0, 2).join(", ")}{allergies.length > 2 ? ` +${allergies.length - 2}` : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
            Active Health Conditions
          </p>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-medium"
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
