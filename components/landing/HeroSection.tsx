/**
 * components/landing/HeroSection.tsx
 *
 * Full-viewport hero section with animated gradient background,
 * headline, sub-copy, and call-to-action buttons.
 * Server component — interactivity delegated to HeroCtas (client).
 */

import HeroCtas from "./HeroCtas";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16"
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Large blue blob */}
        <div className="animate-pulse-slow absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[var(--color-brand-500)] opacity-10 blur-3xl" />
        {/* Teal blob */}
        <div className="animate-pulse-slow delay-300 absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-accent-500)] opacity-10 blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Pill badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] text-[var(--color-brand-700)] text-sm font-medium mb-8">
          <span aria-hidden="true">🏥</span>
          <span>Hackathon Prototype · Synthetic Data Only</span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="animate-fade-up delay-100 text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6"
        >
          <span className="text-[var(--color-text-primary)]">One patient.</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))",
            }}
          >
            Multiple hospitals.
          </span>
          <br />
          <span className="text-[var(--color-text-primary)]">A connected journey.</span>
        </h1>

        {/* Sub-copy */}
        <p className="animate-fade-up delay-200 text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          HealthSetu brings your prescriptions, lab results, and clinical encounters into a{" "}
          <strong className="text-[var(--color-text-primary)]">single longitudinal timeline</strong>
          {" "}— shared across hospitals only with your explicit consent.
        </p>

        {/* CTA Buttons — client component handles scroll interaction */}
        <HeroCtas />

        {/* Trust note */}
        <p className="animate-fade-up delay-400 mt-8 text-xs text-[var(--color-text-muted)]">
          No real patient data · ABDM-inspired demo flow · Clinical decisions stay with your doctor
        </p>
      </div>
    </section>
  );
}
