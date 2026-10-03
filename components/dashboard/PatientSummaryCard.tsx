/**
 * components/dashboard/PatientSummaryCard.tsx
 *
 * Displays the patient's profile summary at the top of the dashboard.
 * Client component — connects to live authenticated patient data via useAuth().
 * Shows a clear placeholder when no live session data is available.
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

export default function PatientSummaryCard() {
  const { user, patient: authPatient, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="flex gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-surface-muted)]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 rounded bg-[var(--color-surface-muted)]" />
            <div className="h-4 w-32 rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          Not authenticated — please log in.
        </p>
      </Card>
    );
  }

  const name = authPatient?.name || user.email;
  const email = user.email;
  const phone = authPatient?.phone;
  const gender = authPatient?.gender;
  const bloodGroup = authPatient?.bloodGroup;
  const abhaId = authPatient?.abhaIdDemo;
  const allergies = authPatient?.allergies ?? [];
  const conditions = authPatient?.conditions ?? [];
  const internalUuid = authPatient?.uuid;

  const dobStr = authPatient?.dateOfBirth
    ? formatDate(String(authPatient.dateOfBirth))
    : null;

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Profile loading...
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-3 capitalize">
            {gender ? `${gender} ` : ""}{bloodGroup ? `· ${bloodGroup} ` : ""}· Logged in as {user.role}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {phone && <InfoRow icon={Phone} label={phone} />}
            <InfoRow icon={Mail} label={email} />
            {dobStr && <InfoRow icon={Calendar} label={`DOB: ${dobStr}`} />}
            <InfoRow icon={User} label={`ABHA: ${abhaId || "Not linked"}`} />
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
