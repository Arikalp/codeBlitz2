/**
 * components/landing/CtaBanner.tsx
 *
 * Bottom call-to-action banner with gradient background.
 * Server component.
 */

import Button from "@/components/ui/button";

export default function CtaBanner() {
  return (
    <section
      id="use-case"
      aria-labelledby="cta-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Gradient background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-500))",
        }}
      />

      {/* Decorative circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white opacity-5" />
      </div>

      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to connect your health journey?
        </h2>
        <p className="text-white/80 text-lg mb-10 leading-relaxed">
          HealthSetu is in active development. Authentication, record management,
          and the consent flow are coming next. Stay tuned.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            id="cta-banner-primary"
            variant="secondary"
            size="lg"
            disabled
            className="bg-white text-[var(--color-brand-700)] hover:bg-white/90"
            aria-label="Coming soon"
          >
            Coming Soon
          </Button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            id="cta-banner-github"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
