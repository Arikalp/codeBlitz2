/**
 * app/dashboard/ai/page.tsx
 *
 * /dashboard/ai — AI Health Assistant powered by Groq.
 * Streams answers grounded in the patient's real ClinicalRecords & Documents.
 * Supports multi-turn conversation history.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  RefreshCw,
  Sparkles,
  HeartPulse,
  AlertCircle,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
}

// ─── Suggested Report Questions ──────────────────────────────────────────────

const SAMPLE_QUESTIONS = [
  "Summarise all my previous medical reports & records.",
  "What prescriptions or medications do I have recorded?",
  "Explain my uploaded documents in simple, everyday language.",
  "What should I ask my doctor at my next visit about these reports?",
  "Are there any specific findings, diagnoses, or notes mentioned in my records?",
  "Are there any tests or follow-ups recommended in my history?",
];

// ─── Enhanced Markdown Renderer ──────────────────────────────────────────────

function renderMarkdown(raw: string): string {
  if (!raw) return "";

  // Split lines to handle bullet lists cleanly
  const lines = raw.split("\n");
  const processedLines: string[] = [];
  let inList = false;

  for (let line of lines) {
    const isBullet = /^[-*]\s+(.*)$/.test(line);
    const isNumbered = /^(\d+)\.\s+(.*)$/.test(line);

    if (isBullet) {
      const match = line.match(/^[-*]\s+(.*)$/);
      if (!inList) {
        processedLines.push("<ul class='my-2 ml-4 list-disc space-y-1'>");
        inList = true;
      }
      processedLines.push(`<li>${match ? match[1] : line}</li>`);
      continue;
    } else if (isNumbered) {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (!inList) {
        processedLines.push("<ol class='my-2 ml-4 list-decimal space-y-1'>");
        inList = true;
      }
      processedLines.push(`<li>${match ? match[2] : line}</li>`);
      continue;
    } else {
      if (inList) {
        processedLines.push("</ul>");
        inList = false;
      }
      processedLines.push(line);
    }
  }
  if (inList) {
    processedLines.push("</ul>");
  }

  let text = processedLines.join("\n");

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-[var(--color-text-primary)]'>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Headings
  text = text.replace(/^#{1,3}\s(.+)$/gm, "<div class='text-sm font-bold text-[var(--color-text-primary)] mt-3 mb-1'>$1</div>");

  // Citations [Record N] and [Document N]
  text = text.replace(
    /\[Record (\d+)\]/gi,
    "<span class='inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-900)] text-[11px] font-semibold border border-[var(--color-brand-300)] shadow-xs mx-0.5'>📄 Record $1</span>"
  );
  text = text.replace(
    /\[Document (\d+)\]/gi,
    "<span class='inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-300 shadow-xs mx-0.5'>📎 Doc $1</span>"
  );

  // Safety and Warning Callouts
  text = text.replace(
    /⚠️(.*)/g,
    "<div class='my-2.5 p-3 rounded-lg border border-amber-300 bg-amber-50/90 text-amber-950 text-[11px] leading-relaxed flex items-start gap-2 shadow-xs'><span class='text-base leading-none'>⚠️</span><span>$1</span></div>"
  );

  // Paragraph breaks
  text = text.replace(/\n\n/g, "<br/><br/>");
  text = text.replace(/\n/g, "<br/>");

  return text;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [recordsCount, setRecordsCount] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load record stats for connection badge
  useEffect(() => {
    let mounted = true;
    fetch("/api/timeline")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        const count = data.data?.records?.length ?? data.records?.length ?? 0;
        setRecordsCount(count);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isStreaming) return;

      const userMsg: ChatMessage = { role: "user", content: userText.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setConfigError(null);

      // Build history for context (exclude streaming/error messages)
      const history = messages
        .filter((m) => !m.isError && !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      // Add a placeholder streaming message
      const streamingMsg: ChatMessage = { role: "assistant", content: "", isStreaming: true };
      setMessages((prev) => [...prev, streamingMsg]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText.trim(), history }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || `Request failed (HTTP ${res.status})`;
          if (res.status === 503) setConfigError(errMsg);
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 ? { role: "assistant", content: errMsg, isError: true } : m
            )
          );
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.token) {
                accumulated += parsed.token;
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1
                      ? { role: "assistant", content: accumulated, isStreaming: true }
                      : m
                  )
                );
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { role: "assistant", content: accumulated, isStreaming: false } : m
          )
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { role: "assistant", content: "An unexpected error occurred. Please try again.", isError: true }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [isStreaming, messages]
  );

  function handleStop() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.isStreaming
          ? { ...m, isStreaming: false, content: m.content + " [stopped]" }
          : m
      )
    );
  }

  function handleClear() {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    setConfigError(null);
  }

  return (
    <AppShell title="AI Health Assistant">
      <div className="max-w-4xl mx-auto flex flex-col gap-5 pb-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-lg border border-[var(--color-border)] shadow-[0_8px_24px_rgba(94,52,0,0.06)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-md shadow-[var(--color-brand-500)]/20">
              <Sparkles size={24} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]">AI Health Assistant</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Groq LLM Active
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Grounding answers directly in your longitudinal records & uploaded reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {recordsCount !== null && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] bg-[var(--color-brand-50)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <FileText size={13} className="text-[var(--color-brand-600)]" />
                <span>
                  <strong>{recordsCount}</strong> {recordsCount === 1 ? "record" : "records"} connected
                </span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
              >
                <RefreshCw size={12} />
                New chat
              </button>
            )}
          </div>
        </div>

        {/* Config error banner */}
        {configError && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-xs">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">AI Assistant Setup Required</p>
              <p className="text-xs mt-0.5 text-amber-800">
                Please verify your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GROQ_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>.
              </p>
            </div>
          </div>
        )}

        {/* Capability chips — only show when empty */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: FileText,
                title: "Analyzes Previous Reports",
                desc: "Reads your prescriptions, lab tests, imaging summaries & discharge notes",
              },
              {
                icon: HeartPulse,
                title: "Identifies Trends",
                desc: "Correlates previous visits, facilities, and health markers across time",
              },
              {
                icon: Bot,
                title: "Doctor Consultation Prep",
                desc: "Prepares tailored questions based on your clinical records",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} padding="md" className="hover:border-[var(--color-brand-400)] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border)]">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">{title}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-snug">{desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Chat window */}
        <Card padding="none" className="flex flex-col overflow-hidden min-h-[440px]">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[540px]">
            {messages.length === 0 && (
              <div className="text-center py-12 text-[var(--color-text-muted)] flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-600)] mb-4 border border-[var(--color-border)] shadow-xs">
                  <Bot size={32} strokeWidth={1.5} />
                </div>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  Ask anything about your medical reports
                </p>
                <p className="text-xs mt-1 text-[var(--color-text-secondary)] max-w-md">
                  I will review your previous reports, prescriptions, and medical history stored in HealthSetu to answer your questions accurately.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={["flex gap-3 items-start", msg.role === "user" ? "justify-end" : "justify-start"].join(" ")}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] flex items-center justify-center mt-0.5 shadow-xs text-white">
                    <Sparkles size={14} />
                  </div>
                )}

                <div
                  className={[
                    "max-w-[85%] rounded-lg px-4 py-3.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[var(--color-brand-600)] text-white rounded-tr-sm shadow-sm"
                      : msg.isError
                      ? "bg-red-50 border border-red-200 text-red-800 rounded-tl-sm"
                      : "bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-sm shadow-xs",
                  ].join(" ")}
                >
                  {msg.role === "assistant" && !msg.isError && (
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] text-[var(--color-brand-700)] font-bold uppercase tracking-wider">
                      <Sparkles size={11} />
                      {msg.isStreaming ? "Analyzing your medical reports…" : "HealthSetu AI · Grounded in your records"}
                    </div>
                  )}

                  {msg.role === "user" ? (
                    <p className="text-sm font-normal">{msg.content}</p>
                  ) : (
                    <div
                      className="text-xs sm:text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  )}

                  {/* Streaming indicator */}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1.5 h-3.5 bg-[var(--color-brand-600)] rounded-sm ml-0.5 animate-pulse" />
                  )}

                  {msg.isStreaming && !msg.content && (
                    <div className="flex gap-1.5 items-center h-5 py-1">
                      <span className="block h-2 w-2 rounded-full bg-[var(--color-brand-500)] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="block h-2 w-2 rounded-full bg-[var(--color-brand-500)] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="block h-2 w-2 rounded-full bg-[var(--color-brand-500)] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)] flex items-center justify-center mt-0.5 shadow-xs border border-[var(--color-border)]">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Chips — only when empty */}
          {messages.length === 0 && (
            <div className="px-5 pb-4 pt-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-[var(--color-brand-600)]" />
                Suggested questions for your reports:
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={isStreaming}
                    className="text-[11px] px-3.5 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)] transition-colors disabled:opacity-50 text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="border-t border-[var(--color-border)] p-3.5 flex gap-2.5 bg-[var(--color-surface)] items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask about your past reports, prescriptions, findings, or doctor visits…"
              disabled={isStreaming}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all disabled:opacity-60"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                aria-label="Send message"
              >
                <span>Ask AI</span>
                <Send size={14} />
              </button>
            )}
          </div>
        </Card>

        {/* Clinical Disclaimer */}
        <div className="text-center px-4">
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            <ShieldCheck size={13} className="inline mr-1 text-emerald-600 -mt-0.5" />
            HealthSetu AI strictly references your authenticated health data. It does not replace professional medical advice, diagnosis, or prescription modifications.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
