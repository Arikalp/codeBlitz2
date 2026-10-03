/**
 * components/dashboard/PatientSummaryCard.tsx
 *
 * Displays the patient's profile overview at the top of the dashboard.
 * Styled in the Warm Parchment Clinical design system:
 * terracotta avatar, active Patient Unique Health ID card, and contextual clinical tags.
 * Client component — connects to live authenticated patient data via useAuth().
 */

"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Droplets,
  ShieldAlert,
  Fingerprint,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

export default function PatientSummaryCard() {
  const { user, patient: authPatient, isLoading } = useAuth();
  const [copiedId, setCopiedId] = useState(false);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="flex gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-surface-container-high)]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 rounded bg-[var(--color-surface-container-high)]" />
            <div className="h-4 w-32 rounded bg-[var(--color-surface-container-high)]" />
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

  const name = authPatient?.name || user.email?.split("@")[0] || "Patient";
  const email = user.email;
  const phone = authPatient?.phone;
  const gender = authPatient?.gender;
  const bloodGroup = authPatient?.bloodGroup;
  const allergies = authPatient?.allergies ?? [];
  const conditions = authPatient?.conditions ?? [];
  const internalUuid = authPatient?.uuid;
  const patientUniqueId =
    authPatient?.patientUniqueId ||
    (internalUuid ? `HS-PT-${internalUuid.slice(0, 6).toUpperCase()}` : "HS-PT-842910");

  function handleCopyId() {
    navigator.clipboard.writeText(patientUniqueId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  const dobStr = authPatient?.dateOfBirth
    ? formatDate(String(authPatient.dateOfBirth))
    : null;

  return (
    <Card className="relative overflow-hidden p-5 sm:p-7 shadow-sm border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
      {/* Terracotta gradient accent top bar */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-primary-container)] via-[var(--color-timeline-connector)] to-[var(--color-primary-fixed)]"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5">
        {/* Patient Identity Pill & Core Meta */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center font-heading text-2xl font-bold text-[var(--color-primary-container)] shadow-inner flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] tracking-tight">
                {name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#F9DECB]">
                {user.role ? user.role.toUpperCase() : "PATIENT"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5 capitalize">
                <User size={13} className="text-[var(--color-primary-container)]" />
                {gender ? `${gender} · ` : ""}{bloodGroup ? `${bloodGroup} · ` : ""}Logged in as {user.role}
              </span>
              {phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-[var(--color-text-muted)]" />
                  {phone}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[var(--color-text-muted)]" />
                  {email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Patient Unique Health ID Card (Shareable with Doctor) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-[var(--color-badge-consult-bg)] rounded-xl px-4 py-3 border border-[#F9DECB] shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-card)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] flex-shrink-0">
              <Fingerprint size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--color-badge-consult-text)]">
                  Patient Unique Health ID
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-sage)] animate-pulse" />
                  Active
                </span>
              </div>
              <span className="font-mono text-base font-bold text-[var(--color-primary-container)] tracking-tight">
                {patientUniqueId}
              </span>
            </div>
            <button
              id="copy-patient-id-btn"
              type="button"
              onClick={handleCopyId}
              className="ml-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] hover:bg-white text-[var(--color-primary-container)] border border-[#F9DECB] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              title="Copy Unique ID to share with your doctor"
            >
              {copiedId ? (
                <>
                  <Check size={14} className="text-[var(--color-secondary-sage)]" />
                  <span className="text-[var(--color-secondary-sage)]">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy for Doctor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Context & Badges Row */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)]/60 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-3 sm:px-6 rounded-b-xl">
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mr-1">
          Clinical Context:
        </span>

        {bloodGroup && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] text-xs font-semibold border border-[#D4EAD9]">
            <Droplets size={12} />
            {bloodGroup} Blood Group
          </span>
        )}

        {allergies.length > 0 ? (
          allergies.map((allergy) => (
            <span
              key={allergy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-error-container)]/50 text-[var(--color-error-text)] text-xs font-semibold border border-[var(--color-error-container)]"
            >
              <ShieldAlert size={12} />
              Allergic: {allergy}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] text-xs border border-[var(--color-border-subtle)]">
            No Known Allergies
          </span>
        )}

        {conditions.map((condition) => (
          <span
            key={condition}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] text-xs border border-[#F9DECB] font-medium"
          >
            {condition}
          </span>
        ))}

        {dobStr && (
          <span className="ml-auto text-xs text-[var(--color-text-muted)] font-mono">
            DOB: {dobStr}
          </span>
        )}
      </div>
    </Card>
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
