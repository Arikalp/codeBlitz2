/**
 * components/layout/Navbar.tsx
 *
 * Floating glassmorphic navbar — rounded pill that sits centered
 * and shrinks inward on scroll with a smooth animation.
 * Client component — handles scroll-based styling and mobile menu.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Stethoscope } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "#features", label: "Benefits" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "Reviews" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      {/* ── Floating pill container ───────────────────────── */}
      <div
        className="pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: scrolled ? "min(880px, 92vw)" : "min(1280px, 100vw)",
          marginTop: scrolled ? "12px" : "0px",
          borderRadius: scrolled ? "9999px" : "0px",
        }}
      >
        <div
          className={[
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border",
            scrolled
              ? "bg-white/55 backdrop-blur-2xl shadow-[0_4px_24px_0_rgba(94,52,0,0.06),0_1px_3px_0_rgba(94,52,0,0.04)] border-white/50 rounded-full"
              : "bg-white/25 backdrop-blur-md border-transparent rounded-none",
          ].join(" ")}
        >
          <nav
            className={[
              "flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              scrolled
                ? "h-14 px-4 sm:px-6"
                : "h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",
            ].join(" ")}
            aria-label="Main navigation"
          >
            {/* ── Logo ───────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="HealthSetu home"
            >
              <div
                className={[
                  "rounded-xl bg-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500",
                  scrolled ? "size-8" : "size-9",
                ].join(" ")}
              >
                <span className="text-white font-heading font-bold text-sm">H</span>
              </div>
              <span
                className={[
                  "font-heading font-bold text-foreground tracking-tight transition-all duration-500",
                  scrolled ? "text-base" : "text-lg",
                ].join(" ")}
              >
                HealthSetu
              </span>
            </Link>

            {/* ── Center Pill Nav (Desktop) ──────────────── */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <ul
                className={[
                  "flex items-center gap-0.5 rounded-full transition-all duration-500",
                  scrolled
                    ? "px-1 py-1 bg-white/40 border border-white/50 shadow-[0_1px_8px_0_rgba(94,52,0,0.03)]"
                    : "px-2 py-1.5 bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_2px_16px_0_rgba(94,52,0,0.04)]",
                ].join(" ")}
                role="list"
              >
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className={[
                        "rounded-full font-medium text-muted-foreground hover:text-foreground hover:bg-white/70 transition-all duration-200",
                        scrolled ? "px-4 py-1.5 text-[13px]" : "px-5 py-2 text-sm",
                      ].join(" ")}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right CTA (Desktop) ────────────────────── */}
            <div className="hidden md:flex items-center shrink-0">
              <Link href="/dashboard" className="relative group flex items-center">
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full bg-accent text-white font-semibold shadow-md hover:bg-accent/90 transition-all duration-500 hover:shadow-lg",
                    scrolled ? "px-5 py-2 text-[13px]" : "px-6 py-2.5 text-sm",
                  ].join(" ")}
                >
                  Book Now
                </span>
                <span
                  className={[
                    "relative rounded-full bg-white border-2 border-accent/10 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500",
                    scrolled ? "-ml-2.5 size-8" : "-ml-3 size-10",
                  ].join(" ")}
                >
                  <Stethoscope
                    className={[
                      "text-accent stroke-[1.5] transition-all duration-500",
                      scrolled ? "size-3.5" : "size-4",
                    ].join(" ")}
                  />
                </span>
              </Link>
            </div>

            {/* ── Mobile menu button ──────────────────────── */}
            <button
              id="mobile-menu-button"
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-primary-tint/60 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <X className="size-5 stroke-[1.5]" />
              ) : (
                <Menu className="size-5 stroke-[1.5]" />
              )}
            </button>
          </nav>
        </div>

        {/* ── Mobile Menu — glassmorphic dropdown ──────── */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden mt-2 mx-3 bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-lg px-4 py-4 animate-fade-in"
          >
            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/70 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 px-2">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold shadow-md hover:bg-accent/90 transition-all"
              >
                <Stethoscope className="size-4 stroke-[1.5]" />
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
