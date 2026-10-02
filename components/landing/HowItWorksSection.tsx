/**
 * components/landing/HowItWorksSection.tsx
 *
 * Step-by-step visual flow: Hospital A → consent → Hospital B.
 * Server component.
 */

const STEPS = [
  {
    step: "01",
    icon: "🏥",
    title: "Visit Hospital A",
    description:
      "Your doctor creates an encounter, prescribes medication, and requests diagnostic tests. All records are added to your HealthSetu timeline.",
  },
  {
    step: "02",
    icon: "🔒",
    title: "You Control Your Records",
    description:
      "Every record belongs to you. You can view your full timeline, review what's stored, and decide exactly what to share.",
  },
  {
    step: "03",
    icon: "✅",
    title: "Grant Consent to Hospital B",
    description:
      "When you visit Hospital B, you receive a consent request. You approve the specific records, scope, and duration of access.",
  },
  {
    step: "04",
    icon: "📖",
    title: "Doctor Reviews Prior Records",
    description:
      "The Hospital B clinician reads your authorized records — prescription, scan, notes — and makes an informed clinical decision.",
  },
  {
    step: "05",
    icon: "📝",
    title: "New Encounter Is Recorded",
    description:
      "Hospital B adds a new, attributable encounter to your timeline. The history grows — nothing is overwritten or lost.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-4"
          >
            How HealthSetu works
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
            A simple, consent-driven flow that keeps you in control at every step.
          </p>
        </div>

        {/* Steps */}
        <ol className="relative flex flex-col gap-0" aria-label="HealthSetu steps">
          {STEPS.map(({ step, icon, title, description }, idx) => (
            <li key={step} className="relative flex gap-6 pb-12 last:pb-0">
              {/* Vertical connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-[var(--color-brand-300)] to-[var(--color-border)]"
                />
              )}

              {/* Step circle */}
              <div
                aria-hidden="true"
                className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-[var(--color-brand-600)] text-white shadow-lg shadow-[var(--color-brand-500)]/30"
              >
                {icon}
              </div>

              {/* Content */}
              <div className="pt-2">
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-brand-500)] mb-1 block">
                  Step {step}
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
