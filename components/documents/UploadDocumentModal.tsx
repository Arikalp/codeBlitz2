/**
 * components/documents/UploadDocumentModal.tsx
 *
 * Interactive modal for uploading medical documents (PDF, JPG, JPEG, PNG).
 * Captures document title, category, examination date, facility, clinician, and notes.
 * Validates inputs with Zod, validates file size (<=10MB) & MIME types,
 * and streams to the private storage backend.
 */

"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  ImageIcon,
  Calendar,
  Building2,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  RECORD_CATEGORIES,
  RECORD_CATEGORY_LABELS,
  validateUploadedFile,
} from "@/validators/documents";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("prescription");
  const [clinicalDate, setClinicalDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [facility, setFacility] = useState("");
  const [practitioner, setPractitioner] = useState("");
  const [notes, setNotes] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  function handleFileSelect(selectedFile: File) {
    setError(null);
    const validation = validateUploadedFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setFile(selectedFile);
    // Autofill title if empty
    if (!title) {
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a medical document to upload (PDF, JPG, or PNG)");
      return;
    }

    if (!title.trim() || title.length < 2) {
      setError("Document title must be at least 2 characters");
      return;
    }

    if (!facility.trim()) {
      setError("Facility or hospital name is required");
      return;
    }

    if (!clinicalDate) {
      setError("Clinical examination date is required");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("recordCategory", category);
      formData.append("clinicalDate", clinicalDate);
      formData.append("facility", facility.trim());
      if (practitioner.trim()) {
        formData.append("practitioner", practitioner.trim());
      }
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch {
      setError("Network error occurred during document upload.");
      setUploading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
              <Upload size={20} />
            </div>
            <div>
              <h2
                id="upload-modal-title"
                className="text-lg font-bold text-[var(--color-text-primary)]"
              >
                Upload Medical Record
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Securely store prescriptions, reports, scans, and notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div
            role="alert"
            className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in"
          >
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>Document encrypted and saved to your health record!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4.5">
          {/* File Drag & Drop Zone */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-1.5">
              Select Document File *
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors",
                dragActive
                  ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                  : file
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-brand-300)]",
              ].join(" ")}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-xs text-emerald-600">
                    {file.type === "application/pdf" ? (
                      <FileText size={24} />
                    ) : (
                      <ImageIcon size={24} />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate max-w-[280px]">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {(file.size / 1024).toFixed(0)} KB · Click to change file
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Upload size={24} className="text-[var(--color-brand-500)] mb-1.5" />
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Drag and drop your file here, or{" "}
                    <span className="text-[var(--color-brand-600)] underline">browse</span>
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                    Accepted: PDF, JPG, JPEG, PNG (Max 10 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label
              htmlFor="doc-title"
              className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
            >
              Document Title *
            </label>
            <input
              id="doc-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blood Sugar & Lipid Profile"
              className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
            />
          </div>

          {/* Record Category & Clinical Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="doc-category"
                className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
              >
                Record Category *
              </label>
              <select
                id="doc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              >
                {RECORD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {RECORD_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="doc-date"
                  className="block text-xs font-semibold text-[var(--color-text-primary)]"
                >
                  Clinical Date *
                </label>
                <span
                  title="The date when the test, scan, or consultation occurred"
                  className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5 cursor-help"
                >
                  <HelpCircle size={11} /> Date of Event
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                  <Calendar size={14} />
                </div>
                <input
                  id="doc-date"
                  type="date"
                  required
                  value={clinicalDate}
                  onChange={(e) => setClinicalDate(e.target.value)}
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 pl-9 pr-3 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                />
              </div>
            </div>
          </div>

          {/* Facility & Clinician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="doc-facility"
                className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
              >
                Hospital / Clinic / Lab *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                  <Building2 size={14} />
                </div>
                <input
                  id="doc-facility"
                  type="text"
                  required
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. Apex Hospital"
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 pl-9 pr-3 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="doc-doctor"
                className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
              >
                Treating Doctor (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                  <Stethoscope size={14} />
                </div>
                <input
                  id="doc-doctor"
                  type="text"
                  value={practitioner}
                  onChange={(e) => setPractitioner(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="block w-full rounded-xl border border-[var(--color-border)] py-2 pl-9 pr-3 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="doc-notes"
              className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1"
            >
              Clinical Notes / Findings (Optional)
            </label>
            <textarea
              id="doc-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Normal sinus rhythm, fasting blood sugar within normal range."
              className="block w-full rounded-xl border border-[var(--color-border)] py-2 px-3 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id="upload-record-submit-btn"
              type="submit"
              variant="primary"
              size="sm"
              disabled={uploading || success}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Uploading document...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Upload & Save Record</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
