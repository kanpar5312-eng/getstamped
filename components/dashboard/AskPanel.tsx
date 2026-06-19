"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidePanel } from "@/components/ui/SlidePanel";
import type { AgentAction } from "@/lib/agent/tools";

type Props = {
  open: boolean;
  onClose: () => void;
  stepNumber?: number;
  freeTier?: boolean;
};

type Msg =
  | { role: "user"; text: string; id: string }
  | { role: "assistant"; text: string; id: string }
  | { role: "thinking"; id: string }
  | { role: "proposal"; id: string; action: AgentAction; state: "pending" | "running" | "done" | "cancelled" };

const FREE_LIMIT = 5;

export function AskPanel({ open, onClose, stepNumber, freeTier = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const exhausted = freeTier && questionsUsed >= FREE_LIMIT;

  /* The agent endpoint reads message history to keep context. We send only
     user/assistant pairs (no thinking / proposal cards) so the model sees a
     clean transcript. */
  const transcriptForServer = (msgs: Msg[]) =>
    msgs
      .filter((m): m is Extract<Msg, { role: "user" | "assistant" }> =>
        m.role === "user" || m.role === "assistant",
      )
      .map((m) => ({ role: m.role, content: m.text }));

  const send = async () => {
    const q = input.trim();
    if (!q || exhausted) return;
    setInput("");
    const userMsg: Msg = { role: "user", text: q, id: crypto.randomUUID() };
    const thinkingMsg: Msg = { role: "thinking", id: crypto.randomUUID() };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, thinkingMsg]);

    try {
      const r = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: transcriptForServer(nextMessages),
          pageContext: { pathname, stepNumber },
        }),
      });
      const data = (await r.json()) as
        | { ok: true; kind: "text"; text: string }
        | { ok: true; kind: "action"; action: AgentAction }
        | { ok: false; error: string };

      setMessages((m) => {
        const cleared = m.filter((x) => x.id !== thinkingMsg.id);
        if (!data.ok) {
          return [
            ...cleared,
            { role: "assistant", text: data.error, id: crypto.randomUUID() },
          ];
        }
        if (data.kind === "text") {
          return [
            ...cleared,
            { role: "assistant", text: data.text, id: crypto.randomUUID() },
          ];
        }
        return [
          ...cleared,
          {
            role: "proposal",
            id: crypto.randomUUID(),
            action: data.action,
            state: "pending",
          },
        ];
      });
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

  const confirmProposal = async (proposalId: string) => {
    const proposal = messages.find(
      (m): m is Extract<Msg, { role: "proposal" }> =>
        m.role === "proposal" && m.id === proposalId,
    );
    if (!proposal || proposal.state !== "pending") return;

    setMessages((m) =>
      m.map((x) =>
        x.id === proposalId && x.role === "proposal"
          ? { ...x, state: "running" }
          : x,
      ),
    );

    // Navigation: handle client-side, no need to hit confirm endpoint for the
    // route push (we still call it to record activity + get the summary).
    try {
      const r = await fetch("/api/agent/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: proposal.action }),
      });
      const data = (await r.json()) as
        | { ok: true; message: string }
        | { ok: false; error: string; paywall?: boolean };

      setMessages((m) => {
        const updated = m.map((x) =>
          x.id === proposalId && x.role === "proposal"
            ? { ...x, state: (data.ok ? "done" : "cancelled") as "done" | "cancelled" }
            : x,
        );
        return [
          ...updated,
          {
            role: "assistant",
            text: data.ok ? data.message : data.error,
            id: crypto.randomUUID(),
          },
        ];
      });

      if (data.ok && proposal.action.kind === "navigate") {
        // Close the panel after a beat so the user sees the confirmation,
        // then route. Tiny delay keeps the message landing visible.
        setTimeout(() => {
          onClose();
          router.push(proposal.action.kind === "navigate" ? proposal.action.to : "/dashboard");
        }, 250);
      } else if (data.ok) {
        // Refresh server components so the step/profile change shows up.
        router.refresh();
      }
    } catch {
      setMessages((m) =>
        m
          .map((x) =>
            x.id === proposalId && x.role === "proposal"
              ? { ...x, state: "cancelled" as const }
              : x,
          )
          .concat({
            role: "assistant",
            text: "Couldn't reach the server. Try again.",
            id: crypto.randomUUID(),
          }),
      );
    }
  };

  const cancelProposal = (proposalId: string) => {
    setMessages((m) =>
      m
        .map((x) =>
          x.id === proposalId && x.role === "proposal"
            ? { ...x, state: "cancelled" as const }
            : x,
        )
        .concat({
          role: "assistant",
          text: "Cancelled. What else can I do?",
          id: crypto.randomUUID(),
        }),
    );
  };

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      eyebrow="Ask"
      title={stepNumber ? `About step ${stepNumber}` : "Ask anything"}
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
                : "Ask, or say what you want me to do…"
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
      {/* Quota strip */}
      {freeTier && (
        <div className="flex items-center justify-end">
          <span className="font-mono text-[10px] text-[var(--color-muted)] tabular-nums">
            {questionsUsed}/{FREE_LIMIT} used
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="mt-6 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="space-y-3 py-8 text-center">
            <div className="text-sm text-[var(--color-muted)]">
              Ask anything about your F-1 process — or tell me what to do.
            </div>
            <div className="mx-auto inline-block rounded-xl bg-[var(--color-paper-deep)]/60 p-3 text-left text-[11px] leading-relaxed text-[var(--color-ink-soft)]">
              Try:<br />
              • <span className="text-[var(--color-ink)]">“Open the document vault”</span><br />
              • <span className="text-[var(--color-ink)]">“I finished the DS-160”</span><br />
              • <span className="text-[var(--color-ink)]">“My interview is on July 8”</span>
            </div>
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
                className="animate-bubble-in-left max-w-[90%] rounded-2xl rounded-tl-md bg-[var(--color-paper-deep)] text-[var(--color-ink)] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              >
                {m.text}
              </div>
            );
          }
          if (m.role === "thinking") {
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
          }
          // proposal
          const a = m.action;
          const tone =
            a.kind === "navigate"
              ? "border-[var(--color-border)] bg-[var(--color-paper-soft)]"
              : "border-[var(--color-persimmon)]/40 bg-[var(--color-persimmon-tint)]/40";
          return (
            <div
              key={m.id}
              className={`animate-bubble-in-left max-w-[95%] rounded-2xl border ${tone} px-4 py-3`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-soft)]">
                {a.kind === "navigate"
                  ? "Open"
                  : a.kind === "mark_step_done"
                  ? "Update progress"
                  : "Save to profile"}
              </div>
              <div className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                {a.summary}
              </div>
              <div className="mt-3 flex gap-2">
                {m.state === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => confirmProposal(m.id)}
                      className="inline-flex items-center rounded-lg bg-[var(--color-persimmon)] px-3 py-1.5 text-xs font-semibold text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors"
                    >
                      Yes, do it
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelProposal(m.id)}
                      className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {m.state === "running" && (
                  <span className="text-xs text-[var(--color-ink-soft)]">Running…</span>
                )}
                {m.state === "done" && (
                  <span className="text-xs font-mono text-[var(--color-persimmon-deep)]">✓ done</span>
                )}
                {m.state === "cancelled" && (
                  <span className="text-xs font-mono text-[var(--color-muted)]">— cancelled</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SlidePanel>
  );
}
