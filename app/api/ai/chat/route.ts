/**
 * app/api/ai/chat/route.ts
 *
 * POST /api/ai/chat
 *
 * AI Health Assistant powered by Groq.
 * - Fetches authenticated patient's clinical history:
 *   - Patient profile (age, gender, blood group, allergies, conditions)
 *   - Longitudinal ClinicalRecords from MongoDB
 *   - Uploaded Documents and OCR / DocumentExtractions (findings, measurements)
 *   - Automatically extracts real PDF text if extractions were pending or empty
 * - Builds a grounded clinical system prompt with the full content of reports
 * - Streams responses back to the client using Server-Sent Events (SSE)
 *
 * Security:
 * - Session authenticated; patientUuid resolved server-side only.
 * - GROQ_API_KEY kept server-side.
 * - Clinical guardrails enforced: informational only, no medical prescribing.
 */

import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ClinicalRecord, Patient, Document as PatientDocument, DocumentExtraction } from "@/models";
import { getStorageProvider } from "@/lib/storage";
import { apiError } from "@/lib/api-response";

const PRIMARY_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
const FALLBACK_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"];
const MAX_RECORDS = 25;

interface PatientContext {
  name: string;
  age?: number | null;
  gender?: string | null;
  bloodGroup?: string | null;
  allergies: string[];
  conditions: string[];
  records: Array<{
    title: string;
    category: string;
    clinicalDate: string;
    facility: string;
    practitioner?: string | null;
    summary: string;
    tags: string[];
    documentFileName?: string | null;
    extractedText?: string | null;
    measurements?: Array<{ name: string; value: string; unit?: string; flag?: string }>;
  }>;
  documents: Array<{
    title: string;
    fileName: string;
    category: string;
    date: string;
    facility: string;
    notes?: string;
    contentPreview?: string | null;
  }>;
}

function calculateAge(dob?: Date | null): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function buildSystemPrompt(ctx: PatientContext): string {
  const profileItems: string[] = [`Name: ${ctx.name}`];
  if (ctx.age) profileItems.push(`Age: ~${ctx.age} years`);
  if (ctx.gender) profileItems.push(`Gender: ${ctx.gender}`);
  if (ctx.bloodGroup) profileItems.push(`Blood Group: ${ctx.bloodGroup}`);
  if (ctx.allergies && ctx.allergies.length > 0) {
    profileItems.push(`Known Allergies: ${ctx.allergies.join(", ")}`);
  }
  if (ctx.conditions && ctx.conditions.length > 0) {
    profileItems.push(`Known Conditions: ${ctx.conditions.join(", ")}`);
  }

  const recordsText =
    ctx.records.length > 0
      ? ctx.records
          .map((r, i) => {
            let item = `[Record ${i + 1}] ${r.title}
Category: ${r.category.replace(/_/g, " ").toUpperCase()}
Date: ${new Date(r.clinicalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
Facility / Hospital: ${r.facility}${r.practitioner ? `\nDoctor / Practitioner: ${r.practitioner}` : ""}
Summary: ${r.summary || "No summary provided"}`;

            if (r.documentFileName) {
              item += `\nAttached Document: ${r.documentFileName}`;
            }

            if (r.measurements && r.measurements.length > 0) {
              const measurementsStr = r.measurements
                .map((m) => `${m.name}: ${m.value}${m.unit ? " " + m.unit : ""}${m.flag ? ` (${m.flag})` : ""}`)
                .join("; ");
              item += `\nExtracted Test Measurements: ${measurementsStr}`;
            }

            if (r.extractedText) {
              item += `\nFULL REPORT CONTENT & LAB FINDINGS:\n"""\n${r.extractedText.slice(0, 8000)}\n"""`;
            }

            if (r.tags && r.tags.length > 0) {
              item += `\nTags: ${r.tags.join(", ")}`;
            }

            return item;
          })
          .join("\n\n")
      : "No clinical records recorded yet.";

  const docsText =
    ctx.documents.length > 0
      ? ctx.documents
          .map((d, i) => {
            let dItem = `[Document ${i + 1}] ${d.title} (${d.fileName}) - ${d.category.replace(/_/g, " ")} from ${d.facility} on ${new Date(d.date).toLocaleDateString("en-IN")}${d.notes ? ` (Notes: ${d.notes})` : ""}`;
            if (d.contentPreview) {
              dItem += `\nContent:\n"""\n${d.contentPreview.slice(0, 4000)}\n"""`;
            }
            return dItem;
          })
          .join("\n\n")
      : "No additional standalone documents.";

  return `You are HealthSetu AI, an expert, compassionate clinical assistant helping ${ctx.name} understand and analyze their personal medical history and previous reports.

PATIENT PROFILE:
${profileItems.join("\n")}

PATIENT CLINICAL RECORDS (${ctx.records.length} records available, sorted most recent first):
${recordsText}

ADDITIONAL UPLOADED DOCUMENTS (${ctx.documents.length} files):
${docsText}

CRITICAL INSTRUCTIONS FOR REPORT ANALYSIS:
1. When asked about a report or document, DO NOT merely say that a file is uploaded or repeat file metadata.
2. Read, analyze, and explain the ACTUAL MEDICAL CONTENT inside the report:
   - Specific lab numbers and test results (e.g. Hemoglobin, TLC/WBC count, Platelets, Reticulocytes, differential counts).
   - Microscopic findings, cellularity, bone marrow aspirates, biopsy observations, or pathology impressions.
   - Doctor's remarks, clinical advice, and suggested follow-ups (e.g. PNH workup, B12 checks).
3. If the report header lists a name different from ${ctx.name}, politely point that out as a noteworthy observation for verification.
4. Translate complex medical jargon into clear, reassuring, and empathetic plain English.
5. Point out trends across multiple tests or visits when relevant.
6. Always cite specific records using the [Record N] or [Document N] notation when referencing them.
7. Offer practical preparation tips and specific questions the patient can ask their doctor at their next visit.

SAFETY AND MEDICAL GUARDRAILS:
- You are an informational assistant, NOT a substitute for a licensed healthcare provider.
- Never make a definitive new diagnosis.
- Never instruct the patient to start, stop, or adjust prescription medications.
- If information is missing from the records, clearly acknowledge that it was not documented in their uploaded reports.
- Always include this exact closing disclaimer on any medical analysis:
  "⚠️ *This analysis is for informational purposes only. Please consult your physician for medical diagnosis and treatment decisions.*"`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate patient
    const session = await requireSession();
    if (!session.patientUuid) {
      return apiError("AI assistant is only available to registered patients", 403);
    }

    // 2. Parse body
    let body: { message?: string; history?: { role: "user" | "assistant"; content: string }[] };
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const { message, history = [] } = body;
    if (!message?.trim()) {
      return apiError("Message is required", 400);
    }

    // 3. Verify Groq API key
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!groqKey || groqKey === "your_groq_api_key_here") {
      return apiError("AI assistant is not configured. Please add GROQ_API_KEY to your .env file.", 503);
    }

    // 4. Fetch patient records and reports from MongoDB
    await connectToDatabase();

    const patient = await Patient.findOne({ internalUuid: session.patientUuid }).lean();
    const patientName = patient?.name || "Patient";

    const [dbRecords, dbDocs, dbExtractions] = await Promise.all([
      ClinicalRecord.find({ patientUuid: session.patientUuid })
        .sort({ clinicalDate: -1 })
        .limit(MAX_RECORDS)
        .lean(),
      PatientDocument.find({ patientUuid: session.patientUuid, deletedAt: null })
        .sort({ clinicalDate: -1 })
        .limit(MAX_RECORDS)
        .lean(),
      DocumentExtraction.find({ patientUuid: session.patientUuid }).lean(),
    ]);

    // Map extractions by documentId
    const extractionMap = new Map<string, any>();
    for (const ext of dbExtractions) {
      if (ext.documentId) {
        extractionMap.set(ext.documentId.toString(), ext);
      }
    }

    // Map documents by _id
    const docMap = new Map<string, any>();
    for (const doc of dbDocs) {
      docMap.set(doc._id.toString(), doc);
    }

    // Ensure documents with missing or placeholder extractions get real text extracted on-the-fly
    const storage = getStorageProvider();
    for (const doc of dbDocs) {
      const docIdStr = doc._id.toString();
      const existingExt = extractionMap.get(docIdStr);
      const isPlaceholder =
        !existingExt?.rawText ||
        existingExt.rawText.includes("OCR pipeline") ||
        existingExt.rawText.includes("Visual document processed");

      const isPdf =
        doc.mimeType === "application/pdf" ||
        (doc.originalFileName && doc.originalFileName.toLowerCase().endsWith(".pdf"));

      if (isPlaceholder && isPdf && doc.storageKey) {
        try {
          const buf = await storage.getFileBuffer(doc.storageKey, "raw");
          if (buf && buf.length > 0) {
            const parser = new PDFParse({ data: buf });
            const textResult = await parser.getText();
            const text = (textResult.text || "").trim();
            await parser.destroy();

            if (text.length > 0) {
              const updatedExt = await DocumentExtraction.findOneAndUpdate(
                { documentId: doc._id },
                {
                  $set: {
                    patientUuid: session.patientUuid,
                    status: "completed",
                    extractedFormat: "digital_pdf",
                    rawText: text,
                    "structuredData.findings": text.slice(0, 2000),
                  },
                },
                { upsert: true, new: true }
              ).lean();

              extractionMap.set(docIdStr, updatedExt);
            }
          }
        } catch (extractErr) {
          console.warn(`[AI] On-the-fly text extraction skipped for ${doc.originalFileName}:`, extractErr);
        }
      }
    }

    const records = dbRecords.map((r) => {
      const doc = r.documentId ? docMap.get(r.documentId.toString()) : null;
      const ext = r.documentId ? extractionMap.get(r.documentId.toString()) : null;

      let extractedText =
        ext?.rawText || ext?.structuredData?.findings || ext?.structuredData?.impression || null;

      if (extractedText && extractedText.includes("Visual document processed via OCR pipeline")) {
        extractedText = null;
      }

      return {
        title: r.title,
        category: r.category,
        clinicalDate: r.clinicalDate.toISOString(),
        facility: r.facility,
        practitioner: r.practitioner ?? null,
        summary: r.summary,
        tags: r.tags || [],
        documentFileName: doc?.originalFileName ?? null,
        extractedText,
        measurements: ext?.structuredData?.measurements?.map((m: any) => ({
          name: m.name,
          value: m.value,
          unit: m.unit,
          flag: m.flag,
        })),
      };
    });

    const documents = dbDocs.map((d) => {
      const ext = extractionMap.get(d._id.toString());
      let preview = ext?.rawText || ext?.structuredData?.findings || null;
      if (preview && preview.includes("Visual document processed via OCR pipeline")) {
        preview = null;
      }
      return {
        title: d.title,
        fileName: d.originalFileName,
        category: d.recordCategory,
        date: d.clinicalDate.toISOString(),
        facility: d.facility,
        notes: d.notes,
        contentPreview: preview,
      };
    });

    const patientCtx: PatientContext = {
      name: patientName,
      age: calculateAge(patient?.dateOfBirth),
      gender: patient?.gender,
      bloodGroup: patient?.bloodGroup,
      allergies: patient?.allergies || [],
      conditions: patient?.conditions || [],
      records,
      documents,
    };

    // 5. Build system prompt and Groq message chain
    const systemPrompt = buildSystemPrompt(patientCtx);

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message.trim() },
    ];

    // 6. Connect to Groq with fallback model support
    const groq = new Groq({ apiKey: groqKey });
    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter((m) => m !== PRIMARY_MODEL)];

    let stream: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        stream = await groq.chat.completions.create({
          model,
          messages,
          max_tokens: 950,
          temperature: 0.3,
          stream: true,
        });
        if (stream) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI] Model ${model} failed:`, err?.message || err);
      }
    }

    if (!stream) {
      console.error("[AI] All Groq models failed. Last error:", lastError);
      return apiError(
        `AI service unavailable: ${lastError?.message || "Could not connect to language model"}`,
        502
      );
    }

    // 7. Pipe SSE stream to client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[AI] Stream read error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted while generating response" })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("[AI] Chat handler error:", err);
    return apiError(err?.message || "AI assistant encountered an error. Please try again.", 500);
  }
}
