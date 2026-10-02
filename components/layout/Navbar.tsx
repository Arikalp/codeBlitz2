/**
 * components/layout/Navbar.tsx
 *
 * Top navigation bar.
 * Client component — handles scroll-based styling and mobile menu toggle.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-case", label: "Use Case" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-[var(--color-brand-600)]"
          aria-label="HealthSetu home"
        >
          <span aria-hidden="true" className="text-2xl">🩺</span>
          <span>HealthSetu</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" disabled aria-label="Sign in – coming soon">
            Sign In
          </Button>
          <Button variant="primary" size="sm" disabled aria-label="Get started – coming soon">
            Get Started
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          id="mobile-menu-button"
          className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span aria-hidden="true" className="block w-5 h-0.5 bg-current mb-1 transition-transform" style={{ transform: menuOpen ? "rotate(45deg) translateY(6px)" : undefined }} />
          <span aria-hidden="true" className="block w-5 h-0.5 bg-current mb-1 transition-opacity" style={{ opacity: menuOpen ? 0 : 1 }} />
          <span aria-hidden="true" className="block w-5 h-0.5 bg-current transition-transform" style={{ transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : undefined }} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 pb-4 animate-fade-in"
        >
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" size="md" disabled className="w-full">Sign In</Button>
            <Button variant="primary" size="md" disabled className="w-full">Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
}
