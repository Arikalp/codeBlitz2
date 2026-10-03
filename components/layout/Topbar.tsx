/**
 * components/layout/Topbar.tsx
 *
 * Top bar for the app shell — mobile hamburger menu button,
 * page title, and right-side actions.
 */

"use client";

import { Menu, Bell, Search, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  title: string;
  onMenuOpen: () => void;
}

export default function Topbar({ title, onMenuOpen }: TopbarProps) {
  const { user, patient } = useAuth();
  const name = patient?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]/90 backdrop-blur-md">
      {/* Left items: Mobile toggle & HealthSetu Verified badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          id="sidebar-menu-toggle"
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] text-[var(--color-secondary-sage)] text-xs font-semibold uppercase tracking-wider">
            <CheckCircle size={13} />
            <span>HealthSetu Verified Node</span>
          </div>
          <h1 className="text-sm sm:text-base font-heading font-semibold text-[var(--color-text-primary)] truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Pill */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] text-xs">
          <Info size={13} className="text-[var(--color-primary-container)]" />
          <span>Demo Mode · Synthetic data only</span>
        </div>

        <button
          type="button"
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <button
          type="button"
          className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-primary-container)]" aria-hidden="true" />
        </button>

        {/* Profile Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-container-high)] transition-all text-xs font-semibold text-[var(--color-text-primary)]"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--color-timeline-node-bg)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] flex items-center justify-center text-[10px] font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline-block max-w-[100px] truncate">{name}</span>
        </Link>
      </div>
    </header>
  );
}
