/**
 * components/landing/CtaBanner.tsx
 *
 * Bottom call-to-action banner with warm accent background.
 * Server component.
 */

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function CtaBanner() {
  return (
    <section
      id="use-case"
      aria-labelledby="cta-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-accent"
      />

      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-5">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary opacity-[0.08] blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white opacity-[0.04] blur-[80px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative">
        <h2
          id="cta-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-5 text-white"
        >
          Ready to see HealthSetu
          <br className="hidden sm:block" />
          in action?
        </h2>
        <p className="text-white/70 text-base sm:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
          Explore the demo dashboard to see how patient-owned health records
          and consent-driven sharing works.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-accent font-semibold text-base shadow-lg hover:shadow-xl hover:bg-white/95 transition-all duration-200"
          >
            Try Demo Dashboard
            <ArrowRight className="size-4 stroke-[1.5]" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
          >
            <ExternalLink className="size-4 stroke-[1.5]" />
            View on GitHub
          </a>
        </div>

        <p className="mt-8 text-xs text-white/40">
          Hackathon prototype · Not for clinical use · Synthetic data only
        </p>
      </div>
    </section>
  );
}
