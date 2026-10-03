/**
 * components/landing/CtaBanner.tsx
 *
 * Bottom call-to-action banner styled with Warm Parchment Terracotta palette.
 * Server component.
 */

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CtaBanner() {
  return (
    <section
      id="use-case"
      aria-labelledby="cta-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[var(--color-primary-container)] text-white"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 id="cta-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
          Ready to experience connected care?
        </h2>
        <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Log into your patient portal to explore your longitudinal timeline, verify OCR-extracted lab reports, or simulate hospital-to-hospital consent transfer.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-[var(--color-primary)] hover:bg-[#FAF8F5] border-none shadow-warm font-heading font-semibold"
            >
              Get Started Now →
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 text-white bg-transparent hover:bg-white/10 font-heading font-semibold"
            >
              Open Live Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-white/80 font-mono">
          <span>🛡️ Patient Consent Governed</span>
          <span>⚡ Groq AI Clinical Inference</span>
          <span>📋 ABDM Milestone Model</span>
        </div>
      </div>
    </section>
  );
}
