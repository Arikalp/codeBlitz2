/**
 * components/layout/AppSidebar.tsx
 *
 * Left sidebar for the app shell (dashboard, timeline, documents, etc.).
 * Client component — handles active route highlighting and mobile drawer.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  FolderOpen,
  Bot,
  User,
  Settings,
  LogOut,
  X,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";


const NAV_ITEMS = [
  { href: "/dashboard",          label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/timeline", label: "Timeline",    icon: Clock },
  { href: "/dashboard/documents",label: "Documents",   icon: FolderOpen },
  { href: "/dashboard/ai",       label: "AI Assistant",icon: Bot },
  { href: "/dashboard/consent",  label: "Consent",     icon: ShieldCheck },
  { href: "/dashboard/profile",  label: "Profile",     icon: User },
] as const;

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, patient, practitioner, facility, logout } = useAuth();

  const name =
    patient?.name ||
    practitioner?.name ||
    (user?.role === "facility_admin" ? (facility?.name || "Facility Admin") : null) ||
    user?.email ||
    "User";

  const email = user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="app-sidebar"
        className={[
          "fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[var(--color-border)]",
          "bg-[var(--color-surface)] transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        ].join(" ")}
        aria-label="App navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-[var(--color-brand-600)] text-lg"
            onClick={onClose}
          >
            <Stethoscope size={22} strokeWidth={2} />
            <span>HealthSetu</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] text-xs text-[var(--color-brand-700)] font-semibold flex items-center justify-between">
          <span>Role: {user?.role ? user.role.toUpperCase() : "PATIENT"}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* User mini-card */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))" }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">
          <ul className="space-y-1" role="list">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-[var(--color-brand-600)] text-white shadow-sm shadow-[var(--color-brand-500)]/30"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[var(--color-border)] space-y-1">
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Settings size={18} strokeWidth={1.8} />
            Settings
          </Link>
          <button
            id="sidebar-signout-btn"
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
