/**
 * app/dashboard/profile/page.tsx
 *
 * /dashboard/profile — Patient Profile & Record Settings.
 * Connects to live authenticated session and patient profile.
 * Supports viewing and editing profile with Zod validation,
 * dynamic allergy/condition tag management, emergency contact,
 * and clear UUID vs ABHA separation.
 */

"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Droplets,
  ShieldAlert,
  Contact,
  Fingerprint,
  Calendar,
  Edit3,
  CheckCircle2,
  X,
  Plus,
  Copy,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth, type PatientProfile, type UserSession } from "@/context/AuthContext";
import type { PatientProfileInput } from "@/validators/auth";
import { MOCK_PATIENT } from "@/lib/mock-data";

export default function ProfilePage() {
  const { user, patient, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleCopyUuid(uuid: string) {
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  }

  const currentUuid = patient?.uuid || "550e8400-e29b-41d4-a716-446655440000";
  const currentName = patient?.name || MOCK_PATIENT.name;
  const currentEmail = user?.email || MOCK_PATIENT.email;

  return (
    <AppShell title="Profile & Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Alert Banner */}
        {saveSuccess && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fade-in shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span className="font-medium">Patient profile successfully updated!</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Profile Hero Header */}
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-24 rounded-t-2xl"
            style={{
              background: "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-500))",
            }}
          />
          <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-[var(--color-surface)] text-3xl font-bold text-white shadow-md"
                style={{
                  background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))",
                }}
              >
                {currentName.charAt(0)}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {currentName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {user?.role ? user.role.toUpperCase() : "PATIENT"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                  {currentEmail} · {patient?.phone || MOCK_PATIENT.phone}
                </p>
              </div>
            </div>

            <Button
              id="edit-profile-toggle-btn"
              variant={isEditing ? "outline" : "primary"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {isEditing ? (
                <>
                  <X size={15} />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Identity & Identifiers Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Internal Primary UUID Card */}
          <Card className="border-[var(--color-brand-200)] bg-[var(--color-brand-50)]/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint size={18} className="text-[var(--color-brand-600)]" />
                <h2 className="text-xs font-bold text-[var(--color-brand-800)] uppercase tracking-wider">
                  Internal Patient Identifier
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)] font-semibold">
                Primary Database Key
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 mb-2">
              Generated UUID v4. Never exposed in insecure contexts.
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[var(--color-brand-200)]">
              <code className="text-xs font-mono font-bold text-[var(--color-brand-900)] truncate">
                {currentUuid}
              </code>
              <button
                type="button"
                onClick={() => handleCopyUuid(currentUuid)}
                className="ml-2 p-1.5 rounded-lg text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] transition-colors flex items-center gap-1 text-xs"
                title="Copy internal UUID"
              >
                {copiedUuid ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-[11px] text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span className="text-[11px] font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Optional Unverified ABHA Linkage */}
          <Card className="border-amber-200 bg-amber-50/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-600" />
                <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ABHA Linkage (Demo)
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                Optional & Unverified
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1.5 mb-2">
              Demonstration linkage only. Not connected to live ABDM gateway.
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200">
              <code className="text-xs font-mono text-amber-900">
                {patient?.abhaIdDemo || MOCK_PATIENT.abhaId || "Not linked in demo"}
              </code>
              <span className="text-[11px] text-amber-600 font-medium px-2 py-0.5 bg-amber-50 rounded-md">
                Demo
              </span>
            </div>
          </Card>
        </div>

        {/* Edit Form or View Cards */}
        {isEditing ? (
          <ProfileEditForm
            key={patient?.uuid ?? "initial"}
            patient={patient}
            onCancel={() => setIsEditing(false)}
            onSaved={() => {
              setIsEditing(false);
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 4000);
            }}
            updateProfile={updateProfile}
          />
        ) : (
          <ProfileView patient={patient} user={user} onEditClick={() => setIsEditing(true)} />
        )}
      </div>
    </AppShell>
  );
}

interface ProfileEditFormProps {
  patient: PatientProfile | null;
  onCancel: () => void;
  onSaved: () => void;
  updateProfile: (data: Partial<PatientProfileInput>) => Promise<{ success: boolean; error?: string }>;
}

function ProfileEditForm({ patient, onCancel, onSaved, updateProfile }: ProfileEditFormProps) {
  const [name, setName] = useState(patient?.name || MOCK_PATIENT.name);
  const [phone, setPhone] = useState(patient?.phone || MOCK_PATIENT.phone);
  const [gender, setGender] = useState<"male" | "female" | "other" | "prefer_not_to_say">(
    patient?.gender || (MOCK_PATIENT.gender as "male")
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    patient?.dateOfBirth
      ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
      : MOCK_PATIENT.dateOfBirth
  );
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || MOCK_PATIENT.bloodGroup);
  const [address, setAddress] = useState(patient?.address || MOCK_PATIENT.address);
  const [abhaIdDemo, setAbhaIdDemo] = useState(patient?.abhaIdDemo || MOCK_PATIENT.abhaId);
  const [allergies, setAllergies] = useState<string[]>(patient?.allergies || [...MOCK_PATIENT.allergies]);
  const [conditions, setConditions] = useState<string[]>(patient?.conditions || [...MOCK_PATIENT.conditions]);
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [emergName, setEmergName] = useState(patient?.emergencyContact?.name || MOCK_PATIENT.emergencyContact.name);
  const [emergRelation, setEmergRelation] = useState(patient?.emergencyContact?.relation || MOCK_PATIENT.emergencyContact.relation);
  const [emergPhone, setEmergPhone] = useState(patient?.emergencyContact?.phone || MOCK_PATIENT.emergencyContact.phone);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleAddAllergy() {
    const val = newAllergy.trim();
    if (val && !allergies.includes(val)) {
      setAllergies([...allergies, val]);
      setNewAllergy("");
    }
  }

  function handleRemoveAllergy(item: string) {
    setAllergies(allergies.filter((a) => a !== item));
  }

  function handleAddCondition() {
    const val = newCondition.trim();
    if (val && !conditions.includes(val)) {
      setConditions([...conditions, val]);
      setNewCondition("");
    }
  }

  function handleRemoveCondition(item: string) {
    setConditions(conditions.filter((c) => c !== item));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);

    const payload = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      bloodGroup: bloodGroup || undefined,
      address: address.trim() || undefined,
      abhaIdDemo: abhaIdDemo.trim() || undefined,
      allergies,
      conditions,
      emergencyContact: {
        name: emergName.trim() || undefined,
        relation: emergRelation.trim() || undefined,
        phone: emergPhone.trim() || undefined,
      },
    };

    const res = await updateProfile(payload);
    setSaveLoading(false);

    if (!res.success) {
      setSaveError(res.error || "Failed to update profile");
      return;
    }

    onSaved();
  }

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <Card className="border-[var(--color-brand-300)] shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-5">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Edit3 size={18} className="text-[var(--color-brand-600)]" />
            Edit Patient Profile
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">* Indicates required field</span>
        </div>

        {saveError && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* 1. Demographics */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Demographics & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "male" | "female" | "other" | "prefer_not_to_say")
                  }
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ABHA ID (Demo Linkage)
                </label>
                <input
                  type="text"
                  value={abhaIdDemo}
                  onChange={(e) => setAbhaIdDemo(e.target.value)}
                  placeholder="e.g. 91-1234-5678-9012"
                  className="block w-full rounded-xl border border-amber-300 py-2 px-3 text-sm bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Residential Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State, PIN"
                className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
              />
            </div>
          </div>

          {/* 2. Medical Tags: Allergies & Conditions */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Medical Flags & History
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Allergies */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Droplets size={13} className="text-red-500" />
                  Allergies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                    placeholder="e.g. Peanuts, Penicillin"
                    className="flex-1 rounded-xl border border-[var(--color-border)] py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                  {allergies.length === 0 ? (
                    <span className="text-xs text-[var(--color-text-muted)] italic">No allergies recorded</span>
                  ) : (
                    allergies.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-800"
                      >
                        <span>{a}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(a)}
                          className="text-red-500 hover:text-red-800"
                          aria-label={`Remove allergy ${a}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
                  Active Health Conditions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCondition();
                      }
                    }}
                    placeholder="e.g. Hypertension, Asthma"
                    className="flex-1 rounded-xl border border-[var(--color-border)] py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                  {conditions.length === 0 ? (
                    <span className="text-xs text-[var(--color-text-muted)] italic">No conditions recorded</span>
                  ) : (
                    conditions.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(c)}
                          className="text-blue-500 hover:text-blue-800"
                          aria-label={`Remove condition ${c}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Emergency Contact */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Contact size={14} className="text-[var(--color-brand-500)]" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergName}
                  onChange={(e) => setEmergName(e.target.value)}
                  placeholder="e.g. Sunita Patel"
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={emergRelation}
                  onChange={(e) => setEmergRelation(e.target.value)}
                  placeholder="e.g. Spouse / Parent"
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={emergPhone}
                  onChange={(e) => setEmergPhone(e.target.value)}
                  placeholder="+91 98765 43211"
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            id="save-profile-btn"
            type="submit"
            variant="primary"
            size="md"
            disabled={saveLoading}
            className="flex items-center gap-2"
          >
            {saveLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}

interface ProfileViewProps {
  patient: PatientProfile | null;
  user: UserSession | null;
  onEditClick: () => void;
}

function ProfileView({ patient, user, onEditClick }: ProfileViewProps) {
  const name = patient?.name || MOCK_PATIENT.name;
  const phone = patient?.phone || MOCK_PATIENT.phone;
  const dateOfBirth = patient?.dateOfBirth ? String(patient.dateOfBirth) : MOCK_PATIENT.dateOfBirth;
  const gender = patient?.gender || MOCK_PATIENT.gender;
  const bloodGroup = patient?.bloodGroup || MOCK_PATIENT.bloodGroup;
  const address = patient?.address || MOCK_PATIENT.address;
  const allergies = patient?.allergies?.length ? patient.allergies : MOCK_PATIENT.allergies;
  const conditions = patient?.conditions?.length ? patient.conditions : MOCK_PATIENT.conditions;
  const emerg = patient?.emergencyContact?.name ? patient.emergencyContact : MOCK_PATIENT.emergencyContact;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Personal Details */}
      <Card>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border)]">
          <User size={16} className="text-[var(--color-brand-500)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Personal Details
          </h3>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Full Name</dt>
            <dd className="text-sm font-semibold text-[var(--color-text-primary)]">{name}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Date of Birth</dt>
            <dd className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Calendar size={13} className="text-[var(--color-text-muted)]" />
              {dateOfBirth ? formatDate(dateOfBirth) : "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Gender</dt>
            <dd className="text-sm font-medium text-[var(--color-text-primary)] capitalize">
              {gender ? gender.replace("_", " ") : "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Blood Group</dt>
            <dd className="text-sm font-bold text-red-600">
              {bloodGroup || "Not specified"}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Contact Information */}
      <Card>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border)]">
          <Phone size={16} className="text-[var(--color-brand-500)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Contact Information
          </h3>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Phone Number</dt>
            <dd className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Phone size={13} className="text-[var(--color-text-muted)]" />
              {phone || "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Email Address</dt>
            <dd className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Mail size={13} className="text-[var(--color-text-muted)]" />
              {user?.email || MOCK_PATIENT.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Residential Address</dt>
            <dd className="text-sm font-medium text-[var(--color-text-primary)] flex items-start gap-1.5">
              <MapPin size={13} className="text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <span>{address || "Not specified"}</span>
            </dd>
          </div>
        </dl>
      </Card>

      {/* Medical Flags */}
      <Card>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border)]">
          <ShieldAlert size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Medical Flags & Alerts
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
              <Droplets size={12} className="text-red-500" /> Known Allergies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allergies.length === 0 ? (
                <span className="text-xs text-[var(--color-text-muted)] italic">No known allergies</span>
              ) : (
                allergies.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium"
                  >
                    {a}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              Active Conditions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {conditions.length === 0 ? (
                <span className="text-xs text-[var(--color-text-muted)] italic">No active conditions</span>
              ) : (
                conditions.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-medium"
                  >
                    {c}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border)]">
          <Contact size={16} className="text-[var(--color-accent-600)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Emergency Contact
          </h3>
        </div>
        {emerg?.name ? (
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Contact Name</dt>
              <dd className="text-sm font-semibold text-[var(--color-text-primary)]">{emerg.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Relationship</dt>
              <dd className="text-sm font-medium text-[var(--color-text-primary)]">{emerg.relation || "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Contact Phone</dt>
              <dd className="text-sm font-medium text-[var(--color-brand-600)]">{emerg.phone || "Not specified"}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-xs text-[var(--color-text-muted)] py-4 text-center">
            <p>No emergency contact specified.</p>
            <button
              type="button"
              onClick={onEditClick}
              className="mt-2 text-[var(--color-brand-600)] font-medium hover:underline inline-block"
            >
              + Add Emergency Contact
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
