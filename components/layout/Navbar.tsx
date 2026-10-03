/**
 * components/layout/Navbar.tsx
 *
 * Top navigation bar.
 * Client component — handles scroll-based styling and mobile menu toggle.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { HeartPulse, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-case", label: "Use Case" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, patient, isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const displayName = patient?.name || user?.email?.split("@")[0] || "User";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[var(--color-border-subtle)] shadow-sm"
          : "bg-[#FAF6F0]/70 backdrop-blur-sm border-b border-[var(--color-border-subtle)]/50",
      ].join(" ")}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="HealthSetu home"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-container)] text-white flex items-center justify-center shadow-warm transition-transform group-hover:scale-105">
            <HeartPulse aria-hidden="true" size={22} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl text-[var(--color-text-primary)] tracking-tight leading-none">
              HealthSetu
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mt-0.5">
              Clinical Care Bridge
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--color-timeline-node-bg)] text-[var(--color-text-primary)] flex items-center justify-center text-[10px] font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="truncate max-w-[120px]">{displayName}</span>
              </Link>
              <Link href="/dashboard">
                <Button variant="primary" size="sm" aria-label="Open dashboard">
                  Go to Dashboard →
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" aria-label="Sign in">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" aria-label="Register">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          id="mobile-menu-button"
          className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-[var(--color-surface-card)] border-b border-[var(--color-border-subtle)] px-4 py-4 animate-fade-in shadow-card"
        >
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">Dashboard →</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
