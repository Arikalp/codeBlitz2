/**
 * app/dashboard/settings/page.tsx
 *
 * /dashboard/settings — App-level settings.
 */

import type { Metadata } from "next";
import { Settings, Palette, Globe, Shield, Database } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export const metadata: Metadata = { title: "Settings" };

const SETTINGS_SECTIONS = [
  {
    title: "Appearance",
    icon: Palette,
    items: [
      { label: "Theme", description: "System default (light/dark follows OS)", control: "select" },
      { label: "Language", description: "English (India)", control: "select" },
    ],
  },
  {
    title: "Privacy",
    icon: Shield,
    items: [
      { label: "Record visibility", description: "Only you can see your records", control: "toggle" },
      { label: "Analytics", description: "Share anonymous usage data to improve HealthSetu", control: "toggle" },
    ],
  },
  {
    title: "Data",
    icon: Database,
    items: [
      { label: "Export my data", description: "Download all your records as a ZIP archive", control: "button" },
      { label: "Import records", description: "Import records from a supported format", control: "button" },
    ],
  },
] as const;

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
            <Settings size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Settings</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Manage your HealthSetu preferences.</p>
          </div>
        </div>

        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
          ⚠️ <strong>Demo Mode</strong> — Settings changes are not persisted.
        </div>

        {SETTINGS_SECTIONS.map(({ title, icon: Icon, items }) => (
          <Card key={title} padding="none">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--color-border)]">
              <Icon size={15} className="text-[var(--color-brand-500)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {items.map(({ label, description, control }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {control === "toggle" && (
                      <div className="h-6 w-11 rounded-full bg-[var(--color-brand-500)] relative cursor-pointer">
                        <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    )}
                    {control === "select" && (
                      <select className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-brand-400)]">
                        <option>Default</option>
                      </select>
                    )}
                    {control === "button" && (
                      <button type="button" className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
                        Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* App info */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} className="text-[var(--color-brand-500)]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">About</h2>
          </div>
          <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
            <p>HealthSetu v0.1.0 · Hackathon Prototype</p>
            <p>All data is synthetic. Not for clinical use.</p>
            <p className="text-[var(--color-brand-500)] cursor-pointer hover:underline">Privacy Policy · Terms of Service</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
