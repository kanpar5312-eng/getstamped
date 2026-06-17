"use client";

import { useEffect, useRef, useState } from "react";
import { SlidePanel } from "@/components/ui/SlidePanel";

type Props = {
  open: boolean;
  onClose: () => void;
  stepNumber?: number;
  freeTier?: boolean;
};

type Msg =
  | { role: "user"; text: string; id: string }
  | { role: "assistant"; text: string; id: string }
  | { role: "thinking"; id: string };

const FREE_LIMIT = 3;

export function AskPanel({ open, onClose, stepNumber, freeTier = false }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [scope, setScope] = useState<"step" | "anything">(
    stepNumber ? "step" : "anything",
  );
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const exhausted = freeTier && questionsUsed >= FREE_LIMIT;

  const send = async () => {
    const q = input.trim();
    if (!q || exhausted) return;
    setInput("");
    const userMsg: Msg = { role: "user", text: q, id: crypto.randomUUID() };
    const thinkingMsg: Msg = { role: "thinking", id: crypto.randomUUID() };
    setMessages((m) => [...m, userMsg, thinkingMsg]);

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          stepNumber: scope === "step" ? stepNumber : undefined,
        }),
      });
      const data = (await r.json()) as { ok: boolean; answer?: string };
      setMessages((m) =>
        m
          .filter((x) => x.id !== thinkingMsg.id)
          .concat([
            {
              role: "assistant",
              text: data.answer ?? "Sorry, I couldn't answer that right now.",
              id: crypto.randomUUID(),
            },
          ]),
      );
      setQuestionsUsed((n) => n + 1);
    } catch {
      setMessages((m) =>
        m
          .filter((x) => x.id !== thinkingMsg.id)
          .concat([
            {
              role: "assistant",
              text: "Network error. Please try again.",
              id: crypto.randomUUID(),
            },
          ]),
      );
    }
  };

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      eyebrow="Ask"
      title={scope === "step" && stepNumber ? `About step ${stepNumber}` : "Ask anything"}
      footer={
        <div className="flex w-full items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={exhausted}
            placeholder={
              exhausted
                ? "Free-tier limit reached. Upgrade for unlimited."
                : "Type your question…"
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors disabled:opacity-60"
          />
          <button
            type="button"
            onClick={send}
            disabled={exhausted || !input.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
            aria-label="Send question"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      }
    >
      {/* Scope toggle + quota */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-[var(--color-paper-deep)] p-0.5 text-xs">
          {(["step", "anything"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              disabled={s === "step" && !stepNumber}
              className={[
                "px-3 py-1.5 rounded-md transition-colors capitalize",
                scope === s
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
                s === "step" && !stepNumber ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {s === "step" ? "This step" : "Ask anything"}
            </button>
          ))}
        </div>
        {freeTier && (
          <span className="font-mono text-[10px] text-[var(--color-muted)] tabular-nums">
            {questionsUsed}/{FREE_LIMIT} used
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="mt-6 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="text-sm text-[var(--color-muted)] text-center py-12">
            Ask anything about your F-1 process — fees, forms, interview
            questions, what to bring.
          </div>
        )}
        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div
                key={m.id}
                className="animate-bubble-in-right ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[var(--color-accent)] text-[var(--color-paper-soft)] px-4 py-2.5 text-sm leading-relaxed"
              >
                {m.text}
              </div>
            );
          }
          if (m.role === "assistant") {
            return (
              <div
                key={m.id}
                className="animate-bubble-in-left max-w-[90%] rounded-2xl rounded-tl-md bg-[var(--color-paper-deep)] text-[var(--color-ink)] px-4 py-2.5 text-sm leading-relaxed"
              >
                {m.text}
              </div>
            );
          }
          // thinking
          return (
            <div
              key={m.id}
              className="animate-bubble-in-left inline-flex max-w-[90%] items-center gap-1.5 rounded-2xl rounded-tl-md bg-[var(--color-paper-deep)] text-[var(--color-ink-soft)] px-4 py-2.5"
            >
              <span className="h-1 w-1 rounded-full bg-current animate-typing-dot" />
              <span className="h-1 w-1 rounded-full bg-current animate-typing-dot" style={{ animationDelay: "0.15s" }} />
              <span className="h-1 w-1 rounded-full bg-current animate-typing-dot" style={{ animationDelay: "0.3s" }} />
            </div>
          );
        })}
      </div>
    </SlidePanel>
  );
}
