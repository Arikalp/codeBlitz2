/**
 * components/layout/Topbar.tsx
 *
 * Top bar for the app shell — mobile hamburger menu button,
 * page title, and right-side actions.
 */

"use client";

import { Menu, Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  onMenuOpen: () => void;
}

export default function Topbar({ title, onMenuOpen }: TopbarProps) {
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
      <div className="flex items-center gap-1">
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
      </div>
    </header>
  );
}
