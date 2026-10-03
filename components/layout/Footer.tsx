/**
 * components/layout/Footer.tsx
 *
 * Global footer styled with the Warm Parchment Clinical design system.
 * Server component.
 */

import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)] pt-14 pb-10 text-[var(--color-text-secondary)]"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--color-border-subtle)]">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-container)] text-white flex items-center justify-center shadow-xs">
                <HeartPulse size={18} strokeWidth={2.2} />
              </div>
              <span className="font-heading font-bold text-xl text-[var(--color-text-primary)]">
                HealthSetu
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed mb-4">
              A longitudinal, patient-governed medical records platform unifying clinical encounters across hospital networks.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md font-mono">
              Medical Disclaimer: HealthSetu is designed to support clinical workflows and care continuity context. It does not provide automated diagnoses and never replaces direct clinical judgment.
            </p>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <h4 className="font-heading font-bold text-xs text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">
              Platform Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="hover:text-[var(--color-primary-container)] transition-colors" href="/dashboard/timeline">
                  Unified Health Timeline
                </a>
              </li>
              <li>
                <a className="hover:text-[var(--color-primary-container)] transition-colors" href="/dashboard/consent">
                  Consent Manager
                </a>
              </li>
              <li>
                <a className="hover:text-[var(--color-primary-container)] transition-colors" href="/#how-it-works">
                  Hospital A → B Continuity
                </a>
              </li>
              <li>
                <a className="hover:text-[var(--color-primary-container)] transition-colors" href="/dashboard/documents">
                  OCR Document Extractor
                </a>
              </li>
              <li>
                <a className="hover:text-[var(--color-primary-container)] transition-colors" href="/dashboard/ai">
                  AI Clinical Assistant
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div>
            <h4 className="font-heading font-bold text-xs text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">
              ABDM &amp; Security
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-[var(--color-text-muted)]">ABDM Milestone Guidelines</span>
              </li>
              <li>
                <span className="text-[var(--color-text-muted)]">HL7 FHIR Profiles</span>
              </li>
              <li>
                <span className="text-[var(--color-text-muted)]">Patient-Directed Access</span>
              </li>
              <li>
                <span className="text-[var(--color-text-muted)]">Synthetic Demo Data</span>
              </li>
              <li>
                <Link className="hover:text-[var(--color-primary-container)] transition-colors font-medium text-[var(--color-primary-container)]" href="/dashboard">
                  Live Patient Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Bottom Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-text-muted)]">
          <div>
            © {year} HealthSetu. Open Source Longitudinal Care Initiative.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[var(--color-secondary-sage)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-secondary-sage)] animate-pulse" />
              All Systems Operational
            </span>
            <span>Warm Parchment Clinical System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
