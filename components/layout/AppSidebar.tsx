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
import BrandLogo from "@/components/ui/BrandLogo";
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

  const isDoctor = user?.role === "doctor" || user?.role === "facility_admin";

  const navItems = isDoctor
    ? [
        { href: "/dashboard", label: "Patient Lookup", icon: LayoutDashboard },
        { href: "/dashboard/timeline", label: "Timeline Review", icon: Clock },
        { href: "/dashboard/documents", label: "Clinical Records", icon: FolderOpen },
        { href: "/dashboard/consent", label: "Consent Requests", icon: ShieldCheck },
        { href: "/dashboard/ai", label: "AI Diagnostic", icon: Bot },
        { href: "/dashboard/profile", label: "Doctor Profile", icon: User },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/timeline", label: "Timeline", icon: Clock },
        { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
        { href: "/dashboard/consent", label: "Consent", icon: ShieldCheck },
        { href: "/dashboard/ai", label: "AI Assistant", icon: Bot },
        { href: "/dashboard/profile", label: "Profile & Health ID", icon: User },
      ];

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
          "fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[var(--color-border-subtle)]",
          "bg-[var(--color-surface-container-low)] transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        ].join(" ")}
        aria-label="App navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <Link
            href="/dashboard"
            className="flex items-center group"
            onClick={onClose}
          >
            <BrandLogo
              size="sm"
              layout="horizontal"
              tagline={isDoctor ? "Doctor Console" : "Clinical Record"}
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-container-high)] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-3">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1.5">
            {isDoctor ? "Clinical Portal" : "Patient Care"}
          </span>
          <nav className="flex flex-col gap-1" aria-label="Primary navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                    active
                      ? "bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] font-semibold border border-[#F9DECB] shadow-[0_1px_3px_rgba(45,37,32,0.03)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-text-primary)]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-[var(--color-primary-container)]" : ""} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mt-5 mb-1.5">
            Preferences
          </span>
          <nav className="flex flex-col gap-1">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className={[
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-text-primary)] transition-all",
                pathname === "/dashboard/settings" ? "bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] font-semibold border border-[#F9DECB]" : "",
              ].join(" ")}
            >
              <Settings size={18} strokeWidth={1.8} />
              <span>Settings</span>
            </Link>
            <button
              id="sidebar-signout-btn"
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error-container)]/50 transition-colors text-left"
            >
              <LogOut size={18} strokeWidth={1.8} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Patient preview card at bottom */}
        <div className="mt-auto p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
          <div className="flex items-center gap-2.5 p-1 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-[var(--color-timeline-node-bg)] border border-[var(--color-border-subtle)] flex items-center justify-center font-heading text-sm font-semibold text-[var(--color-text-primary)] flex-shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading text-xs font-semibold text-[var(--color-text-primary)] truncate">
                {name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-sage)]" />
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] truncate">
                  {user?.role ? user.role.toUpperCase() : "PATIENT"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
