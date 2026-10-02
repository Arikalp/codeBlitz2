/**
 * app/dashboard/profile/page.tsx
 *
 * /dashboard/profile — Patient profile and settings.
 */

import type { Metadata } from "next";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Droplets,
  ShieldAlert,
  Contact,
  Lock,
  Bell,
  Trash2,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { MOCK_PATIENT } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  const p = MOCK_PATIENT;

  return (
    <AppShell title="Profile & Settings">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Profile header */}
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-24 rounded-t-2xl"
            style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-500))" }}
          />
          <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-[var(--color-surface)] text-3xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))" }}
            >
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{p.name}</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {p.age} yrs · {p.gender} · {p.bloodGroup}
              </p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">
                ⚠️ DEMO — ABHA ID: {p.abhaId}
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card>
            <SectionTitle icon={User} title="Personal Information" />
            <InfoList
              items={[
                { label: "Date of Birth", value: formatDate(p.dateOfBirth) },
                { label: "Gender",        value: p.gender },
                { label: "Blood Group",   value: p.bloodGroup, className: "text-red-600 font-semibold" },
              ]}
            />
          </Card>

          {/* Contact */}
          <Card>
            <SectionTitle icon={Phone} title="Contact Details" />
            <InfoList
              items={[
                { label: "Phone",   value: p.phone, icon: Phone },
                { label: "Email",   value: p.email, icon: Mail },
                { label: "Address", value: p.address, icon: MapPin },
              ]}
            />
          </Card>

          {/* Medical flags */}
          <Card>
            <SectionTitle icon={ShieldAlert} title="Medical Flags" />
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                  <Droplets size={12} className="text-red-500" /> Allergies
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.allergies.map((a) => (
                    <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Active Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {p.conditions.map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency contact */}
          <Card>
            <SectionTitle icon={Contact} title="Emergency Contact" />
            <InfoList
              items={[
                { label: "Name",     value: p.emergencyContact.name },
                { label: "Relation", value: p.emergencyContact.relation },
                { label: "Phone",    value: p.emergencyContact.phone },
              ]}
            />
          </Card>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Account Settings</h2>

          {[
            { icon: Lock,  label: "Change Password",         desc: "Update your account password" },
            { icon: Bell,  label: "Notification Preferences",desc: "Manage email and push notifications" },
          ].map(({ icon: Icon, label, desc }) => (
            <Card key={label} padding="md">
              <button type="button" className="w-full flex items-center gap-4 text-left">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
                </div>
                <span className="text-[var(--color-text-muted)] text-xs">→</span>
              </button>
            </Card>
          ))}

          {/* Danger zone */}
          <Card className="border-red-200 bg-red-50/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <Trash2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Delete Account</p>
                <p className="text-xs text-red-500">Permanently remove your account and all data.</p>
              </div>
              <button type="button" className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-100 transition-colors font-medium">
                Delete
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={15} className="text-[var(--color-brand-500)]" />
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
    </div>
  );
}

function InfoList({ items }: { items: { label: string; value: string; icon?: typeof User; className?: string }[] }) {
  return (
    <div className="space-y-2.5">
      {items.map(({ label, value, className }) => (
        <div key={label}>
          <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
          <p className={["text-sm text-[var(--color-text-primary)] font-medium", className ?? ""].join(" ")}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
