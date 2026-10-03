/**
 * components/ui/BrandLogo.tsx
 *
 * Bespoke Vector Brand Identity & Logo System for HealthSetu.
 * Replaces generic template icons with authentic, human-designed medical-bridge marks.
 *
 * Supported Logo Concepts:
 * 1. "setu-arch"   - The Clinical Setu Arch (Interlocking Health Bridge)
 * 2. "pulse-cross" - The Pulse Cross (Deconstructed Medical Plus & Bridge)
 * 3. "continuum"   - The Continuum Ligature (H+S Monogram Care Bridge)
 * 4. "shield"      - The Guardian Shield (Zero-Knowledge Consent & Gateway)
 */

"use client";

import React, { useState, useEffect } from "react";

export type LogoVariant = "setu-arch" | "pulse-cross" | "continuum" | "shield";
export type LogoLayout = "full" | "horizontal" | "mark" | "vertical";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface BrandLogoProps {
  variant?: LogoVariant;
  layout?: LogoLayout;
  size?: LogoSize;
  tagline?: string;
  showTagline?: boolean;
  className?: string;
  theme?: "warm" | "light" | "dark" | "monochrome";
  overrideActive?: boolean;
}

const DEFAULT_VARIANT: LogoVariant = "setu-arch";

// Event for cross-component live logo switching
export const LOGO_CHANGE_EVENT = "healthsetu-logo-changed";

export function getActiveLogoVariant(): LogoVariant {
  if (typeof window === "undefined") return DEFAULT_VARIANT;
  try {
    const saved = localStorage.getItem("healthsetu_active_logo");
    if (saved && ["setu-arch", "pulse-cross", "continuum", "shield"].includes(saved)) {
      return saved as LogoVariant;
    }
  } catch {}
  return DEFAULT_VARIANT;
}

export function setActiveLogoVariant(variant: LogoVariant) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("healthsetu_active_logo", variant);
    window.dispatchEvent(new CustomEvent(LOGO_CHANGE_EVENT, { detail: variant }));
  } catch {}
}

export default function BrandLogo({
  variant,
  layout = "horizontal",
  size = "md",
  tagline = "Clinical Care Bridge",
  showTagline = true,
  className = "",
  theme = "warm",
  overrideActive = false,
}: BrandLogoProps) {
  const [currentVariant, setCurrentVariant] = useState<LogoVariant>(variant || DEFAULT_VARIANT);

  useEffect(() => {
    if (variant && overrideActive) {
      setCurrentVariant(variant);
      return;
    }

    // Set initial from localStorage if not explicitly fixed
    if (!variant) {
      setCurrentVariant(getActiveLogoVariant());
    } else {
      setCurrentVariant(variant);
    }

    function handleLogoChange(e: Event) {
      if (!variant || !overrideActive) {
        const customEvent = e as CustomEvent<LogoVariant>;
        if (customEvent.detail) {
          setCurrentVariant(customEvent.detail);
        }
      }
    }

    window.addEventListener(LOGO_CHANGE_EVENT, handleLogoChange);
    return () => window.removeEventListener(LOGO_CHANGE_EVENT, handleLogoChange);
  }, [variant, overrideActive]);

  // Dimension mapping
  const pxSize =
    typeof size === "number"
      ? size
      : {
          xs: 22,
          sm: 28,
          md: 38,
          lg: 48,
          xl: 64,
        }[size] || 38;

  const textSizes = {
    xs: { main: "text-xs", sub: "text-[8px]" },
    sm: { main: "text-sm", sub: "text-[9px]" },
    md: { main: "text-lg", sub: "text-[10px]" },
    lg: { main: "text-2xl", sub: "text-xs" },
    xl: { main: "text-3xl", sub: "text-sm" },
  }[typeof size === "string" ? size : "md"];

  return (
    <div
      className={`inline-flex items-center gap-3 ${
        layout === "vertical" ? "flex-col text-center" : ""
      } ${className}`}
      role="img"
      aria-label="HealthSetu brand logo"
    >
      {/* Logomark Vector */}
      <div
        className="flex-shrink-0 transition-transform hover:scale-105 duration-200"
        style={{ width: pxSize, height: pxSize }}
      >
        <VectorLogomark variant={currentVariant} theme={theme} />
      </div>

      {/* Wordmark Typography (if not icon-only) */}
      {layout !== "mark" && (
        <div className={`flex flex-col ${layout === "vertical" ? "items-center" : "items-start"}`}>
          <div
            className={`font-heading font-bold ${textSizes.main} tracking-tight leading-none text-[var(--color-text-primary)]`}
          >
            <span>Health</span>
            <span className="text-[var(--color-primary-container)]">Setu</span>
          </div>

          {(layout === "full" || showTagline) && (
            <span
              className={`font-heading font-semibold uppercase tracking-wider ${textSizes.sub} text-[var(--color-text-muted)] mt-1 leading-none`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VECTOR LOGOMARKS
// ─────────────────────────────────────────────────────────────────────────────

interface VectorMarkProps {
  variant: LogoVariant;
  theme?: "warm" | "light" | "dark" | "monochrome";
}

export function VectorLogomark({ variant, theme = "warm" }: VectorMarkProps) {
  switch (variant) {
    case "pulse-cross":
      return <PulseCrossMark theme={theme} />;
    case "continuum":
      return <ContinuumMark theme={theme} />;
    case "shield":
      return <ShieldMark theme={theme} />;
    case "setu-arch":
    default:
      return <SetuArchMark theme={theme} />;
  }
}

/**
 * Concept 1: The Clinical Setu Arch
 * Two cantilever bridge arches meeting in an interlocking keystone with an ECG pulse flourish.
 */
function SetuArchMark({ theme }: { theme: string }) {
  const isDark = theme === "dark";
  const primaryColor = isDark ? "#F28E4B" : "#D97736";
  const secondaryColor = isDark ? "#4CAF50" : "#2E7D32";

  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-xs">
      <defs>
        <linearGradient id="markArchPrim" x1="6" y1="38" x2="38" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C25E20" />
          <stop offset="60%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#F28E4B" />
        </linearGradient>

        <linearGradient id="markArchSec" x1="42" y1="38" x2="16" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B5E20" />
          <stop offset="60%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor="#66BB6A" />
        </linearGradient>

        <linearGradient id="markDeckGrad" x1="6" y1="32" x2="42" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
          <stop offset="50%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.3" />
        </linearGradient>

        <radialGradient id="markNodeGlow" cx="24" cy="22" r="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="70%" stopColor="#FDF3EB" />
          <stop offset="100%" stopColor="#F9DECB" />
        </radialGradient>
      </defs>

      {/* Base Foundation Nodes */}
      <circle cx="8" cy="36" r="3.2" fill={primaryColor} />
      <circle cx="8" cy="36" r="1.4" fill="#FFFDF9" />
      <circle cx="40" cy="36" r="3.2" fill={secondaryColor} />
      <circle cx="40" cy="36" r="1.4" fill="#FFFDF9" />

      {/* Horizontal Bridge Deck */}
      <path
        d="M 8 34 C 16 35.5, 32 35.5, 40 34"
        stroke="url(#markDeckGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Suspension Cables */}
      <line x1="14" y1="26" x2="14" y2="34.5" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45" strokeDasharray="1 2.5" />
      <line x1="34" y1="26" x2="34" y2="34.5" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45" strokeDasharray="1 2.5" />

      {/* Left Cantilever Bridge Arch */}
      <path
        d="M 8 36 C 8 20, 18 12, 24 12 C 26.5 12, 29 13.5, 31 16"
        stroke="url(#markArchPrim)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Right Cantilever Bridge Arch */}
      <path
        d="M 40 36 C 40 20, 30 12, 24 12 C 21.5 12, 19 13.5, 17 16"
        stroke="url(#markArchSec)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Central Nexus Keystone (Single Longitudinal Record) */}
      <circle cx="24" cy="22" r="5.5" fill="url(#markNodeGlow)" stroke={primaryColor} strokeWidth="2" />

      {/* Clinical Heartbeat Apex */}
      <path
        d="M 21.2 22 L 22.8 22 L 23.6 19.5 L 24.6 24.5 L 25.4 22 L 26.8 22"
        stroke={primaryColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Concept 2: The Pulse Cross
 * Deconstructed medical plus with aerodynamic bridge curvature and central nexus.
 */
function PulseCrossMark({ theme }: { theme: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-xs">
      <defs>
        <linearGradient id="pcHoriz" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97736" />
          <stop offset="50%" stopColor="#E28B52" />
          <stop offset="100%" stopColor="#D97736" />
        </linearGradient>
        <linearGradient id="pcVert" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="50%" stopColor="#3B9E40" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
      </defs>

      {/* Horizontal Bridge Span */}
      <path
        d="M 6 24 C 14 21, 20 20, 24 20 C 28 20, 34 21, 42 24 C 34 27, 28 28, 24 28 C 20 28, 14 27, 6 24 Z"
        fill="url(#pcHoriz)"
      />

      {/* Vertical Care Pillar */}
      <path
        d="M 24 6 C 21 14, 20 20, 20 24 C 20 28, 21 34, 24 42 C 27 34, 28 28, 28 24 C 28 20, 27 14, 24 6 Z"
        fill="url(#pcVert)"
        opacity="0.92"
      />

      {/* Junction Relief */}
      <circle cx="24" cy="24" r="5" fill="#FFFDF9" />
      <circle cx="24" cy="24" r="3" fill="#D97736" />

      {/* ECG micro line */}
      <path
        d="M 12 24 L 18 24 L 21 21 L 24 27 L 27 24 L 36 24"
        stroke="#FFFDF9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Concept 3: The Continuum Ligature
 * H + S Monogram Bridge linking two care pillars.
 */
function ContinuumMark({ theme }: { theme: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-xs">
      <defs>
        <linearGradient id="cmFlow" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97736" />
          <stop offset="50%" stopColor="#E28B52" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>

      {/* Left Pillar ('H' Left Stem) */}
      <rect x="8" y="10" width="5.5" height="28" rx="2.75" fill="#D97736" />

      {/* Right Pillar ('H' Right Stem) */}
      <rect x="34.5" y="10" width="5.5" height="28" rx="2.75" fill="#2E7D32" />

      {/* Flowing 'S' Bridge Ribbon */}
      <path
        d="M 13.5 24 C 20 24, 20 16, 24 16 C 28 16, 28 32, 32 32 C 34 32, 34.5 30, 34.5 24"
        stroke="url(#cmFlow)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Beam Dash Indicator */}
      <line x1="13.5" y1="24" x2="34.5" y2="24" stroke="#FFFDF9" strokeWidth="2" strokeDasharray="2 3" opacity="0.85" />

      {/* Center Biometric Node */}
      <circle cx="24" cy="24" r="3.5" fill="#FFFDF9" stroke="#D97736" strokeWidth="2" />
    </svg>
  );
}

/**
 * Concept 4: The Guardian Shield
 * Symmetrical gateway bridge safeguarding clinical data.
 */
function ShieldMark({ theme }: { theme: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-xs">
      <defs>
        <linearGradient id="shGrad" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97736" />
          <stop offset="60%" stopColor="#C25E20" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>

      {/* Shield Arch Perimeter */}
      <path
        d="M 24 6 C 33 6, 40 10, 40 19 C 40 31, 30 38.5, 24 42 C 18 38.5, 8 31, 8 19 C 8 10, 15 6, 24 6 Z"
        stroke="url(#shGrad)"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Bridge Suspension Arc */}
      <path
        d="M 12 28 C 18 20, 30 20, 36 28"
        stroke="#D97736"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Care Cross Anchor */}
      <rect x="22" y="14" width="4" height="13" rx="2" fill="#2E7D32" />
      <rect x="17.5" y="18.5" width="13" height="4" rx="2" fill="#2E7D32" />

      {/* Center Core Node */}
      <circle cx="24" cy="20.5" r="2.2" fill="#FFFDF9" />
    </svg>
  );
}
