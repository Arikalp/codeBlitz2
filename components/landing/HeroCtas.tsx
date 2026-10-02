/**
 * components/landing/HeroCtas.tsx
 *
 * Client component — CTA buttons for the hero section.
 * Isolated here so HeroSection can remain a Server Component.
 */

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";

export default function HeroCtas() {
  function scrollToHowItWorks() {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/dashboard">
        <Button
          id="hero-cta-primary"
          variant="default"
          size="lg"
          className="gap-2"
        >
          Try Demo Dashboard
          <ArrowRight className="size-4 stroke-[1.5]" />
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
