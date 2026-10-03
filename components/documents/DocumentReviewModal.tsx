/**
 * components/documents/DocumentReviewModal.tsx
 *
 * Side-by-side interactive document review interface for medical reports.
 * Allows patients to inspect the original document (PDF/Image) on one side
 * while reviewing, correcting, and confirming extracted clinical fields on the other.
 *
 * Medical Safety Features:
 * - Clear AI-assistance disclaimer banner.
 * - Displays confidence score and highlights uncertain/unreadable fields.
 * - Editable fields with real-time validation before updating the longitudinal timeline.
 * - Retry extraction handling and safe error states.
 */

"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  FileText,
  Calendar,
  Building2,
  User,
  FlaskConical,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { RECORD_CATEGORIES, RECORD_CATEGORY_LABELS } from "@/validators/documents";

interface Measurement {
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  flag?: "normal" | "high" | "low" | "abnormal";
}

interface ReviewModalProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

interface DocMeta {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  facility: string;
  practitioner?: string | null;
  clinicalDate: string | Date;
  recordCategory: string;
  status: string;
}

interface ExtractionData {
  id: string;
  status: string;
  extractedFormat: string;
  rawText: string;
  structuredData?: {
    title?: string;
    documentType?: string;
    clinicalDate?: string | null;
    facility?: string | null;
    clinician?: string | null;
    findings?: string | null;
    impression?: string | null;
    measurements?: Measurement[];
  };
  confidenceScore?: number;
  uncertainFields?: string[];
  userReviewed: boolean;
  reviewedAt?: string | null;
  errorDetails?: string | null;
  updatedAt: string;
}

export default function DocumentReviewModal({
  documentId,
  isOpen,
  onClose,
  onConfirmed,
}: ReviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Document metadata
  const [docMeta, setDocMeta] = useState<DocMeta | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);

  // Editable form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [clinicalDate, setClinicalDate] = useState("");
  const [facility, setFacility] = useState("");
  const [practitioner, setPractitioner] = useState("");
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    let ignore = false;
    if (!isOpen || !documentId) return;

    async function loadData() {
      try {
        setError(null);
        const res = await fetch(`/api/documents/${documentId}/extraction`, {
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) {
          throw new Error("Unable to fetch document extraction details");
        }

        const data = await res.json();
        if (!ignore) {
          setDocMeta(data.data.document);
          const ext = data.data.extraction;
          setExtraction(ext);

          const struct = ext?.structuredData || {};
          setTitle(struct.title || data.data.document.title || "");
          setCategory(struct.documentType || data.data.document.recordCategory || "other");

          const rawDate = struct.clinicalDate || data.data.document.clinicalDate;
          if (rawDate) {
            try {
              setClinicalDate(new Date(rawDate).toISOString().split("T")[0]);
            } catch {
              setClinicalDate("");
            }
          } else {
            setClinicalDate("");
          }

          setFacility(struct.facility || data.data.document.facility || "");
          setPractitioner(struct.clinician || data.data.document.practitioner || "");
          setFindings(struct.findings || "");
          setImpression(struct.impression || data.data.document.notes || "");
          setMeasurements(struct.measurements || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Fetch extraction error:", err);
          setError(err instanceof Error ? err.message : "Failed to load extraction");
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [isOpen, documentId, reloadKey]);

  // Handle Retry Extraction
  const handleRetry = async () => {
    if (!documentId) return;
    try {
      setRetrying(true);
      setError(null);

      const res = await fetch(`/api/documents/${documentId}/extraction`, {
        method: "POST",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Retry extraction failed");
      }

      setLoading(true);
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      console.error("Retry extraction error:", err);
      setError(err instanceof Error ? err.message : "Extraction failed to process");
    } finally {
      setRetrying(false);
    }
  };

  // Handle Confirm and Save
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) return;

    if (!title.trim()) {
      setError("Please provide a title for this medical document");
      return;
    }

    if (!facility.trim()) {
      setError("Please specify the facility or hospital name");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        title: title.trim(),
        recordCategory: category,
        clinicalDate: clinicalDate || new Date().toISOString().split("T")[0],
        facility: facility.trim(),
        practitioner: practitioner.trim() || null,
        findings: findings.trim() || null,
        impression: impression.trim() || null,
        measurements: measurements.filter((m) => m.name.trim() && m.value.trim()),
      };

      const res = await fetch(`/api/documents/${documentId}/extraction`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to confirm and save extraction");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onConfirmed();
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Confirm error:", err);
      setError(err instanceof Error ? err.message : "Failed to confirm extraction");
    } finally {
      setSaving(false);
    }
  };

  // Measurement rows editing
  const handleAddMeasurement = () => {
    setMeasurements((prev) => [
      ...prev,
      { name: "", value: "", unit: "", referenceRange: "", flag: "normal" },
    ]);
  };

  const handleUpdateMeasurement = (index: number, field: keyof Measurement, val: string) => {
    setMeasurements((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveMeasurement = (index: number) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || !documentId) return null;

  const isPdf = docMeta?.mimeType === "application/pdf";
  const viewUrl = `/api/documents/${documentId}/view`;
  const confidenceScore = extraction?.confidenceScore ?? 0.85;
  const uncertainFields: string[] = extraction?.uncertainFields || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-600)] flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h2
                id="review-modal-title"
                className="text-base font-bold text-[var(--color-text-primary)] truncate"
              >
                Review Medical Extraction: {docMeta?.title || "Document"}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                AI extraction draft · Original file: {docMeta?.originalFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying || loading}
              title="Re-run LangChain extraction pipeline"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
            >
              <RotateCw size={13} className={retrying ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Re-Extract</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
              aria-label="Close review dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Clinical Safety Notice:</strong> AI extraction is a preliminary draft.
              Verify all extracted values against your original medical document before confirming.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={[
                "px-2.5 py-0.5 rounded-full font-semibold text-[11px] border",
                confidenceScore >= 0.8
                  ? "bg-emerald-100/80 text-emerald-800 border-emerald-300"
                  : "bg-amber-100/80 text-amber-800 border-amber-300",
              ].join(" ")}
            >
              {Math.round(confidenceScore * 100)}% Extraction Confidence
            </span>
          </div>
        </div>

        {/* Main Content (Split View) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
          {/* Left Panel: Original Document Viewer */}
          <div className="flex flex-col h-full bg-slate-900/5 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} /> Original Uploaded Document
              </span>
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-brand-600)] hover:underline flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="flex-1 min-h-[350px] lg:min-h-[500px] rounded-xl border border-[var(--color-border)] bg-white overflow-hidden shadow-xs flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={viewUrl}
                  title="Document Preview"
                  className="w-full h-full min-h-[500px]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewUrl}
                  alt={docMeta?.title || "Medical Document"}
                  className="max-h-[500px] max-w-full object-contain p-2"
                />
              )}
            </div>

            {extraction?.rawText && (
              <details className="mt-3 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-secondary)]">
                <summary className="font-semibold cursor-pointer text-[var(--color-brand-600)]">
                  View Raw Extracted Text ({extraction.rawText.length} chars)
                </summary>
                <pre className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] whitespace-pre-wrap font-mono text-[var(--color-text-muted)] max-h-40 overflow-y-auto">
                  {extraction.rawText}
                </pre>
              </details>
            )}
          </div>

          {/* Right Panel: Interactive Review Form */}
          <div className="flex flex-col h-full overflow-y-auto p-5 bg-[var(--color-surface)]">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Verify & Correct Clinical Details
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Edit any field below to correct OCR discrepancies before adding to your timeline.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success message */}
            {saveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Verified details saved! Updating your health records...</span>
              </div>
            )}

            {/* Uncertain Fields Warning */}
            {uncertainFields.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle size={13} />
                  Fields Requiring Attention:
                </p>
                <p className="text-[11px]">
                  The extraction model noted uncertainty or missing values in:{" "}
                  <strong>{uncertainFields.join(", ")}</strong>. Please review these fields carefully.
                </p>
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Record Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]"
                  >
                    {RECORD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {RECORD_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clinical Date, Facility, Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-1">
                    <Calendar size={11} /> Examination Date *
                  </label>
                  <input
                    type="date"
                    value={clinicalDate}
                    onChange={(e) => setClinicalDate(e.target.value)}
                    required
                    className={[
                      "w-full px-3 py-2 text-xs rounded-xl border bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]",
                      uncertainFields.includes("clinicalDate")
                        ? "border-amber-400 bg-amber-50/30"
                        : "border-[var(--color-border)]",
                    ].join(" ")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-1">
                    <Building2 size={11} /> Facility / Hospital *
                  </label>
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    placeholder="e.g. Apollo Hospital"
                    required
                    className={[
                      "w-full px-3 py-2 text-xs rounded-xl border bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]",
                      uncertainFields.includes("facility")
                        ? "border-amber-400 bg-amber-50/30"
                        : "border-[var(--color-border)]",
                    ].join(" ")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-1">
                    <User size={11} /> Clinician Name
                  </label>
                  <input
                    type="text"
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    placeholder="e.g. Dr. Ananya Roy"
                    className={[
                      "w-full px-3 py-2 text-xs rounded-xl border bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]",
                      uncertainFields.includes("clinician")
                        ? "border-amber-400 bg-amber-50/30"
                        : "border-[var(--color-border)]",
                    ].join(" ")}
                  />
                </div>
              </div>

              {/* Findings & Impression */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Findings / Observations
                </label>
                <textarea
                  rows={3}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Key observations or test results..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  Impression / Diagnosis Summary
                </label>
                <textarea
                  rows={2}
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Final impression, conclusion, or summary for timeline..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand-500)]"
                />
              </div>

              {/* Measurements & Lab Results Table */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <FlaskConical size={13} className="text-[var(--color-brand-600)]" />
                    Extracted Measurements & Diagnostic Values ({measurements.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMeasurement}
                    className="text-xs text-[var(--color-brand-600)] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add Test</span>
                  </button>
                </div>

                {measurements.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic py-2">
                    No discrete measurements extracted. You can add lab parameters manually if needed.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {measurements.map((m, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-1.5 items-center p-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs"
                      >
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => handleUpdateMeasurement(idx, "name", e.target.value)}
                          placeholder="Test Name"
                          className="col-span-4 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => handleUpdateMeasurement(idx, "value", e.target.value)}
                          placeholder="Value"
                          className="col-span-2 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={m.unit || ""}
                          onChange={(e) => handleUpdateMeasurement(idx, "unit", e.target.value)}
                          placeholder="Unit"
                          className="col-span-2 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={m.referenceRange || ""}
                          onChange={(e) =>
                            handleUpdateMeasurement(idx, "referenceRange", e.target.value)
                          }
                          placeholder="Ref Range"
                          className="col-span-3 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurement(idx)}
                          className="col-span-1 p-1 text-red-500 hover:text-red-700 flex justify-center"
                          aria-label="Remove measurement"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving || loading}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{saving ? "Confirming..." : "Confirm & Update Health Timeline"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
