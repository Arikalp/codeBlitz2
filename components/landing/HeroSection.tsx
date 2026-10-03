/**
 * components/landing/HeroSection.tsx
 *
 * Full-viewport hero section featuring the Warm Parchment Clinical aesthetic.
 * Showcases the longitudinal timeline narrative and live clinical record preview card.
 * Server component — interactivity delegated to HeroCtas (client).
 */

import HeroCtas from "./HeroCtas";
import { ShieldCheck, Activity, Stethoscope, CheckCircle, FileText } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden"
    >
      {/* Warm Ambient Glow Gradients */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[var(--color-primary-fixed)]/30 blur-3xl pointer-events-none rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Hackathon Prototype Tag */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] text-[var(--color-primary-container)] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 shadow-subtle">
            <ShieldCheck size={16} strokeWidth={2} />
            <span>Hackathon Prototype · Synthetic Patient Data Only</span>
          </div>

          {/* Hero Headline */}
          <h1
            id="hero-heading"
            className="animate-fade-up delay-100 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text-primary)] leading-[1.12]"
          >
            One patient. <br />
            <span className="text-[var(--color-primary-container)]">Multiple hospitals.</span> <br />
            A connected journey.
          </h1>

          {/* Hero Subtitle */}
          <p className="animate-fade-up delay-200 mt-6 text-lg sm:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
            HealthSetu brings your prescriptions, lab results, and clinical encounters into a{" "}
            <strong className="text-[var(--color-text-primary)] font-semibold">single longitudinal timeline</strong>
            {" "}— shared across hospitals only with your explicit consent.
          </p>

          {/* Primary Hero Actions */}
          <div className="mt-8 sm:mt-10">
            <HeroCtas />
          </div>

          {/* Hero Micro Disclaimer */}
          <p className="animate-fade-up delay-400 mt-6 text-xs text-[var(--color-text-muted)] font-mono">
            No real patient data · ABDM-inspired demo flow · Clinical decisions stay with your doctor
          </p>
        </div>

        {/* Hero Clinical Preview Card (Replicating Warm Parchment Timeline Preview) */}
        <div
          id="timeline-preview"
          className="animate-fade-up delay-300 mt-14 max-w-4xl mx-auto bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border-subtle)] shadow-card p-5 sm:p-7 relative overflow-hidden"
          aria-label="Preview of HealthSetu longitudinal health record"
        >
          {/* Preview Card Header */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] text-xs gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 font-mono text-[var(--color-text-muted)] font-medium">
                Longitudinal View · Patient: Sankalp Saini (DEMO-1234)
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--color-secondary-sage)] animate-pulse" />
              <span>Consent Active (Hospital B)</span>
            </div>
          </div>

          {/* Clinical Record Nodes with Continuous Amber Rail */}
          <div className="mt-6 space-y-6 relative pl-6 sm:pl-10">
            {/* Continuous Amber Spine Rail */}
            <div className="absolute left-[13px] sm:left-[19px] top-4 bottom-4 w-[2px] bg-[var(--color-timeline-connector)] opacity-60" />

            {/* Record Node 1: Lab Report */}
            <div className="relative group">
              {/* Marker Icon */}
              <div className="absolute -left-6 sm:-left-10 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-timeline-node-bg)] border-2 border-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-primary-container)] shadow-sm z-10">
                <Activity size={15} strokeWidth={2.2} />
              </div>

              {/* Lab Report Content */}
              <div className="bg-[var(--color-surface-container-low)] rounded-xl border border-[var(--color-border-subtle)] p-4 sm:p-5 hover:border-[var(--color-primary-container)]/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-[var(--color-badge-lab-bg)] text-[var(--color-badge-lab-text)] border border-[#EAE4D7]">
                      Lab Report
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] font-semibold flex items-center gap-1">
                      <CheckCircle size={11} /> Verified
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">September 28, 2026</span>
                </div>

                <h3 className="font-heading font-bold text-lg text-[var(--color-text-primary)]">
                  HbA1c &amp; Lipid Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[var(--color-text-secondary)] mt-2 font-mono">
                  <p><span className="text-[var(--color-text-muted)]">Facility:</span> Pathcare Diagnostics (Hospital A Network)</p>
                  <p><span className="text-[var(--color-text-muted)]">Clinician:</span> Dr. Meera Nair</p>
                </div>

                {/* Key Details Inset Box */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] -mx-4 -mb-4 p-4 rounded-b-xl">
                  <span className="text-[10px] font-mono tracking-wider text-[var(--color-text-muted)] uppercase block mb-1.5 font-bold">
                    Key Details
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--color-text-secondary)]">HbA1c Glycated Hemoglobin</span>
                    <span className="font-bold text-[var(--color-primary-container)] bg-[var(--color-badge-consult-bg)] px-2 py-0.5 rounded border border-[#F9DECB]">
                      7.1 % (Managed)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono mt-1.5">
                    <span className="text-[var(--color-text-secondary)]">LDL Cholesterol</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">102 mg/dL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Node 2: Consultation & Prescription */}
            <div className="relative group">
              {/* Marker Icon */}
              <div className="absolute -left-6 sm:-left-10 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-surface-container-high)] border-2 border-[var(--color-text-primary)] flex items-center justify-center text-[var(--color-text-primary)] shadow-sm z-10">
                <Stethoscope size={15} strokeWidth={2.2} />
              </div>

              {/* Consultation Content */}
              <div className="bg-[var(--color-surface-container-low)] rounded-xl border border-[var(--color-border-subtle)] p-4 sm:p-5 hover:border-[var(--color-primary-container)]/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] border border-[#F9DECB]">
                      Consultation
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] font-semibold flex items-center gap-1">
                      <CheckCircle size={11} /> Verified
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">September 18, 2026</span>
                </div>

                <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                  Diabetic Follow-up &amp; Care Planning
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[var(--color-text-secondary)] mt-2 font-mono">
                  <p><span className="text-[var(--color-text-muted)]">Facility:</span> Apollo Hospitals, Greams Road</p>
                  <p><span className="text-[var(--color-text-muted)]">Clinician:</span> Dr. Rajesh Kumar</p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-text-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span><strong className="text-[var(--color-text-primary)]">Plan:</strong> Continue Metformin 500mg, order fresh lipids, link Hospital B visit.</span>
                  <span className="text-[11px] text-[var(--color-primary-container)] font-semibold flex items-center gap-1">
                    <FileText size={12} /> 1 Prescription Attached
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
