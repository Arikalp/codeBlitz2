/**
 * components/landing/HeroSection.tsx
 *
 * Full-viewport hero with warm espresso/peach aesthetic,
 * trust signals, and animated gradient backdrop.
 * Server component — CTAs delegated to HeroCtas.
 */

import { Shield, Heart, Lock } from "lucide-react";
import HeroCtas from "./HeroCtas";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-20"
    >
      {/* ── Decorative backdrop ─────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Warm peach blob — top-left */}
        <div className="animate-pulse-slow absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-primary opacity-[0.12] blur-[100px]" />
        {/* Espresso blob — bottom-right */}
        <div className="animate-pulse-slow delay-300 absolute -bottom-24 -right-24 w-[440px] h-[440px] rounded-full bg-accent opacity-[0.08] blur-[100px]" />
        {/* Subtle warm center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-warm-tint opacity-30 blur-[120px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Pill badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-tint border border-border/60 text-accent text-sm font-medium mb-8">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-accent animate-pulse"
          />
          <span className="font-heading text-xs tracking-wide uppercase">
            Built for Patient Care · ABDM-Inspired
          </span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="animate-fade-up delay-100 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 font-heading"
        >
          <span className="text-foreground">Your complete</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            health story,
          </span>
          <br />
          <span className="text-foreground">across every visit.</span>
        </h1>

        {/* Sub-copy */}
        <p className="animate-fade-up delay-200 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          HealthSetu brings your prescriptions, lab reports, and clinical
          encounters into a{" "}
          <strong className="text-foreground font-semibold">
            single longitudinal timeline
          </strong>{" "}
          — shared across hospitals only with your explicit consent.
        </p>

        {/* CTA Buttons */}
        <HeroCtas />

        {/* Trust icons */}
        <div className="animate-fade-up delay-300 mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {[
            { icon: Shield, label: "Secure & Encrypted" },
            { icon: Heart, label: "Patient-Owned" },
            { icon: Lock, label: "Consent-Driven" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="size-7 rounded-full bg-primary-tint flex items-center justify-center">
                <Icon className="size-3.5 text-accent stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="animate-fade-up delay-300 mt-6 text-[11px] text-muted-foreground/60">
          No real patient data · Prototype with synthetic data · Clinical
          decisions stay with your doctor
        </p>
      </div>
    </section>
  );
}
