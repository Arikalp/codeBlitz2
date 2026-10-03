/**
 * components/landing/HeroSection.tsx
 *
 * Full-viewport hero section with animated gradient background,
 * headline, sub-copy, and call-to-action buttons.
 * Server component — interactivity delegated to HeroCtas (client).
 */

import HeroCtas from "./HeroCtas";
import { Activity, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-14">
        <div>
        {/* Pill badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-brand-50)] border border-[var(--color-border)] text-[var(--color-accent-500)] text-xs font-semibold uppercase tracking-[0.14em] mb-8">
          <ShieldCheck aria-hidden="true" size={15} strokeWidth={1.7} />
          <span>Private by consent · Demo data</span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="animate-fade-up delay-100 text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] mb-6 max-w-3xl"
        >
          <span className="text-[var(--color-text-primary)]">Your health story,</span>
          <br />
          <span className="text-[var(--color-accent-500)]">all in one place.</span>
        </h1>

        {/* Sub-copy */}
        <p className="animate-fade-up delay-200 text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-xl mb-10 leading-relaxed">
          See your prescriptions, lab results, and hospital visits in one simple timeline. Share only what you choose, when you choose.
        </p>

        {/* CTA Buttons — client component handles scroll interaction */}
        <HeroCtas />

        {/* Trust note */}
        <p className="animate-fade-up delay-400 mt-8 text-xs text-[var(--color-text-muted)]">
          No medical advice · Your doctor makes clinical decisions · Built for easier care
        </p>
        </div>

        <div className="animate-fade-up delay-200 relative mx-auto w-full max-w-xl" aria-label="Preview of a HealthSetu health record">
          <div className="absolute -inset-4 rounded-2xl border border-[var(--color-brand-200)]" aria-hidden="true" />
          <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7 shadow-[0_24px_60px_rgba(94,52,0,0.12)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-brand-300)] text-[var(--color-accent-500)]"><Activity size={22} strokeWidth={1.7} /></div>
                <div><p className="font-mono text-xs text-[var(--color-text-muted)]">HEALTHSETU / RECORD</p><p className="font-semibold text-[var(--color-text-primary)]">My health timeline</p></div>
              </div>
              <CheckCircle2 className="text-emerald-600" size={22} strokeWidth={1.7} />
            </div>
            <div className="grid grid-cols-3 gap-3 py-5">
              {[{ label: "Records", value: "24" }, { label: "Documents", value: "08" }, { label: "Shared", value: "03" }].map((item) => <div key={item.label} className="rounded-md bg-[var(--color-surface-muted)] p-3"><p className="font-mono text-2xl font-bold text-[var(--color-accent-500)]">{item.value}</p><p className="text-xs text-[var(--color-text-muted)]">{item.label}</p></div>)}
            </div>
            <div className="space-y-3">
              {[{ date: "12 SEP 2026", title: "Blood test results", place: "CityCare Hospital", icon: Activity }, { date: "28 AUG 2026", title: "Prescription added", place: "Dr. Mehta · General medicine", icon: FileText }].map(({ date, title, place, icon: Icon }) => <div key={title} className="flex gap-3 border-l-2 border-[var(--color-brand-300)] pl-4"><div className="mt-0.5 rounded-md bg-[var(--color-brand-50)] p-2 text-[var(--color-accent-500)]"><Icon size={16} strokeWidth={1.7} /></div><div><p className="font-mono text-[10px] tracking-[0.12em] text-[var(--color-text-muted)]">{date}</p><p className="font-semibold text-[var(--color-text-primary)]">{title}</p><p className="text-xs text-[var(--color-text-secondary)]">{place}</p></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
