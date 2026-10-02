/**
 * app/dashboard/consent/page.tsx
 *
 * /dashboard/consent — View and manage consent requests.
 */

"use client";

import { ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { consentBadge } from "@/components/ui/StatusBadge";
import { MOCK_CONSENTS, type ConsentRequest } from "@/lib/mock-data";
import { useState } from "react";

export default function ConsentPage() {
  const [consents, setConsents] = useState<ConsentRequest[]>(MOCK_CONSENTS as ConsentRequest[]);

  function handleAction(id: string, action: "approved" | "denied") {
    setConsents((prev) => prev.map((c) => (c.id === id ? { ...c, status: action } : c)));
  }

  const pending  = consents.filter((c) => c.status === "pending");
  const resolved = consents.filter((c) => c.status !== "pending");

  return (
    <AppShell title="Consent & Sharing">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <ShieldCheck size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Consent & Record Sharing</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Review and manage requests to access your medical records. You are always in control.
            </p>
          </div>
        </div>

        {/* Demo notice */}
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Demo Mode</strong> — Consent requests below are synthetic. Approve/deny actions update local state only.
          </span>
        </div>

        {/* Pending requests */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
              Pending Requests
            </h2>
            <span className="text-xs font-bold text-amber-600">({pending.length})</span>
          </div>

          {pending.length === 0 ? (
            <Card padding="md">
              <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                <CheckCircle size={18} className="text-emerald-500" />
                <span className="text-sm">No pending consent requests. You&apos;re all caught up.</span>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((c) => (
                <ConsentCard key={c.id} consent={c} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>

        {/* Resolved */}
        {resolved.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Past Requests
            </h2>
            <div className="space-y-3">
              {resolved.map((c) => (
                <ConsentCard key={c.id} consent={c} onAction={handleAction} readOnly />
              ))}
            </div>
          </div>
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
  return (
    <Card padding="md" className={consent.status === "pending" ? "border-l-4 border-l-amber-400" : ""}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">{consent.requestedBy}</p>
            {consentBadge(consent.status)}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">{consent.facility}</p>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">Requested: {formatDate(consent.requestedAt)}</p>
      </div>

      <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">
        <strong>Purpose:</strong> {consent.purpose}
      </p>

      <div className="mb-3">
        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Requested access to:</p>
        <ul className="space-y-1">
          {consent.requestedRecords.map((r) => (
            <li key={r} className="text-xs flex items-center gap-2 text-[var(--color-text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-400)] flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Access expires: {formatDate(consent.expiresAt)}
      </p>

      {!readOnly && consent.status === "pending" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAction(consent.id, "approved")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle size={13} /> Approve
          </button>
          <button
            type="button"
            onClick={() => onAction(consent.id, "denied")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
          >
            <XCircle size={13} /> Deny
          </button>
        </div>
      )}
    </Card>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
