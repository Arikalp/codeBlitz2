/**
 * app/dashboard/ai/page.tsx
 *
 * /dashboard/ai — AI Health Assistant placeholder.
 * Clearly labelled as a future feature; no real AI calls.
 */

"use client";

import { Bot, Send, Info, Sparkles, BookOpen, HeartPulse } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { useState } from "react";

const SAMPLE_QUESTIONS = [
  "What does my HbA1c of 7.1% mean?",
  "Explain the findings in my July chest X-ray.",
  "What questions should I ask my doctor about diabetes?",
  "Summarise my last 3 months of records.",
];

const MOCK_RESPONSE = `This is a placeholder response. In the live version, this answer would be grounded in your selected medical records using the Groq LLM API — with clear source citations and appropriate medical disclaimers.

**Example summary (synthetic):**  
Your HbA1c of 7.1% is slightly above the typical target of ≤7.0% for most adults with Type 2 Diabetes. It has improved from 7.8% measured earlier this year. Your doctor may discuss whether further lifestyle or medication adjustments are needed.

⚠️ This is not medical advice. Always consult your doctor for clinical decisions.`;

export default function AiAssistantPage() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  function handleSend() {
    if (!query.trim()) return;
    const q = query.trim();
    setQuery("");
    setChatHistory((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      setChatHistory((prev) => [...prev, { role: "ai", text: MOCK_RESPONSE }]);
      setLoading(false);
    }, 1200);
  }

  return (
    <AppShell title="AI Health Assistant">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Sparkles size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">AI Health Assistant</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Ask questions about your records. Answers are grounded in your selected documents.
            </p>
          </div>
        </div>

        {/* Important notice */}
        <Card className="border-violet-200 bg-violet-50">
          <div className="flex gap-3">
            <Info size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-violet-800 space-y-1">
              <p className="font-semibold">Coming in a future release</p>
              <p className="text-xs leading-relaxed">
                The AI assistant will use the Groq API (server-side only) to explain your records in plain language.
                It will <strong>not</strong> diagnose conditions, prescribe medications, or make clinical decisions.
                All answers will cite the source records used and clearly label uncertainty.
              </p>
            </div>
          </div>
        </Card>

        {/* Capability cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: BookOpen, title: "Explain records", desc: "Translate medical jargon into everyday language." },
            { icon: HeartPulse, title: "Summarise history", desc: "Get a brief summary of selected records." },
            { icon: Bot, title: "Prepare questions", desc: "Formulate questions to discuss with your doctor." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} padding="md" className="text-center">
              <div className="flex justify-center mb-2">
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{desc}</p>
            </Card>
          ))}
        </div>

        {/* Chat area */}
        <Card padding="none" className="overflow-hidden">
          {/* Messages */}
          <div className="min-h-60 max-h-96 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <Bot size={40} className="mx-auto mb-3 opacity-30" strokeWidth={1.2} />
                <p className="text-sm">Ask a question about your health records below.</p>
                <p className="text-xs mt-1 text-amber-600">Demo mode — responses are pre-scripted placeholders.</p>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={["flex", msg.role === "user" ? "justify-end" : "justify-start"].join(" ")}>
                <div
                  className={[
                    "max-w-sm rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-[var(--color-brand-600)] text-white rounded-tr-sm"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] rounded-tl-sm",
                  ].join(" ")}
                >
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-violet-600 font-semibold">
                      <Sparkles size={12} /> AI Assistant · Demo Response
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-surface-muted)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block h-2 w-2 rounded-full bg-[var(--color-text-muted)] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sample questions */}
          {chatHistory.length === 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[var(--color-border)] p-3 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about your health records…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-400)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!query.trim() || loading}
              className="flex-shrink-0 p-2.5 rounded-xl bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] disabled:opacity-50 disabled:pointer-events-none transition-colors"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
