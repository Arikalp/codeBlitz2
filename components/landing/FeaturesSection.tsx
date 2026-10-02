/**
 * components/landing/FeaturesSection.tsx
 *
 * Feature cards grid showcasing HealthSetu's core capabilities.
 * Server component.
 */

const FEATURES = [
  {
    icon: "📋",
    title: "Unified Health Timeline",
    description:
      "All your encounters, prescriptions, lab results, and discharge summaries in a single chronological view — searchable and filterable.",
  },
  {
    icon: "🔐",
    title: "Patient-Controlled Consent",
    description:
      "You decide exactly which records to share, with which provider, and for how long. Revoke access at any time.",
  },
  {
    icon: "🏥",
    title: "Multi-Hospital Continuity",
    description:
      "When you visit Hospital B, the doctor can review your Hospital A records (with your permission) and add a new encounter to your timeline.",
  },
  {
    icon: "🤖",
    title: "AI-Assisted Explanations",
    description:
      "Plain-language summaries of your reports powered by Groq LLM — always grounded in your own records and clearly labelled as AI output.",
  },
  {
    icon: "📄",
    title: "Document Understanding",
    description:
      "Upload scanned prescriptions or PDFs. Structured data is extracted via OCR and you verify before it enters your record.",
  },
  {
    icon: "🇮🇳",
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
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-muted)]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-4"
          >
            Everything your health journey needs
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Built with one goal: ensuring the doctor you see today has the
            context they need from your entire health history.
          </p>
        </div>

        {/* Feature cards grid */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
        >
          {FEATURES.map(({ icon, title, description }) => (
            <li
              key={title}
              className="group relative flex flex-col gap-4 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-300 hover:border-[var(--color-brand-300)] hover:shadow-xl hover:-translate-y-1"
            >
              {/* Hover glow */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top left, var(--color-brand-500)08, transparent 60%)",
                }}
              />

              <span
                aria-hidden="true"
                className="text-4xl leading-none"
              >
                {icon}
              </span>

              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
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
