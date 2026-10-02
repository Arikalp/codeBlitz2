/**
 * components/layout/Footer.tsx
 *
 * Global footer — server component.
 */

import { Heart } from "lucide-react";

const FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border/40 bg-white/60 backdrop-blur-sm"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-8">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xs">H</span>
              </div>
              <span className="font-heading font-bold text-lg text-foreground tracking-tight">
                HealthSetu
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-center sm:text-left">
              Connecting records to support continuity of care.
            </p>
          </div>

          {/* Links */}
          <ul className="flex flex-wrap items-center gap-6" role="list">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/60">
            &copy; {year} HealthSetu. Hackathon prototype — demo mode uses
            synthetic data only.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground/60">
            Made with
            <Heart className="size-3 text-primary fill-primary stroke-[1.5]" />
            for patient care
          </p>
        </div>
      </div>
    </footer>
  );
}
