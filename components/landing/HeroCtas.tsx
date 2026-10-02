/**
 * components/landing/HeroCtas.tsx
 *
 * Client component — CTA buttons for the hero section.
 * Isolated here so HeroSection can remain a Server Component.
 */

"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function HeroCtas() {
  const { isAuthenticated } = useAuth();

  function scrollToHowItWorks() {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center">
      {isAuthenticated ? (
        <>
          <Link href="/dashboard">
            <Button
              id="hero-cta-primary"
              variant="primary"
              size="lg"
              aria-label="Open dashboard"
            >
              Go to My Dashboard →
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button
              id="hero-cta-secondary"
              variant="outline"
              size="lg"
            >
              View My Profile
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/register">
            <Button
              id="hero-cta-primary"
              variant="primary"
              size="lg"
              aria-label="Create patient account"
            >
              Get Started / Register →
            </Button>
          </Link>
          <Link href="/login">
            <Button
              id="hero-cta-login"
              variant="outline"
              size="lg"
              aria-label="Sign in"
            >
              Sign In
            </Button>
          </Link>
          <Button
            id="hero-cta-secondary"
            variant="ghost"
            size="lg"
            onClick={scrollToHowItWorks}
          >
            See How It Works
          </Button>
        </>
      )}
    </div>
  );
}
