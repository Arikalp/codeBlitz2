/**
 * app/dashboard/timeline/page.tsx
 *
 * /dashboard/timeline — Full longitudinal medical timeline.
 */

import type { Metadata } from "next";
import { Clock, Filter } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import TimelineItem from "@/components/timeline/TimelineItem";
import EmptyState from "@/components/ui/EmptyState";
import { MOCK_RECORDS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Timeline" };

const CATEGORIES = ["All", "Consultation", "Lab Report", "Prescription", "Imaging", "Vaccination", "Discharge"];

export default function TimelinePage() {
  // Sort records newest-first
  const sorted = [...MOCK_RECORDS].sort(
    (a, b) => new Date(b.clinicalDate).getTime() - new Date(a.clinicalDate).getTime()
  );

  return (
    <AppShell title="Medical Timeline">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Your Health Timeline</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              All records in chronological order · {MOCK_RECORDS.length} entries
            </p>
          </div>
          <button
            type="button"
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <Filter size={15} />
            Filter
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              type="button"
              className={[
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                i === 0
                  ? "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-600)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-600)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Demo notice */}
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
          ⚠️ <strong>Demo Mode</strong> — All records below are synthetic and do not represent real patient data.
        </div>

        {/* Timeline */}
        {sorted.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No records yet"
            description="Your health records will appear here as they are added."
          />
        ) : (
          <div>
            {sorted.map((record, idx) => (
              <TimelineItem
                key={record.id}
                record={record}
                isLast={idx === sorted.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
