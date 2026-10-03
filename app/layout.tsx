/**
 * app/layout.tsx
 *
 * Root layout — wraps every route in the application.
 * Defines global metadata, fonts, and the top-level HTML structure.
 */

import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ─── Fonts ─────────────────────────────────────────────────────────────────

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "HealthSetu – Your Longitudinal Health Record",
    template: "%s | HealthSetu",
  },
  description:
    "HealthSetu connects your medical history across hospitals so every doctor has the context they need — with your consent.",
  keywords: ["health records", "care continuity", "patient portal", "ABDM"],
  authors: [{ name: "HealthSetu Team" }],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-terracotta-100)] selection:text-[var(--color-terracotta-700)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
