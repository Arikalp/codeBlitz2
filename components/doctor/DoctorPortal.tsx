/**
 * components/doctor/DoctorPortal.tsx
 *
 * Doctor Clinical Access Portal & Patient Record Lookup Console.
 * Allows medical practitioners to query patients by Unique Health ID (e.g. HS-PT-842910),
 * review longitudinal health timelines, inspect diagnostic documents, and record
 * consultation encounters under ABDM consent authorization.
 *
 * Designed in the Warm Parchment Clinical theme.
 */

"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Fingerprint,
  User,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  Calendar,
  Phone,
  MapPin,
  Clock,
  FolderOpen,
  FileText,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Building2,
  ArrowRight,
  Filter,
  X,
  Send,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import { useAuth } from "@/context/AuthContext";

interface PatientIdentity {
  id: string;
  uuid: string;
  patientUniqueId: string;
  name: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  phone?: string | null;
  address?: string | null;
  allergies: string[];
  conditions: string[];
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  } | null;
}

interface ClinicalTimelineRecord {
  id: string;
  title: string;
  category: string;
  clinicalDate: string;
  facility: string;
  doctor: string;
  summary: string;
  tags?: string[];
  hasDocument?: boolean;
  documentId?: string | null;
  source?: string;
}

interface PatientDocument {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  recordCategory: string;
  clinicalDate: string;
  facility: string;
  practitioner?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

interface LookupDossier {
  patient: PatientIdentity;
  records: ClinicalTimelineRecord[];
  documents: PatientDocument[];
  stats: {
    totalRecords: number;
    totalDocuments: number;
    allergiesCount: number;
    conditionsCount: number;
  };
  consentAudit: {
    authorized: boolean;
    protocol: string;
    accessTimestamp: string;
    doctor: string;
    specialty: string;
    registrationNumber: string;
  };
}

interface ConsentItem {
  id: string;
  consentId: string;
  patientUniqueId: string;
  patientName: string;
  requestedBy: string;
  facility: string;
  purpose: string;
  requestedRecords: string[];
  status: "pending" | "approved" | "denied" | "revoked";
  requestedAt: string;
  expiresAt: string;
  approvedAt?: string | null;
}

export default function DoctorPortal() {
  const { user, practitioner } = useAuth();
  const [searchQuery, setSearchQuery] = useState("HS-PT-842910");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<LookupDossier | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "documents" | "consents" | "new_encounter">("timeline");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(false);

  // Consent / Report Request state
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestPurpose, setRequestPurpose] = useState("Diabetology & Longitudinal Lab Trend Assessment");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "Diagnostic Lab Reports",
    "Prescriptions",
    "Consultation Notes",
  ]);
  const [requestDuration, setRequestDuration] = useState(30);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // New encounter form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("consultation_note");
  const [noteSummary, setNoteSummary] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Automatically load demo patient on first view
  useEffect(() => {
    handleLookup("HS-PT-842910");
  }, []);

  async function loadPatientConsents(patientUniqueId: string) {
    try {
      const res = await fetch(`/api/consent?patientId=${encodeURIComponent(patientUniqueId)}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        setConsents(json.data?.consents || []);
      }
    } catch (e) {
      console.error("Error loading patient consents:", e);
    }
  }

  async function handleLookup(idToQuery?: string) {
    const q = (idToQuery || searchQuery).trim();
    if (!q) {
      setSearchError("Please enter a Patient Unique ID to look up.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setNoteSuccess(false);
    setRequestSuccess(null);

    try {
      const res = await fetch(`/api/doctor/lookup?id=${encodeURIComponent(q)}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSearchError(
          data.error || `No patient record found matching Unique ID: "${q}". Verify the ID.`
        );
        setDossier(null);
        setConsents([]);
      } else {
        setDossier(data.data);
        if (data.data?.patient?.patientUniqueId) {
          loadPatientConsents(data.data.patient.patientUniqueId);
        }
      }
    } catch (err) {
      console.error("Patient lookup network error:", err);
      setSearchError("Network error while connecting to patient registry. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSendConsentRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!dossier) return;

    if (!requestPurpose.trim()) {
      setRequestError("Please specify a clinical purpose for the report request.");
      return;
    }

    if (selectedScopes.length === 0) {
      setRequestError("Please select at least one record type to request.");
      return;
    }

    setIsSubmittingRequest(true);
    setRequestError(null);
    setRequestSuccess(null);

    try {
      const res = await fetch("/api/doctor/consent/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: dossier.patient.patientUniqueId,
          purpose: requestPurpose.trim(),
          requestedRecords: selectedScopes,
          durationDays: requestDuration,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setRequestError(json.error || "Failed to submit report request.");
      } else {
        setRequestSuccess(`Consent request successfully sent to ${dossier.patient.name} (${dossier.patient.patientUniqueId}) via ABDM!`);
        if (json.data?.consent) {
          setConsents((prev) => [json.data.consent, ...prev]);
        }
        setTimeout(() => {
          setIsRequestModalOpen(false);
          setActiveTab("consents");
          setRequestSuccess(null);
        }, 1500);
      }
    } catch {
      setRequestError("Network error while submitting report request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  function handleCopyUniqueId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  async function handleSaveEncounter(e: React.FormEvent) {
    e.preventDefault();
    if (!dossier) return;

    if (!noteTitle.trim() || !noteSummary.trim()) {
      setNoteError("Please fill out both encounter title and clinical findings.");
      return;
    }

    setIsSavingNote(true);
    setNoteError(null);

    try {
      const res = await fetch("/api/doctor/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: dossier.patient.patientUniqueId,
          title: noteTitle.trim(),
          category: noteCategory,
          summary: noteSummary.trim(),
          facility: "Apex Multi-Specialty Hospital",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setNoteError(json.error || "Failed to append clinical record.");
      } else {
        setNoteSuccess(true);
        setNoteTitle("");
        setNoteSummary("");

        // Prepend new record to local list
        if (json.data?.record) {
          setDossier((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              records: [json.data.record, ...prev.records],
              stats: { ...prev.stats, totalRecords: prev.stats.totalRecords + 1 },
            };
          });
        }

        setTimeout(() => {
          setActiveTab("timeline");
          setNoteSuccess(false);
        }, 1500);
      }
    } catch {
      setNoteError("Failed to save encounter. Check network connection.");
    } finally {
      setIsSavingNote(false);
    }
  }

  const doctorDisplayName = practitioner?.name || "Dr. Priya Sharma";
  const doctorSpecialty = practitioner?.specialty || "General & Internal Medicine";

  // Filter timeline records
  const filteredRecords = dossier
    ? dossier.records.filter((r) => {
        if (categoryFilter === "all") return true;
        return r.category.toLowerCase().includes(categoryFilter.toLowerCase());
      })
    : [];

  return (
    <div className="max-w-[1180px] w-full mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)]">
            <Stethoscope size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] tracking-tight">
                Doctor Clinical Access Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] text-xs font-semibold border border-[#D4EAD9] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-sage)]" />
                ABDM Live Node
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Secure patient health record lookup via Unique Health ID under ABDM consent authorization.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end bg-[var(--color-surface-container-low)] p-3 rounded-xl border border-[var(--color-border-subtle)]">
          <span className="text-xs font-heading font-bold text-[var(--color-text-primary)]">
            {doctorDisplayName}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {doctorSpecialty} · Reg: KMC-48291
          </span>
        </div>
      </div>

      {/* Hero Patient Search Console Card */}
      <Card className="border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="patient-unique-id-input"
            className="font-heading text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2"
          >
            <Fingerprint size={18} className="text-[var(--color-primary-container)]" />
            Lookup Patient by Unique Health ID
          </label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <Search size={18} />
              </div>
              <input
                id="patient-unique-id-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Patient Unique ID (e.g. HS-PT-842910) or UUID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] font-mono text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]/30 focus:border-[var(--color-primary-container)] transition-all uppercase"
              />
            </div>

            <Button
              id="search-patient-btn"
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSearching}
              className="flex items-center justify-center gap-2 px-6"
            >
              {isSearching ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Retrieving Records...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Access Patient Record</span>
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo ID helper pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[var(--color-text-muted)]">Quick Demo Records:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("HS-PT-842910");
                handleLookup("HS-PT-842910");
              }}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--color-badge-consult-bg)] hover:bg-[#F9DECB] text-[var(--color-primary-container)] border border-[#F9DECB] transition-colors flex items-center gap-1.5"
            >
              <span>HS-PT-842910</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] font-normal">
                (Ramesh Patel · Diabetic Review)
              </span>
            </button>
          </div>
        </div>

        {/* Error message alert */}
        {searchError && (
          <div
            role="alert"
            className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3"
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">Patient Record Not Found</p>
              <p className="text-xs mt-0.5 text-red-700">{searchError}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Patient Dossier Content (when loaded) */}
      {dossier ? (
        <div className="space-y-6 animate-fade-in">
          {/* Patient Overview Card */}
          <Card className="relative overflow-hidden p-6 border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-primary-container)] via-[var(--color-timeline-connector)] to-[var(--color-primary-fixed)]"
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center font-heading text-3xl font-bold text-[var(--color-primary-container)] shadow-inner flex-shrink-0">
                  {dossier.patient.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading font-bold text-2xl text-[var(--color-text-primary)] tracking-tight">
                      {dossier.patient.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] font-mono text-xs font-semibold border border-[#F9DECB]">
                      PATIENT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] font-mono text-xs font-semibold border border-[#D4EAD9] flex items-center gap-1">
                      <ShieldCheck size={13} />
                      Consent Active
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                    <span className="capitalize">
                      {dossier.patient.gender || "Male"} · {dossier.patient.bloodGroup || "B+"}
                    </span>
                    {dossier.patient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-[var(--color-text-muted)]" />
                        {dossier.patient.phone}
                      </span>
                    )}
                    {dossier.patient.address && (
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin size={13} className="text-[var(--color-text-muted)]" />
                        {dossier.patient.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Unique Health ID Badge with 1-Click Copy */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 bg-[var(--color-badge-consult-bg)] rounded-xl px-4 py-3 border border-[#F9DECB] shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-card)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)]">
                    <Fingerprint size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-[var(--color-badge-consult-text)]">
                      Unique Health ID
                    </span>
                    <span className="font-mono text-base font-bold text-[var(--color-primary-container)] tracking-tight">
                      {dossier.patient.patientUniqueId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUniqueId(dossier.patient.patientUniqueId)}
                    className="p-1.5 rounded-lg bg-[var(--color-surface-card)] hover:bg-white text-[var(--color-primary-container)] border border-[#F9DECB] transition-all"
                    title="Copy Patient Unique ID"
                  >
                    {copiedId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>

                <Button
                  id="header-request-reports-btn"
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setRequestError(null);
                    setRequestSuccess(null);
                    setIsRequestModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-xs"
                >
                  <ShieldCheck size={16} />
                  <span>Request Patient Reports</span>
                </Button>
              </div>
            </div>

            {/* Medical Flags Banner (Allergies & Active Conditions) */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)]/60 -mx-6 -mb-6 p-4 sm:px-6 rounded-b-xl">
              <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mr-1">
                Clinical Alerts:
              </span>

              {dossier.patient.bloodGroup && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] text-xs font-semibold border border-[#D4EAD9]">
                  <Droplets size={12} />
                  {dossier.patient.bloodGroup} Blood Group
                </span>
              )}

              {dossier.patient.allergies.length > 0 ? (
                dossier.patient.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200"
                  >
                    <ShieldAlert size={12} />
                    Allergy: {allergy}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--color-text-muted)]">No known allergies</span>
              )}

              {dossier.patient.conditions.map((condition) => (
                <span
                  key={condition}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] text-xs border border-[#F9DECB] font-medium"
                >
                  {condition}
                </span>
              ))}

              {dossier.patient.emergencyContact && (
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                  Emergency: {dossier.patient.emergencyContact.name} ({dossier.patient.emergencyContact.relation}) · {dossier.patient.emergencyContact.phone}
                </span>
              )}
            </div>
          </Card>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] shadow-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Clinical Records
              </span>
              <p className="font-mono text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                {dossier.stats.totalRecords}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] shadow-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Uploaded Scans &amp; PDFs
              </span>
              <p className="font-mono text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                {dossier.stats.totalDocuments}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] shadow-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Diagnosed Conditions
              </span>
              <p className="font-mono text-2xl font-bold text-[var(--color-primary-container)] mt-1">
                {dossier.stats.conditionsCount}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] shadow-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Access Audit
              </span>
              <p className="text-xs font-semibold text-[var(--color-secondary-sage)] mt-1.5 flex items-center gap-1">
                <ShieldCheck size={14} /> ABDM Protocol OK
              </p>
            </div>
          </div>

          {/* Navigation Tabs for Records */}
          <div className="border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-heading text-sm font-semibold transition-all ${
                  activeTab === "timeline"
                    ? "border-[var(--color-primary-container)] text-[var(--color-primary-container)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Clock size={16} />
                <span>Longitudinal Timeline ({dossier.records.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-heading text-sm font-semibold transition-all ${
                  activeTab === "documents"
                    ? "border-[var(--color-primary-container)] text-[var(--color-primary-container)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <FolderOpen size={16} />
                <span>Diagnostic Documents ({dossier.documents.length})</span>
              </button>

              <button
                type="button"
                id="tab-consents-btn"
                onClick={() => setActiveTab("consents")}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-heading text-sm font-semibold transition-all ${
                  activeTab === "consents"
                    ? "border-[var(--color-primary-container)] text-[var(--color-primary-container)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <ShieldCheck size={16} />
                <span>Report Requests ({consents.length})</span>
                {consents.some((c) => c.status === "pending") && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary-container)] animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("new_encounter")}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-heading text-sm font-semibold transition-all ${
                  activeTab === "new_encounter"
                    ? "border-[var(--color-primary-container)] text-[var(--color-primary-container)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <PlusCircle size={16} />
                <span>Add Encounter / Note</span>
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRequestError(null);
                setRequestSuccess(null);
                setIsRequestModalOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 text-xs py-1.5"
            >
              <PlusCircle size={14} />
              <span>Request Records</span>
            </Button>
          </div>

          {/* TAB 1: Longitudinal Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mr-1">
                  <Filter size={13} /> Filter:
                </span>
                {["all", "lab_report", "prescription", "consultation", "discharge_summary"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                      categoryFilter === cat
                        ? "bg-[var(--color-primary-container)] text-white shadow-xs"
                        : "bg-[var(--color-surface-container-low)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-container-high)]"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Records List */}
              <div className="space-y-3">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <Card
                      key={record.id}
                      className="p-5 border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] hover:border-[var(--color-timeline-connector)]/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[var(--color-text-muted)]">
                              {new Date(record.clinicalDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase font-mono bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] border border-[#F9DECB]">
                              {record.category.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                              <Building2 size={12} />
                              {record.facility}
                            </span>
                          </div>

                          <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                            {record.title}
                          </h3>

                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                            {record.summary}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            <span className="text-[11px] text-[var(--color-text-muted)] mr-1">
                              Physician: {record.doctor}
                            </span>
                            {record.tags?.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-container-low)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {record.documentId && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/documents/${record.documentId}`);
                                if (res.ok) {
                                  const json = await res.json();
                                  setPreviewDoc(json.data?.document);
                                }
                              } catch (e) {
                                console.error("Document preview error:", e);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] border border-[var(--color-border-subtle)] hover:border-[#F9DECB] text-xs font-semibold transition-all self-start"
                          >
                            <Eye size={13} />
                            <span>View Report</span>
                          </button>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10 bg-[var(--color-surface-container-low)] rounded-2xl border border-dashed border-[var(--color-border-subtle)]">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No records found matching category &quot;{categoryFilter}&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Diagnostic Documents */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              {dossier.documents.length > 0 ? (
                dossier.documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="p-4 sm:p-5 border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] flex-shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-sm text-[var(--color-text-primary)] truncate">
                          {doc.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)] mt-0.5">
                          <span>{doc.facility}</span>
                          <span>·</span>
                          <span>
                            {new Date(doc.clinicalDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>·</span>
                          <span className="uppercase font-mono text-[10px] bg-[var(--color-surface-container-high)] px-1.5 py-0.5 rounded">
                            {doc.mimeType.split("/")[1] || "DOC"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] border border-[var(--color-border-subtle)] hover:border-[#F9DECB] text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        download
                        className="px-3 py-1.5 rounded-xl bg-[var(--color-primary-container)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-[var(--color-surface-container-low)] rounded-2xl border border-dashed border-[var(--color-border-subtle)]">
                  <FolderOpen size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    No Diagnostic Documents Uploaded
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    The patient has not uploaded raw imaging scans or lab PDFs yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Add Encounter / Consultation Note */}
          {activeTab === "new_encounter" && (
            <Card className="border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6">
              <form onSubmit={handleSaveEncounter} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                      Record Clinical Encounter for {dossier.patient.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Appends consultation findings directly to the patient&apos;s longitudinal timeline.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--color-primary-container)] bg-[var(--color-badge-consult-bg)] px-2.5 py-1 rounded-lg border border-[#F9DECB]">
                    ID: {dossier.patient.patientUniqueId}
                  </span>
                </div>

                {noteSuccess && (
                  <div
                    role="status"
                    className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fade-in"
                  >
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    <span>Encounter successfully recorded on patient&apos;s timeline!</span>
                  </div>
                )}

                {noteError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                    <span>{noteError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Encounter Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Diabetology Follow-up & Medication Review"
                      className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)] py-2.5 px-3.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]/20 focus:border-[var(--color-primary-container)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Record Category *
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)] py-2.5 px-3.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]/20 focus:border-[var(--color-primary-container)]"
                    >
                      <option value="consultation_note">Consultation Note</option>
                      <option value="prescription">Prescription / Medication Order</option>
                      <option value="lab_report">Lab Order / Assessment</option>
                      <option value="discharge_summary">Discharge Summary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Clinical Findings, Diagnosis &amp; Plan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={noteSummary}
                    onChange={(e) => setNoteSummary(e.target.value)}
                    placeholder="Document symptoms, vitals, adjusted medications, and follow-up guidance..."
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)] py-2.5 px-3.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]/20 focus:border-[var(--color-primary-container)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSavingNote}
                    className="flex items-center gap-2"
                  >
                    {isSavingNote ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Saving Encounter...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={15} />
                        <span>Save to Patient Timeline</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 4: Consent & Report Access Requests */}
          {activeTab === "consents" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--color-surface-container-low)] rounded-xl border border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[var(--color-text-primary)]">
                      ABDM Record Access Requests for {dossier.patient.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Clinical records and diagnostic reports can be requested through Unique Health ID ({dossier.patient.patientUniqueId}).
                    </p>
                  </div>
                </div>
                <Button
                  id="tab-action-request-reports-btn"
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setRequestError(null);
                    setRequestSuccess(null);
                    setIsRequestModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <PlusCircle size={14} />
                  <span>Request New Report</span>
                </Button>
              </div>

              {consents.length > 0 ? (
                <div className="space-y-3">
                  {consents.map((consent) => {
                    const isApproved = consent.status === "approved";
                    const isPending = consent.status === "pending";
                    const isRevoked = !isApproved && !isPending;

                    return (
                      <Card
                        key={consent.id}
                        className="p-5 border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] relative overflow-hidden transition-all hover:border-[var(--color-timeline-connector)]/50"
                      >
                        <div
                          className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                            isApproved
                              ? "bg-[var(--color-secondary-sage)]"
                              : isPending
                              ? "bg-[var(--color-primary-container)]"
                              : "bg-red-400"
                          }`}
                        />

                        <div className="pl-2 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[var(--color-primary-container)]">
                                  {consent.consentId}
                                </span>
                                {isApproved && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-verified-bg)] text-[var(--color-secondary-sage)] border border-[#D4EAD9] font-mono text-[11px] font-semibold uppercase">
                                    <CheckCircle2 size={12} /> Authorization Granted
                                  </span>
                                )}
                                {isPending && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-badge-consult-bg)] text-[var(--color-badge-consult-text)] border border-[#F9DECB] font-mono text-[11px] font-semibold uppercase">
                                    <Clock size={12} /> Pending Patient Review
                                  </span>
                                )}
                                {isRevoked && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono text-[11px] font-semibold uppercase">
                                    <AlertCircle size={12} /> Revoked / Denied
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                <span>Requester: <strong>{consent.requestedBy}</strong></span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Building2 size={12} className="text-[var(--color-text-muted)]" />
                                  {consent.facility}
                                </span>
                              </div>
                            </div>

                            <div className="text-right text-xs font-mono text-[var(--color-text-muted)]">
                              <div>Requested: {new Date(consent.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                              <div>Expires: {new Date(consent.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                            </div>
                          </div>

                          <div className="bg-[var(--color-surface-container-low)] p-3 rounded-xl border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
                            <span className="font-semibold text-[var(--color-text-primary)]">Clinical Purpose: </span>
                            {consent.purpose}
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--color-text-muted)] block mb-1.5">
                              Requested Record Categories:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {consent.requestedRecords.map((scope) => (
                                <span
                                  key={scope}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[var(--color-surface-container-high)] text-xs text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
                                >
                                  <FileText size={11} className="text-[var(--color-primary-container)]" />
                                  {scope}
                                </span>
                              ))}
                            </div>
                          </div>

                          {isApproved && (
                            <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                              <span className="text-xs text-[var(--color-secondary-sage)] font-medium flex items-center gap-1">
                                <ShieldCheck size={14} /> Full access unlocked under ABDM Consent Architecture
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveTab("documents")}
                                className="text-xs font-heading font-semibold text-[var(--color-primary-container)] hover:underline flex items-center gap-1"
                              >
                                <span>Inspect Patient Reports</span>
                                <ArrowRight size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-[var(--color-surface-container-low)] rounded-2xl border border-dashed border-[var(--color-border-subtle)] space-y-3">
                  <ShieldCheck size={36} className="mx-auto text-[var(--color-text-muted)]" />
                  <h4 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                    No Prior Report Requests for this Patient
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                    Need patient lab reports, prescriptions, or imaging scans? Initiate an ABDM consent request directly to their Unique Health ID.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setRequestError(null);
                      setRequestSuccess(null);
                      setIsRequestModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2"
                  >
                    <PlusCircle size={15} />
                    <span>Request Patient Reports</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State when no patient is searched yet */
        <div className="p-12 text-center bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border-subtle)] shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] mx-auto">
            <Fingerprint size={32} />
          </div>
          <h2 className="font-heading font-bold text-xl text-[var(--color-text-primary)]">
            Ready to Access Patient Records
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Enter the patient&apos;s Unique Health ID (e.g. <span className="font-mono font-bold text-[var(--color-primary-container)]">HS-PT-842910</span>) above to pull up their longitudinal clinical timeline, lab reports, and allergy profile under ABDM consent authorization.
          </p>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setSearchQuery("HS-PT-842910");
              handleLookup("HS-PT-842910");
            }}
            className="inline-flex items-center gap-2"
          >
            <span>Load Demo Patient: Ramesh Patel</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {/* Request Report Modal */}
      {isRequestModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingRequest) {
              setIsRequestModalOpen(false);
            }
          }}
        >
          <div
            className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-badge-consult-bg)] border border-[#F9DECB] flex items-center justify-center text-[var(--color-primary-container)] shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-[var(--color-text-primary)]">
                    Request Patient Reports
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Under ABDM Consent Framework · Unique ID Lookup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                disabled={isSubmittingRequest}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-container-high)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Patient Badge */}
            {dossier && (
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-badge-consult-bg)] text-[var(--color-primary-container)] font-heading font-bold text-xs flex items-center justify-center">
                    {dossier.patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-heading font-bold text-[var(--color-text-primary)]">
                      {dossier.patient.name}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      {dossier.patient.gender || "Patient"} · Blood: {dossier.patient.bloodGroup || "B+"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] uppercase font-bold text-[var(--color-badge-consult-text)] block">
                    Target Unique ID
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--color-primary-container)]">
                    {dossier.patient.patientUniqueId}
                  </span>
                </div>
              </div>
            )}

            {/* Notifications */}
            {requestSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            )}

            {requestError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSendConsentRequest} className="space-y-4">
              {/* Record Scopes */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                  Select Diagnostic &amp; Record Categories to Request *
                </label>
                <div className="space-y-2">
                  {[
                    "Diagnostic Lab Reports (Biochemistry, HbA1c, CBC)",
                    "Prescriptions & Active Medication Orders",
                    "Imaging & Diagnostic Scans (X-Ray, MRI, CT)",
                    "Consultation & Clinical Notes",
                    "Discharge Summaries & Hospital Records",
                  ].map((scope) => {
                    const checked = selectedScopes.includes(scope);
                    return (
                      <label
                        key={scope}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          checked
                            ? "bg-[var(--color-badge-consult-bg)]/50 border-[#F9DECB] text-[var(--color-text-primary)] font-medium"
                            : "bg-[var(--color-surface-container-low)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes((prev) => [...prev, scope]);
                            } else {
                              setSelectedScopes((prev) => prev.filter((s) => s !== scope));
                            }
                          }}
                          className="accent-[var(--color-primary-container)] w-4 h-4 rounded"
                        />
                        <span>{scope}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Purpose */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Clinical Purpose *
                  </label>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Presets below</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Diabetology & Longitudinal Lab Trend Assessment",
                    "Pre-Operative Workup & Surgical Clearance",
                    "Medication Reconciliation & Allergy Audit",
                    "Specialty Second Opinion & Diagnostic Review",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRequestPurpose(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left ${
                        requestPurpose === preset
                          ? "bg-[var(--color-primary-container)] text-white border-[var(--color-primary-container)]"
                          : "bg-[var(--color-surface-container-low)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-container-high)]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  required
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  placeholder="Describe clinical reason for requesting patient reports..."
                  className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-container-low)] py-2 px-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]/20 focus:border-[var(--color-primary-container)]"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
                  Access Validity Duration *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 7, label: "7 Days" },
                    { days: 15, label: "15 Days" },
                    { days: 30, label: "30 Days (Standard)" },
                    { days: 90, label: "90 Days" },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setRequestDuration(opt.days)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                        requestDuration === opt.days
                          ? "bg-[var(--color-badge-consult-bg)] border-[#F9DECB] text-[var(--color-primary-container)] shadow-xs"
                          : "bg-[var(--color-surface-container-low)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ABDM Consent Protocol Guarantee */}
              <div className="p-3 rounded-xl bg-[var(--color-badge-verified-bg)] border border-[#D4EAD9] flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[var(--color-secondary-sage)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  <strong className="text-[var(--color-secondary-sage)] font-semibold">ABDM Consent Protocol:</strong> An encrypted notification will be dispatched to the patient&apos;s HealthSetu portal. Access is only unlocked upon patient authorization.
                </p>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-border-subtle)]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={isSubmittingRequest}
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="submit-consent-request-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingRequest}
                  className="flex items-center gap-2"
                >
                  {isSubmittingRequest ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Sending Consent Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send ABDM Request</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
