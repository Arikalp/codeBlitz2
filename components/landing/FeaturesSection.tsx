/**
 * components/landing/FeaturesSection.tsx
 *
 * Feature cards grid showcasing HealthSetu's core capabilities in
 * the Warm Parchment Clinical design system.
 * Server component.
 */

import {
  FileText,
  Lock,
  Building2,
  Bot,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    iconBg: "bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] border-[#F9DECB]",
    title: "Unified Health Timeline",
    description:
      "All your encounters, prescriptions, lab results, and discharge summaries in a single chronological view — searchable, indexed, and filterable.",
  },
  {
    icon: Lock,
    iconBg: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Patient-Controlled Consent",
    description:
      "You decide exactly which records to share, with which provider, and for how long. Revoke access anytime with immediate invalidation.",
  },
  {
    icon: Building2,
    iconBg: "bg-rose-50 text-rose-700 border-rose-200",
    title: "Multi-Hospital Continuity",
    description:
      "When you visit Hospital B, the doctor can review your Hospital A records (with your permission) and add a new encounter to your timeline without data loss.",
  },
  {
    icon: Bot,
    iconBg: "bg-[#E0F2FE] text-[#0E7490] border-[#BAE6FD]",
    title: "AI-Assisted Explanations",
    description:
      "Plain-language summaries of your reports powered by Groq LLM — always grounded strictly in your verified records with clinical references.",
  },
  {
    icon: ScanLine,
    iconBg: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Document Understanding & OCR",
    description:
      "Upload scanned prescriptions or PDFs. Structured clinical data is extracted via OCR and you review every detail before committing it to your record.",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border-[#D4EAD9]",
    title: "ABDM-Inspired Flow (Demo)",
    description:
      "Simulated ABHA-style consent and record-retrieval flow for demonstration — clearly labeled, synthetic, and compliant with national digital health standards.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-canvas-subtle)] border-y border-[var(--color-border-subtle)]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[var(--color-primary-container)] tracking-wider uppercase bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] px-3.5 py-1 rounded-full inline-block">
            Core Capabilities
          </span>
          <h2
            id="features-heading"
            className="mt-3.5 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight"
          >
            Everything your health journey needs
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Built with one goal: ensuring the doctor you see today has the
            context they need from your entire health history.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {FEATURES.map(({ icon: Icon, iconBg, title, description }) => (
            <div
              key={title}
              className="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border-subtle)] p-6 sm:p-7 shadow-sm hover:shadow-warm hover:border-[var(--color-primary-container)]/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border transition-transform group-hover:scale-105 ${iconBg}`}>
                  <Icon size={22} strokeWidth={2} />
                </div>

                <h3 className="font-heading font-bold text-lg text-[var(--color-text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
