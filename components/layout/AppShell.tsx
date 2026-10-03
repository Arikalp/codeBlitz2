/**
 * components/layout/AppShell.tsx
 *
 * Wrapper that combines AppSidebar + Topbar + main content area.
 * Used by all dashboard pages via the dashboard layout.
 * Client component — manages sidebar open/close state.
 */

"use client";

import { useState } from "react";
import AppSidebar from "./AppSidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AppShell({ title, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar title={title} onMenuOpen={() => setSidebarOpen(true)} />

        {/* Scrollable content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
