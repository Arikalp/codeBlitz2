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
import { Menu, X, Sparkles } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-case", label: "Use Case" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#features");
  const { user, patient, isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS
      .filter(({ href }) => href.startsWith("#"))
      .map(({ href }) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveSection(`#${visible.target.id}`);
      },
      { rootMargin: "-20% 0px -60%", threshold: [0.1, 0.35, 0.7] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const displayName = patient?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <nav
        className={[
          "pointer-events-auto max-w-7xl mx-auto mt-3 px-3 sm:px-5 lg:px-6 flex items-center justify-between h-[4.5rem] rounded-2xl border transition-all duration-300",
          scrolled
            ? "bg-[var(--color-surface-card)]/95 border-[var(--color-border-subtle)] shadow-card backdrop-blur-xl"
            : "bg-[var(--color-surface-card)]/80 border-[var(--color-border-subtle)]/70 shadow-subtle backdrop-blur-md",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Bespoke Brand Logo */}
        <Link
          href="/"
          className="flex items-center group"
          aria-label="HealthSetu home"
        >
          <BrandLogo size="md" layout="horizontal" tagline="Clinical Care Bridge" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1 rounded-xl bg-[var(--color-surface-container-low)] p-1" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const isAnchor = href.startsWith("#");
            const linkClass = [
              "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeSection === href
                ? "bg-[var(--color-surface-container-high)] text-[var(--color-text-primary)] shadow-subtle"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)]/70",
            ].join(" ");

            return (
              <li key={href}>
                {isAnchor ? (
                  <a href={href} aria-current={activeSection === href ? "page" : undefined} className={linkClass}>
                    {label}
                  </a>
                ) : (
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
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
          className="md:hidden p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] transition-colors active:scale-95"
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
          className="pointer-events-auto md:hidden max-w-7xl mx-auto mt-2 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] px-3 py-3 animate-fade-in shadow-card"
        >
          <ul className="flex flex-col gap-1 rounded-xl bg-[var(--color-surface-container-low)] p-1" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const isAnchor = href.startsWith("#");
              const mClass = [
                "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeSection === href
                  ? "bg-[var(--color-surface-container-high)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)]",
              ].join(" ");

              return (
                <li key={href}>
                  {isAnchor ? (
                    <a href={href} onClick={() => setMenuOpen(false)} aria-current={activeSection === href ? "page" : undefined} className={mClass}>
                      {label}
                    </a>
                  ) : (
                    <Link href={href} onClick={() => setMenuOpen(false)} className={mClass}>
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
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
