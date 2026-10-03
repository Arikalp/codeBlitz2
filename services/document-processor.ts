/**
 * services/document-processor.ts
 *
 * Core Document-Processing Pipeline for HealthSetu Medical Reports using LangChain and Groq.
 *
 * Pipeline Steps:
 * 1. Format Detection (Digital PDF vs Scanned PDF vs Image).
 * 2. Text Extraction:
 *    - Digitally generated PDFs: Parsed using PDFParse.
 *    - Scanned PDFs & Images: Visual OCR using LangChain ChatGroq with vision models.
 * 3. Clinical Structuring via LangChain ChatGroq:
 *    - Structures raw text into clinical categories, findings, impressions, and measurements.
 *    - Employs strict medical safety prompts: NEVER fabricates missing dates, doctors, or diagnoses.
 *    - Flags uncertain or unreadable fields with confidence scoring.
 * 4. Safe Fallback:
 *    - If GROQ_API_KEY is absent or service unavailable, performs safe heuristic parsing
 *      without throwing unhandled errors or leaking sensitive clinical data in logs.
 */

import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { PDFParse } from "pdf-parse";
import { getStorageProvider } from "@/lib/storage";
import { Document, DocumentExtraction, type ExtractedFormat } from "@/models";
import type { MedicalRecordCategory } from "@/models/ClinicalRecord";

// ─── Zod Schema for Structured Extraction ────────────────────────────────────

const ExtractedMeasurementSchema = z.object({
  name: z.string().describe("Test or measurement name (e.g. Hemoglobin, Fasting Blood Sugar, Heart Rate)"),
  value: z.string().describe("Measured numerical or qualitative value"),
  unit: z.string().optional().describe("Measurement unit (e.g. g/dL, mg/dL, mmHg)"),
  referenceRange: z.string().optional().describe("Normal reference range if mentioned in document"),
  flag: z.enum(["normal", "high", "low", "abnormal"]).optional().describe("Clinical flag indicator"),
});

const ExtractionStructuredSchema = z.object({
  documentType: z.enum([
    "prescription",
    "ct_mri_report",
    "xray_report",
    "lab_report",
    "discharge_summary",
    "consultation_note",
    "other",
  ]).describe("Classified category of this medical document"),
  title: z.string().describe("Clear, concise document title (e.g. 'Complete Blood Count Report')"),
  clinicalDate: z.string().nullable().describe("Date of clinical examination or report in YYYY-MM-DD format. Null if not explicitly stated."),
  facility: z.string().nullable().describe("Hospital, diagnostic center, or clinic name. Null if not mentioned."),
  clinician: z.string().nullable().describe("Physician or doctor name with title. Null if not mentioned."),
  findings: z.string().nullable().describe("Objective findings, test descriptions, or prescribed medications."),
  impression: z.string().nullable().describe("Doctor's clinical conclusion, diagnosis, or radiological impression."),
  measurements: z.array(ExtractedMeasurementSchema).default([]),
  confidenceScore: z.number().min(0).max(1).describe("Confidence score from 0.0 to 1.0 reflecting OCR clarity and completeness"),
  uncertainFields: z.array(z.string()).default([]).describe("Names of fields that are missing, blurred, or ambiguous in the source document"),
});

export type ExtractedDataResult = z.infer<typeof ExtractionStructuredSchema>;

// ─── System Instructions for Clinical Safety ─────────────────────────────────

const MEDICAL_SYSTEM_PROMPT = `You are HealthSetu's Clinical Document Analysis assistant. Your role is to accurately extract and structure clinically relevant information from medical reports to save patients time during review.

CRITICAL MEDICAL SAFETY RULES:
1. NEVER fabricate or hallucinate any clinical information, doctor names, facility names, dates, medications, or findings.
2. If any field (e.g. doctor, date, facility, impression) is NOT explicitly mentioned or is illegible in the document, you MUST set it to null.
3. If text is blurry, truncated, or ambiguous, add the field name to 'uncertainFields' and lower the 'confidenceScore'.
4. Do NOT make medical diagnoses or propose treatments that are not explicitly documented in the report.
5. All extracted information is a preliminary draft that will be reviewed and verified by the patient before use.

Document Categories:
- prescription: Prescription slips with medication instructions.
- ct_mri_report: CT scan and MRI diagnostic imaging written reports.
- xray_report: Plain radiography and X-ray written reports.
- lab_report: Blood, urine, biochemistry, pathology, and microbiology laboratory tests.
- discharge_summary: Inpatient hospital discharge summaries.
- consultation_note: Outpatient clinical doctor notes, SOAP notes, referral letters.
- other: Vaccination cards, insurance claims, medical bills, or other health documents.`;

// ─── Main Pipeline Function ──────────────────────────────────────────────────

export async function processDocumentExtraction(
  documentId: string,
  patientUuid: string
): Promise<{
  success: boolean;
  extractionId?: string;
  error?: string;
}> {
  // 1. Fetch document metadata and verify patient ownership
  const doc = await Document.findOne({
    _id: documentId,
    deletedAt: null,
  });

  if (!doc) {
    return { success: false, error: "Document not found" };
  }

  if (doc.patientUuid !== patientUuid) {
    return { success: false, error: "Unauthorized access to document" };
  }

  // 2. Upsert DocumentExtraction record to 'processing' status
  let extraction = await DocumentExtraction.findOne({ documentId: doc._id });
  if (!extraction) {
    extraction = new DocumentExtraction({
      documentId: doc._id,
      patientUuid: doc.patientUuid,
      status: "processing",
    });
  } else {
    extraction.status = "processing";
    extraction.errorDetails = null;
  }
  await extraction.save();

  try {
    // 3. Retrieve original file buffer from private storage
    const storage = getStorageProvider();
    const isPdf =
      doc.mimeType === "application/pdf" ||
      (doc.originalFileName && doc.originalFileName.toLowerCase().endsWith(".pdf"));
    const resourceType = isPdf ? "raw" : "image";
    const fileBuffer = await storage.getFileBuffer(doc.storageKey, resourceType);

    // 4. Format Detection & Raw Text Extraction
    let extractedFormat: ExtractedFormat = "unknown";
    let rawText = "";

    if (isPdf) {
      try {
        const parser = new PDFParse({ data: fileBuffer });
        const textResult = await parser.getText();
        rawText = (textResult.text || "").trim();
        await parser.destroy();

        if (rawText.length >= 40 && /[a-zA-Z]/.test(rawText)) {
          extractedFormat = "digital_pdf";
        } else {
          extractedFormat = "scanned_pdf";
        }
      } catch {
        console.warn("Digital PDF parsing error; falling back to image/OCR representation.");
        extractedFormat = "scanned_pdf";
      }
    } else if (doc.mimeType.startsWith("image/")) {
      extractedFormat = "image";
    }

    // 5. Structure Content with LangChain ChatGroq (or Safe Fallback)
    const groqApiKey = process.env.GROQ_API_KEY;
    let structuredResult: ExtractedDataResult;

    if (groqApiKey) {
      structuredResult = await runLangChainExtraction(
        groqApiKey,
        extractedFormat,
        rawText,
        fileBuffer,
        doc.mimeType,
        doc.title
      );
    } else {
      // Safe heuristic extraction when GROQ_API_KEY is not set (e.g. offline local dev)
      structuredResult = runHeuristicFallbackExtraction(
        rawText,
        doc.originalFileName,
        doc.recordCategory,
        doc.clinicalDate,
        doc.facility,
        doc.practitioner
      );
    }

    // 6. Update extraction record in MongoDB
    extraction.status = "completed";
    extraction.extractedFormat = extractedFormat;
    extraction.rawText = rawText || "Visual document processed via OCR pipeline.";
    extraction.structuredData = {
      documentType: structuredResult.documentType,
      title: structuredResult.title || doc.title,
      clinicalDate: structuredResult.clinicalDate,
      facility: structuredResult.facility,
      clinician: structuredResult.clinician,
      findings: structuredResult.findings,
      impression: structuredResult.impression,
      measurements: structuredResult.measurements || [],
    };
    extraction.confidenceScore = structuredResult.confidenceScore;
    extraction.uncertainFields = structuredResult.uncertainFields;
    await extraction.save();

    // 7. Update Document status to indicate review is available
    doc.status = "pending_review";
    await doc.save();

    return {
      success: true,
      extractionId: extraction._id.toString(),
    };
  } catch (err) {
    const safeErrorMessage =
      err instanceof Error ? err.message : "Document extraction failed";

    // Update extraction status to failed without leaking sensitive patient data
    extraction.status = "failed";
    extraction.errorDetails = safeErrorMessage.slice(0, 500);
    await extraction.save();

    return {
      success: false,
      error: safeErrorMessage,
    };
  }
}

// ─── LangChain Execution with Groq ───────────────────────────────────────────

async function runLangChainExtraction(
  apiKey: string,
  format: ExtractedFormat,
  rawText: string,
  fileBuffer: Buffer,
  mimeType: string,
  fallbackTitle: string
): Promise<ExtractedDataResult> {
  const activeModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

  // If we have extracted digital text from a PDF, structure it with Groq LLM
  if (format === "digital_pdf" && rawText.length > 30) {
    try {
      const llm = new ChatGroq({
        apiKey,
        model: activeModel,
        temperature: 0.1,
      });

      const structuredLlm = llm.withStructuredOutput(ExtractionStructuredSchema);

      const messages = [
        new SystemMessage(MEDICAL_SYSTEM_PROMPT),
        new HumanMessage(
          `Extract structured clinical information from this medical document text. Keep in mind safety rules and return null for any field that is not present.\n\nDOCUMENT TEXT:\n${rawText.slice(0, 15000)}`
        ),
      ];

      const result = await structuredLlm.invoke(messages);
      return result as ExtractedDataResult;
    } catch (llmErr) {
      console.warn("LLM structured extraction warning; falling back to heuristic extraction:", llmErr);
      return runHeuristicFallbackExtraction(rawText, fallbackTitle, "other", new Date(), null, null);
    }
  }

  // For images and scanned documents, use Groq's multimodal vision model (llama-3.2-11b-vision-preview)
  if (format === "image" || format === "scanned_pdf") {
    try {
      const visionLlm = new ChatGroq({
        apiKey,
        model: "llama-3.2-11b-vision-preview",
        temperature: 0.1,
      });

      const structuredVisionLlm = visionLlm.withStructuredOutput(ExtractionStructuredSchema);

      const base64Image = fileBuffer.toString("base64");
      const effectiveMime = mimeType === "application/pdf" ? "image/png" : mimeType;
      const dataUrl = `data:${effectiveMime};base64,${base64Image}`;

      const messages = [
        new SystemMessage(MEDICAL_SYSTEM_PROMPT),
        new HumanMessage({
          content: [
            {
              type: "text",
              text: "Extract and structure all legible clinical information, laboratory measurements, doctor names, facility name, and impressions from this medical document image. Adhere strictly to the safety guidelines.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        }),
      ];

      const result = await structuredVisionLlm.invoke(messages);
      return result as ExtractedDataResult;
    } catch (visionErr) {
      console.warn("Vision model call failed or unsupported format; falling back to heuristic parsing:", visionErr);
    }
  }

  // Fallback if vision or text extraction is inconclusive
  return runHeuristicFallbackExtraction(rawText, fallbackTitle, "other", new Date(), null, null);
}

// ─── Heuristic Fallback Extractor (When GROQ_API_KEY is not set) ──────────────

export function runHeuristicFallbackExtraction(
  text: string,
  docTitle: string,
  existingCategory: MedicalRecordCategory,
  existingDate: Date,
  existingFacility: string | null,
  existingDoctor: string | null | undefined
): ExtractedDataResult {
  const uncertainFields: string[] = [];

  // Extract facility if pattern matches (e.g. Max Healthcare, Apollo Hospital, City Clinic)
  let facility = existingFacility;
  const facilityMatch = text.match(/(?:[A-Za-z0-9&.\s]{1,40})?(?:Hospital|Clinic|Diagnostic(?:\s+Centre|\s+Center|\s+Laboratory)?|Laboratory|Healthcare|Medical Center)[^\n]*/i);
  if (facilityMatch) {
    facility = facilityMatch[0].trim();
  } else if (!facility) {
    uncertainFields.push("facility");
  }

  // Extract clinician if pattern matches
  let clinician = existingDoctor || null;
  const doctorMatch = text.match(/Dr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/);
  if (doctorMatch) {
    clinician = doctorMatch[0].trim();
  } else if (!clinician) {
    uncertainFields.push("clinician");
  }

  // Extract date
  let clinicalDate: string | null = null;
  const dateMatch = text.match(/\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/);
  if (dateMatch) {
    try {
      clinicalDate = new Date(dateMatch[0]).toISOString().split("T")[0];
    } catch {
      clinicalDate = existingDate ? existingDate.toISOString().split("T")[0] : null;
    }
  } else {
    clinicalDate = existingDate ? existingDate.toISOString().split("T")[0] : null;
    uncertainFields.push("clinicalDate");
  }

  // Extract measurements (e.g. Hemoglobin: 13.5 g/dL)
  const measurements: z.infer<typeof ExtractedMeasurementSchema>[] = [];
  const measurementRegex = /([A-Za-z\s]{3,30})[:\-]\s*([\d.]+)\s*([a-zA-Z/%μ]+)?/g;
  let match;
  let count = 0;
  while ((match = measurementRegex.exec(text)) !== null && count < 10) {
    const name = match[1].trim();
    const value = match[2].trim();
    const unit = match[3] ? match[3].trim() : undefined;
    if (name.length > 2 && !/page|date|doctor|hospital|patient/i.test(name)) {
      measurements.push({
        name,
        value,
        unit,
        flag: "normal",
      });
      count++;
    }
  }

  // Category determination
  let category = existingCategory;
  if (/prescription|rx|tablet|capsule|mg\s+daily/i.test(text)) category = "prescription";
  else if (/x-ray|radiograph|chest pa/i.test(text)) category = "xray_report";
  else if (/ct scan|mri|computed tomography/i.test(text)) category = "ct_mri_report";
  else if (/hemoglobin|blood count|lipid profile|urinalysis|creatinine/i.test(text)) category = "lab_report";
  else if (/discharge summary|admission date|discharge date/i.test(text)) category = "discharge_summary";
  else if (/consultation|chief complaint|history of present illness/i.test(text)) category = "consultation_note";

  const confidenceScore = text.length > 100 ? 0.85 : text.length > 0 ? 0.65 : 0.4;
  if (confidenceScore < 0.7) {
    uncertainFields.push("findings");
  }

  return {
    documentType: category,
    title: docTitle || "Medical Document",
    clinicalDate,
    facility,
    clinician,
    findings: text.length > 0 ? text.slice(0, 1000) : "Document uploaded for patient review.",
    impression: /impression:?\s*([^\n.]+)/i.exec(text)?.[1]?.trim() || null,
    measurements,
    confidenceScore,
    uncertainFields,
  };
}
