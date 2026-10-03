/**
 * app/dashboard/consent/page.tsx
 *
 * /dashboard/consent — Patient Consent & Access Governance.
 * Designed in the Warm Parchment Clinical design system:
 * ABDM simulation disclaimer, provider access governance matrix,
 * FHIR consent artifacts, and granular scope toggles.
 */

"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Building2,
  Calendar,
  Lock,
  FileText,
  KeyRound,
  RefreshCw,
  User,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { MOCK_CONSENTS, type ConsentRequest } from "@/lib/mock-data";

export default function ConsentPage() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const isDoctor = user?.role === "doctor" || user?.role === "facility_admin";

  useEffect(() => {
    let active = true;
    async function fetchConsents() {
      try {
        const res = await fetch("/api/consent", {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (json.data?.consents) {
            setConsents(json.data.consents);
            return;
          }
        }
        setConsents(MOCK_CONSENTS as ConsentRequest[]);
      } catch (err) {
        if (active) setConsents(MOCK_CONSENTS as ConsentRequest[]);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchConsents();
    return () => {
      active = false;
    };
  }, []);

  async function handleAction(id: string, action: "approved" | "denied") {
    // Optimistic UI update
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: action } : c))
    );

    try {
      await fetch(`/api/consent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch (e) {
      console.error("Failed to update consent status:", e);
    }
  }

  const pending  = consents.filter((c) => c.status === "pending");
  const resolved = consents.filter((c) => c.status !== "pending");

  return (
    <AppShell title="Consent & Sharing">
      <div className="max-w-[1080px] w-full mx-auto space-y-7 px-2 sm:px-4 py-2 sm:py-4">
        {/* Top ABDM Demo Mode Disclaimer Pill Banner */}
        <div className="w-full bg-[var(--color-badge-consult-bg)]/80 border border-[#F9DECB] rounded-2xl p-4 sm:px-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Info size={20} className="text-[var(--color-primary-container)] shrink-0" />
            <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
              <strong className="font-semibold text-[var(--color-text-primary)]">Demo Mode · Synthetic Data.</strong> HealthSetu supports clinical decisions and patient consent; not connected to live government ABDM gateways.
            </p>
          </div>
          <span className="hidden md:inline-flex items-center font-mono text-[10px] uppercase tracking-wider text-[var(--color-badge-consult-text)] px-3 py-1 rounded-full bg-[var(--color-surface-card)] border border-[#F9DECB] shrink-0 font-bold">
            Simulation Node
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] shrink-0">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                {isDoctor ? "Report Requests & Consent Governance" : "Consent & Access Governance"}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
                {isDoctor
                  ? "Track report access requests and patient authorizations under ABDM."
                  : "Review and govern requests from doctors and hospitals to access your medical records."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-xl text-xs font-mono text-[var(--color-text-muted)] self-start sm:self-center">
            <Lock size={13} className="text-[var(--color-primary-container)]" />
            <span>Zero-Knowledge Authorization</span>
          </div>
        </div>

        {/* Pending Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--color-primary-container)]" />
            <h2 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              {isDoctor ? "Awaiting Patient Authorization" : "Pending Authorization Requests"}
            </h2>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] border border-[#F9DECB]">
              {pending.length}
            </span>
          </div>

          {pending.length === 0 ? (
            <Card padding="md" className="border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] rounded-2xl p-6 text-center">
              <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
                <CheckCircle size={24} className="text-[var(--color-secondary-sage)]" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {isDoctor ? "No pending patient requests" : "No pending requests"}
                </span>
                <span className="text-xs">
                  {isDoctor
                    ? "Look up a patient by their Unique Health ID to request access to their clinical reports."
                    : "Your records are completely private. Providers must request access before viewing."}
                </span>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {pending.map((c) => (
                <ConsentCard key={c.id} consent={c} onAction={handleAction} readOnly={isDoctor} />
              ))}
            </div>
          )}
        </section>

        {/* Resolved / Active Consents Section */}
        {resolved.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              Authorized Provider History
            </h2>
            <div className="space-y-4">
              {resolved.map((c) => (
                <ConsentCard key={c.id} consent={c} onAction={handleAction} readOnly />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function ConsentCard({
  consent,
  onAction,
  readOnly = false,
}: {
  consent: ConsentRequest;
  onAction: (id: string, action: "approved" | "denied") => void;
  readOnly?: boolean;
}) {
  const isApproved = consent.status === "approved";
  const isPending = consent.status === "pending";

  return (
    <Card className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-sm hover:shadow-warm transition-all relative overflow-hidden">
      {/* Accent strip */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1.5 ${
          isApproved
            ? "bg-[var(--color-secondary-sage)]"
            : isPending
            ? "bg-[var(--color-primary-container)]"
            : "bg-[var(--color-error)]"
        }`}
      />

      <div className="pl-2 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                {consent.requestedBy}
              </h3>
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] font-mono text-[11px] font-semibold uppercase">
                  <CheckCircle size={11} /> Active Consent
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] border border-[#F9DECB] font-mono text-[11px] font-semibold uppercase">
                  <Clock size={11} /> Pending Review
                </span>
              )}
              {!isApproved && !isPending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-error-container)]/50 text-[var(--color-error-text)] border border-[var(--color-error-container)] font-mono text-[11px] font-semibold uppercase">
                  Revoked
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Building2 size={13} className="text-[var(--color-text-muted)]" />
              <span>{consent.facility}</span>
            </p>
          </div>

          <div className="text-right text-xs font-mono text-[var(--color-text-muted)]">
            <span>Requested: {formatDate(consent.requestedAt)}</span>
          </div>
        </div>

        {/* Purpose */}
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)]/70 rounded-xl p-3.5 text-xs text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)] font-semibold">Purpose:</strong> {consent.purpose}
        </div>

        {/* Scope pills */}
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--color-text-muted)] block mb-2">
            Authorized Scope of Access:
          </span>
          <div className="flex flex-wrap gap-2">
            {consent.requestedRecords.map((rec) => (
              <span
                key={rec}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-surface-container-high)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] font-medium"
              >
                <FileText size={12} className="text-[var(--color-primary-container)]" />
                {rec}
              </span>
            ))}
          </div>
        </div>

        {/* Footer actions and expiration */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-mono text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Calendar size={13} />
            <span>Valid until: <strong>{formatDate(consent.expiresAt)}</strong></span>
          </span>

          {!readOnly && isPending && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAction(consent.id, "approved")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-secondary-sage)] text-white text-xs font-heading font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <CheckCircle size={14} />
                <span>Approve Access</span>
              </button>
              <button
                type="button"
                onClick={() => onAction(consent.id, "denied")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-error)] text-[var(--color-error)] text-xs font-heading font-semibold hover:bg-[var(--color-error-container)]/30 transition-colors cursor-pointer"
              >
                <XCircle size={14} />
                <span>Deny</span>
              </button>
            </div>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={() => onAction(consent.id, "denied")}
              className="text-xs font-semibold text-[var(--color-error)] hover:underline cursor-pointer"
            >
              Revoke Permission Now
            </button>
          )}
        </div>
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
