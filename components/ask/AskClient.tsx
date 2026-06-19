"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MOCK_THREADS, SUGGESTED_QUESTIONS, type Message, type Scope, type Thread } from "@/lib/mock-threads";
import { TypedText } from "@/components/ask/TypedText";
import { timeAgo } from "@/lib/relative-time";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { deleteThread as deleteThreadAction, setMessageHelpful, setMessageSaved } from "@/app/actions/ai-threads";
import { TypingSpeedControl, useTypingSpeed, cpsFor } from "@/components/ask/TypingSpeedControl";

type Plan = "free" | "solo" | "family";

type Props = {
  plan: Plan;
  isReal?: boolean;
  initialThreads?: Thread[];
};

const FREE_LIMIT = 5;

// Tiny inline markdown renderer (bold via **, code via `, paragraphs).
function renderMarkdown(text: string): React.ReactNode {
  // Split into paragraphs
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bi) => (
    <p key={bi} className={bi > 0 ? "mt-3" : undefined}>
      {renderInline(block)}
    </p>
  ));
}

function renderInline(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    if (text.slice(i, i + 2) === "**") {
      const end = text.indexOf("**", i + 2);
      if (end > -1) {
        out.push(<strong key={i} className="font-medium">{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > -1) {
        out.push(
          <code key={i} className="rounded-md bg-[var(--color-paper-deep)] px-1 py-0.5 font-mono text-[0.85em]">
            {text.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }
    let j = i;
    while (j < text.length && text[j] !== "*" && text[j] !== "`") j++;
    out.push(text.slice(i, j));
    i = j;
  }
  return out;
}

/* Per-message timestamp formatter. Compact relative form so the chat
   doesn't shout dates at the reader:
   • same day      → "10:42 PM"
   • yesterday     → "Yesterday, 10:42 PM"
   • this year     → "Jun 19, 10:42 PM"
   • older         → "Jun 19, 2025, 10:42 PM"
   Renders inside <time> with the full ISO in title for accessibility. */
function MessageTime({ when }: { when: Date | string | null | undefined }) {
  if (!when) return null;
  const d = when instanceof Date ? when : new Date(when);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yest.getFullYear() &&
    d.getMonth() === yest.getMonth() &&
    d.getDate() === yest.getDate();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  let label: string;
  if (sameDay) label = time;
  else if (isYesterday) label = `Yesterday, ${time}`;
  else if (d.getFullYear() === now.getFullYear()) {
    label = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
  } else {
    label = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}, ${time}`;
  }
  return (
    <time
      dateTime={d.toISOString()}
      title={d.toLocaleString()}
      className="font-mono text-[10px] tabular-nums text-[var(--color-muted)]"
    >
      {label}
    </time>
  );
}

function PaperPlane() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
}
function ThumbsUp({ filled }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 11v8a2 2 0 0 0 2 2h7l3-8V6h-5l-1-4h-2l-2 4H7v5z" /></svg>;
}
function ThumbsDown({ filled }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 -scale-y-100" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 11v8a2 2 0 0 0 2 2h7l3-8V6h-5l-1-4h-2l-2 4H7v5z" /></svg>;
}
function BookmarkIcon({ filled }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
}

export function AskClient({ plan, isReal = false, initialThreads }: Props) {
  const seed = initialThreads ?? (isReal ? [] : MOCK_THREADS);
  const [threads, setThreads] = useState<Thread[]>(seed);
  const [activeId, setActiveId] = useState<string | null>(seed[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [scope, setScope] = useState<Scope>("general");
  const [sending, setSending] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /* The id of the assistant message currently being typed out. While set,
     the send button flips to a Stop button that instantly reveals the
     full markdown render (no character animation). Cleared by TypedText's
     onDone, or by stop(). */
  const [typingId, setTypingId] = useState<string | null>(null);
  /* In-flight fetch's AbortController. stop() calls .abort() to cancel
     the request mid-generation. Replaced on each new send. */
  const aborterRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useTypingSpeed();

  const isBusy = sending || typingId !== null;

  const active = threads.find((t) => t.id === activeId) ?? null;

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  const newThread = () => {
    setActiveId(null);
    setInput("");
    setScope("general");
    setSidebarOpen(false);
  };

  const exhausted = plan === "free" && questionsUsed >= FREE_LIMIT;

  const send = async () => {
    const q = input.trim();
    if (!q || sending) return;
    if (exhausted) return;

    setSending(true);
    setInput("");

    const optimisticUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      createdAt: new Date(),
    };

    let threadId = activeId;
    let optimisticThreadId: string | null = null;
    if (!threadId) {
      const newT: Thread = {
        id: crypto.randomUUID(),
        title: q.length > 60 ? q.slice(0, 60) + "…" : q,
        scope,
        createdAt: new Date(),
        messages: [optimisticUserMsg],
      };
      optimisticThreadId = newT.id;
      setThreads((t) => [newT, ...t]);
      setActiveId(newT.id);
    } else {
      setThreads((ts) =>
        ts.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, optimisticUserMsg] } : t)),
      );
    }

    // Cancel any previous in-flight call. If the user spam-clicks send,
    // only the latest request survives.
    aborterRef.current?.abort();
    const ac = new AbortController();
    aborterRef.current = ac;

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          threadId: isReal ? threadId : null,
          scope,
          stepNumber: scope === "step" ? threads.find((t) => t.id === activeId)?.stepNumber : undefined,
        }),
        signal: ac.signal,
      });
      if (r.status === 429) {
        const data = await r.json().catch(() => ({}));
        const msg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.error ?? "Free tier limit reached. Upgrade for unlimited.",
          createdAt: new Date(),
        };
        setThreads((ts) =>
          ts.map((t) => (t.id === (optimisticThreadId ?? threadId)
            ? { ...t, messages: [...t.messages, msg] }
            : t)),
        );
        setQuestionsUsed(FREE_LIMIT);
        return;
      }
      const data = (await r.json()) as {
        ok: boolean;
        threadId?: string;
        answer?: string;
        assistantMessage?: { id: string | null; content: string };
      };
      const answer = data.assistantMessage?.content ?? data.answer ?? "Sorry, I couldn't answer that right now.";
      const realThreadId = data.threadId ?? optimisticThreadId ?? threadId;
      const aiMsgId = data.assistantMessage?.id ?? crypto.randomUUID();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: answer,
        createdAt: new Date(),
        fresh: true,
      };
      // Mark this message as the one currently being type-animated.
      // TypedText's onDone clears it; stop() can also clear it early.
      setTypingId(aiMsgId);
      setThreads((ts) =>
        ts.map((t) => {
          // Patch optimistic thread id → real
          if (optimisticThreadId && t.id === optimisticThreadId) {
            return { ...t, id: realThreadId ?? t.id, messages: [...t.messages, aiMsg] };
          }
          if (t.id === realThreadId) {
            return { ...t, messages: [...t.messages, aiMsg] };
          }
          return t;
        }),
      );
      if (optimisticThreadId && realThreadId && realThreadId !== optimisticThreadId) {
        setActiveId(realThreadId);
      }
      setQuestionsUsed((n) => n + 1);
    } catch (err) {
      // User-initiated stop — surface a short note, no error styling.
      const aborted =
        err instanceof DOMException && err.name === "AbortError";
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aborted
          ? "_Stopped._"
          : "Network error. Please try again.",
        createdAt: new Date(),
      };
      setThreads((ts) =>
        ts.map((t) => (t.id === (optimisticThreadId ?? threadId)
          ? { ...t, messages: [...t.messages, aiMsg] }
          : t)),
      );
    } finally {
      setSending(false);
      // Clear the controller only if it's still ours — a newer send() may
      // have already replaced it.
      if (aborterRef.current === ac) aborterRef.current = null;
    }
  };

  /* Stop the AI — works in two phases:
     1. If the fetch is still in flight, abort it (catch block handles the
        rest, marking the message as "Stopped").
     2. If the response arrived and TypedText is mid-animation, flip the
        message's `fresh` flag so it falls through to the static markdown
        renderer immediately. */
  const stop = () => {
    aborterRef.current?.abort();
    if (typingId && activeId) {
      const id = typingId;
      setThreads((ts) =>
        ts.map((t) =>
          t.id === activeId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === id ? { ...m, fresh: false } : m,
                ),
              }
            : t,
        ),
      );
      setTypingId(null);
    }
  };

  const toggleHelpful = (mid: string, helpful: boolean) => {
    if (!activeId) return;
    let nextValue: boolean | null = helpful;
    setThreads((ts) =>
      ts.map((t) => t.id === activeId
        ? {
            ...t,
            messages: t.messages.map((m) => {
              if (m.id !== mid) return m;
              nextValue = m.helpful === helpful ? null : helpful;
              return { ...m, helpful: nextValue };
            }),
          }
        : t,
      ),
    );
    if (isReal) void setMessageHelpful(mid, nextValue);
  };

  const toggleSaved = (mid: string) => {
    if (!activeId) return;
    let nextValue = false;
    setThreads((ts) =>
      ts.map((t) => t.id === activeId
        ? {
            ...t,
            messages: t.messages.map((m) => {
              if (m.id !== mid) return m;
              nextValue = !m.saved;
              return { ...m, saved: nextValue };
            }),
          }
        : t,
      ),
    );
    if (isReal) void setMessageSaved(mid, nextValue);
  };

  const deleteThread = () => {
    if (!activeId) return;
    const toDelete = activeId;
    setThreads((ts) => ts.filter((t) => t.id !== toDelete));
    setActiveId(threads.find((t) => t.id !== toDelete)?.id ?? null);
    if (isReal) void deleteThreadAction(toDelete);
  };

  const savedMessages = threads.flatMap((t) =>
    t.messages.filter((m) => m.saved).map((m) => ({ thread: t, m })),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Ask</span>
      </nav>

      <div className="mt-6 flex gap-6">
        {/* Sidebar */}
        <aside
          className={[
            "w-[280px] flex-shrink-0",
            "lg:block",
            sidebarOpen ? "fixed inset-y-0 left-0 z-40 w-[280px] bg-[var(--color-paper-soft)] p-4 overflow-y-auto" : "hidden lg:block",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={newThread}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-persimmon)] px-4 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors"
          >
            + New question
          </button>

          <div className="mt-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
            />
          </div>

          <ul className="mt-4 space-y-1">
            {filteredThreads.map((t) => {
              const isActive = activeId === t.id;
              const last = t.messages[t.messages.length - 1];
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => { setActiveId(t.id); setSidebarOpen(false); }}
                    className={[
                      "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-[var(--color-paper-deep)] text-[var(--color-ink)]"
                        : "hover:bg-[var(--color-paper-deep)]/40 text-[var(--color-ink-soft)]",
                    ].join(" ")}
                  >
                    <div className="text-xs font-medium truncate">{t.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--color-muted)]">
                      <span>{timeAgo(t.createdAt)}</span>
                      {t.scope === "step" && t.stepNumber && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center rounded-sm bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] px-1 text-[9px] font-medium">
                            Step {t.stepNumber}
                          </span>
                        </>
                      )}
                    </div>
                    {last && (
                      <p className="mt-1 text-[11px] text-[var(--color-muted)] truncate">
                        {last.content.replace(/[*`]/g, "").slice(0, 70)}…
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {savedMessages.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--color-border-soft)]">
              <Eyebrow>Saved answers</Eyebrow>
              <ul className="mt-3 space-y-1.5">
                {savedMessages.map(({ thread, m }) => (
                  <li key={m.id} className="text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveId(thread.id)}
                      className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors text-left line-clamp-2"
                    >
                      {m.content.replace(/[*`]/g, "").slice(0, 80)}…
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            aria-hidden
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-30 bg-[var(--color-ink)]/40 backdrop-blur-sm"
          />
        )}

        {/* Main chat */}
        <main className="flex-1 min-w-0 flex flex-col" style={{ minHeight: "70vh" }}>
          <header className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--color-border-soft)]">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)]"
                aria-label="Open thread list"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></svg>
              </button>
              <h1 className="font-display text-xl tracking-tight text-[var(--color-ink)] truncate">
                {active ? active.title : "Ask Vera"}
              </h1>
              {active?.scope === "step" && active.stepNumber && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap">
                  Step {active.stepNumber}
                </span>
              )}
            </div>
            {active && (
              <button
                type="button"
                onClick={deleteThread}
                aria-label="Delete thread"
                className="text-[var(--color-muted)] hover:text-red-600 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
              </button>
            )}
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-4">
            {!active ? (
              // Empty state
              <div className="text-center max-w-xl mx-auto py-12">
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-paper-soft)] p-8">
                  <h2 className="font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">
                    Meet Vera.
                  </h2>
                  <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
                    Your F-1 guide. Ask anything — fees, forms, interview questions, what to bring.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => { setInput(q); setTimeout(send, 50); }}
                        className="rounded-full bg-[var(--color-paper)] border border-[var(--color-border-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] px-3 py-1.5 text-xs text-[var(--color-ink-soft)] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {active.messages.map((m) => {
                  if (m.role === "user") {
                    return (
                      <div key={m.id} className="ml-auto max-w-[80%] animate-bubble-in-right">
                        <div className="rounded-2xl rounded-tr-md bg-[var(--color-accent)] text-[var(--color-paper-soft)] px-4 py-2.5 text-sm leading-relaxed">
                          {m.content}
                        </div>
                        <div className="mt-1 flex justify-end pr-1">
                          <MessageTime when={m.createdAt} />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className="max-w-[78ch] animate-bubble-in-left">
                      <div
                        className="ask-answer text-[var(--color-ink)]"
                        style={{
                          fontFamily: "var(--font-sans-stack)",
                          fontSize: "16px",
                          lineHeight: 1.65,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {m.fresh ? (
                          <TypedText
                            text={m.content}
                            cps={cpsFor(speed)}
                            renderFinal={(t) => renderMarkdown(t)}
                            onDone={() =>
                              setTypingId((curr) => (curr === m.id ? null : curr))
                            }
                          />
                        ) : (
                          renderMarkdown(m.content)
                        )}
                      </div>
                      <div className="mt-2">
                        <MessageTime when={m.createdAt} />
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-[var(--color-muted)]">
                        <span className="text-[11px]">Was this helpful?</span>
                        <button
                          type="button"
                          onClick={() => toggleHelpful(m.id, true)}
                          aria-label="Helpful"
                          className={m.helpful === true ? "text-[var(--color-ink)]" : "hover:text-[var(--color-ink)] transition-colors"}
                        >
                          <ThumbsUp filled={m.helpful === true} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleHelpful(m.id, false)}
                          aria-label="Not helpful"
                          className={m.helpful === false ? "text-red-600" : "hover:text-[var(--color-ink)] transition-colors"}
                        >
                          <ThumbsDown filled={m.helpful === false} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSaved(m.id)}
                          aria-label="Save answer"
                          className={m.saved ? "text-[var(--color-accent-deep)]" : "hover:text-[var(--color-ink)] transition-colors"}
                        >
                          <BookmarkIcon filled={m.saved} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {sending && (
                  <div className="inline-flex items-center gap-1.5 animate-bubble-in-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)] animate-typing-dot" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)] animate-typing-dot" style={{ animationDelay: "0.15s" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)] animate-typing-dot" style={{ animationDelay: "0.3s" }} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-[var(--color-border-soft)] pt-4">
            {/* Scope chips + speed + counter */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="inline-flex rounded-lg bg-[var(--color-paper-deep)] p-0.5 text-xs">
                {(["general", "step", "documents", "interview"] as Scope[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={[
                      "px-2.5 py-1 rounded-md transition-colors capitalize",
                      scope === s
                        ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                        : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
                    ].join(" ")}
                  >
                    {s === "general" ? "General" : s === "step" ? `Step` : s === "documents" ? "Documents" : "Interview"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <TypingSpeedControl level={speed} onChange={setSpeed} />
                {plan === "free" && (
                  <span className="font-mono text-[10px] text-[var(--color-muted)] tabular-nums">
                    {questionsUsed}/{FREE_LIMIT}
                  </span>
                )}
              </div>
            </div>

            {exhausted ? (
              <div className="rounded-xl border border-[var(--color-ink)] bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">You&rsquo;ve used all 5 free questions. $19 unlocks unlimited.</p>
                <Link href="/dashboard/upgrade">
                  <button type="button" className="rounded-lg bg-[var(--color-paper-soft)] text-[var(--color-ink)] px-4 py-2 text-sm font-medium">
                    Upgrade
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isBusy) send();
                    }
                  }}
                  rows={1}
                  placeholder="Type your question…"
                  className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors max-h-48"
                  style={{ minHeight: "44px" }}
                />
                {isBusy ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-ink)] text-[var(--color-paper-soft)] hover:bg-[var(--color-ink-soft)] transition-colors"
                    aria-label="Stop"
                    title="Stop"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                      <rect x="6" y="6" width="12" height="12" rx="1.5" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={send}
                    disabled={!input.trim()}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
                    aria-label="Send"
                  >
                    <PaperPlane />
                  </button>
                )}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--color-muted)]">
              <span>Enter to send · Shift+Enter for newline</span>
              <span className="tabular-nums">{input.length} chars</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
