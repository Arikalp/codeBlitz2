/**
 * components/landing/HeroCtas.tsx
 *
 * Client component — CTA buttons for the hero section.
 * Isolated here so HeroSection can remain a Server Component.
 */

"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HeroCtas() {
  function scrollToHowItWorks() {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
      {/* Primary CTA — links to the live dashboard demo */}
      <Link href="/dashboard">
        <Button
          id="hero-cta-primary"
          variant="primary"
          size="lg"
          aria-label="Open demo dashboard"
        >
          View Demo Dashboard →
        </Button>
      </Link>

      <Button
        id="hero-cta-secondary"
        variant="outline"
        size="lg"
        onClick={scrollToHowItWorks}
      >
        See How It Works
      </Button>
    </div>
  );
}
