/**
 * app/layout.tsx
 *
 * Root layout — wraps every route in the application.
 * Defines global metadata, fonts, and the top-level HTML structure.
 */

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ─── Font ─────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-display",
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
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
