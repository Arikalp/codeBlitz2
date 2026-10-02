/**
 * components/landing/HeroCtas.tsx
 *
 * Client component — CTA buttons for the hero section.
 * Isolated here so HeroSection can remain a Server Component.
 */

"use client";

import Button from "@/components/ui/Button";

export default function HeroCtas() {
  function scrollToHowItWorks() {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        id="hero-cta-primary"
        variant="primary"
        size="lg"
        disabled
        aria-label="Get started – authentication coming soon"
      >
        Get Started Free
      </Button>

      <Button
        id="hero-cta-secondary"
        variant="outline"
        size="lg"
        onClick={scrollToHowItWorks}
      >
        See How It Works →
      </Button>
    </div>
  );
}
