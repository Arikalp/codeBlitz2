/**
 * components/landing/FeaturesSection.tsx
 *
 * Feature cards grid — HealthSetu core capabilities.
 * Uses Lucide icons in duotone-lite tint circles.
 * Server component.
 */

import {
  Activity,
  ShieldCheck,
  Building2,
  Sparkles,
  FileText,
  Heart,
} from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    iconColor: "text-accent",
    bgColor: "bg-primary-tint",
    title: "Unified Health Timeline",
    description:
      "All your encounters, prescriptions, lab results, and discharge summaries in a single chronological view — searchable and filterable.",
  },
  {
    icon: ShieldCheck,
    iconColor: "text-accent",
    bgColor: "bg-secondary-tint",
    title: "Patient-Controlled Consent",
    description:
      "You decide exactly which records to share, with which provider, and for how long. Revoke access at any time.",
  },
  {
    icon: Building2,
    iconColor: "text-accent",
    bgColor: "bg-warm-tint",
    title: "Multi-Hospital Continuity",
    description:
      "When you visit Hospital B, the doctor can review your Hospital A records (with your permission) and add a new encounter.",
  },
  {
    icon: Sparkles,
    iconColor: "text-accent",
    bgColor: "bg-primary-tint",
    title: "AI-Assisted Explanations",
    description:
      "Plain-language summaries of your reports powered by LLM — always grounded in your own records and clearly labelled as AI output.",
  },
  {
    icon: FileText,
    iconColor: "text-accent",
    bgColor: "bg-secondary-tint",
    title: "Document Understanding",
    description:
      "Upload scanned prescriptions or PDFs. Structured data is extracted via OCR and you verify before it enters your record.",
  },
  {
    icon: Heart,
    iconColor: "text-accent",
    bgColor: "bg-warm-tint",
    title: "ABDM-Inspired Flow",
    description:
      "Simulated ABHA-style consent and record-retrieval flow for hackathon demonstration — clearly labelled, synthetic data throughout.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-border/40 text-accent text-xs font-heading font-semibold tracking-wide uppercase mb-4">
            Core features
          </div>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-4"
          >
            Everything your health
            <br className="hidden sm:block" />
            journey needs
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with one goal: ensuring the doctor you see today has the
            context they need from your entire health history.
          </p>
        </div>

        {/* Feature cards grid */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="list"
        >
          {FEATURES.map(({ icon: Icon, iconColor, bgColor, title, description }) => (
            <li
              key={title}
              className="group relative flex flex-col gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/40 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Icon */}
              <div
                className={`size-12 rounded-xl ${bgColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon className={`size-5 ${iconColor} stroke-[1.5]`} />
              </div>

              <div>
                <h3 className="font-semibold font-heading text-lg text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
