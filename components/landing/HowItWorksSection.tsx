/**
 * components/landing/HowItWorksSection.tsx
 *
 * 5-step journey architecture: Hospital A → consent → Hospital B.
 * Implements the Warm Parchment Clinical horizontal and responsive vertical flow.
 * Server component.
 */

import { Hospital, Lock, KeyRound, Stethoscope, PlusCircle } from "lucide-react";

const STEPS = [
  {
    step: "01",
    tag: "Origin",
    icon: Hospital,
    title: "Visit Hospital A",
    description:
      "Clinician conducts checkup, orders lab reports (e.g. HbA1c), and prescribes medication.",
    facility: "Apollo Hospitals",
  },
  {
    step: "02",
    tag: "Patient Vault",
    icon: Lock,
    title: "You Control Records",
    description:
      "Records land in your longitudinal timeline. You view OCR extractions and confirm accuracy.",
    facility: "Patient App / Portal",
  },
  {
    step: "03",
    tag: "Consent Pin",
    icon: KeyRound,
    title: "Grant Consent to B",
    description:
      "Hospital B requests consultation access. You review duration (48h) and approve specific scopes.",
    facility: "ABDM Artifact Generated",
  },
  {
    step: "04",
    tag: "Continuity",
    icon: Stethoscope,
    title: "Doctor Reviews Context",
    description:
      "Hospital B doctor sees your prior HbA1c 7.1% and previous prescriptions before recommending treatment.",
    facility: "City Health Hospital",
  },
  {
    step: "05",
    tag: "New Encounter",
    icon: PlusCircle,
    title: "Encounter Recorded",
    description:
      "Hospital B records new consultation note and prescription, growing your historical timeline.",
    facility: "Timeline Synchronized",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="py-20 lg:py-28 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[var(--color-primary-container)] tracking-wider uppercase bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] px-3.5 py-1 rounded-full inline-block">
            Journey Architecture
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-3.5 font-heading text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight"
          >
            How HealthSetu Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--color-text-secondary)]">
            A seamless five-step handover loop that keeps patient authority at the very center.
          </p>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
          {STEPS.map(({ step, tag, icon: Icon, title, description, facility }) => (
            <div
              key={step}
              className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[var(--color-primary-container)] hover:shadow-warm transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-[var(--color-primary-container)] text-white font-mono text-sm font-bold flex items-center justify-center shadow-xs">
                    {step}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[var(--color-primary-hover)] font-semibold tracking-wider">
                    {tag}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-text-primary)] flex items-center justify-center mb-3">
                  <Icon size={20} strokeWidth={2} />
                </div>

                <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-muted)] flex items-center justify-between">
                <span>{facility}</span>
                <span className="text-[var(--color-primary-container)]">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
