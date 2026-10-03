/**
 * components/layout/Topbar.tsx
 *
 * Top bar for the app shell — mobile hamburger menu button,
 * page title, and right-side actions.
 */

"use client";

import { Menu, Bell, Search } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      {/* Mobile menu toggle */}
      <button
        type="button"
        id="sidebar-menu-toggle"
        onClick={onMenuOpen}
        className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-[var(--color-text-primary)] truncate">
        {title}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        <button
          type="button"
          className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
        </button>

        {/* Profile Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-brand-300)] transition-colors text-xs font-semibold text-[var(--color-text-primary)]"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--color-brand-600)] text-white flex items-center justify-center text-[10px] font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline-block max-w-[100px] truncate">{name}</span>
        </Link>
      </div>
    </header>
  );
}
