"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Modal } from "@/components/ui/Modal";
import { timeAgo } from "@/lib/relative-time";
import {
  regenerateParentToken,
  sendParentInvite,
  setParentTokenEnabled,
} from "@/app/actions/parent-view";

type Props = {
  initialEnabled: boolean;
  initialToken: string;
  views: number;
  lastViewedAt: Date | null;
  plan: "free" | "solo" | "family";
  isReal?: boolean;
};

function CheckIcon() {
  return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-11" /></svg>;
}
function XIcon() {
  return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>;
}

export function ParentViewClient({ initialEnabled, initialToken, views, lastViewedAt, plan, isReal = false }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [token, setToken] = useState(initialToken);
  const [regenOpen, setRegenOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const url = `getstamped.app/parent/${token}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const regenerate = async () => {
    setRegenOpen(false);
    if (isReal) {
      const res = await regenerateParentToken();
      if (res.ok && res.token) {
        setToken(res.token);
        setToast("New link generated. Old one invalidated.");
      } else {
        setToast(res.error ?? "Could not regenerate. Try again.");
      }
    } else {
      setToken(Math.random().toString(36).slice(2, 10));
      setToast("New link generated. Old one invalidated.");
    }
    setTimeout(() => setToast(null), 2500);
  };

  const onToggle = async (next: boolean) => {
    setEnabled(next);
    if (isReal) {
      const res = await setParentTokenEnabled(next);
      if (!res.ok) {
        setEnabled(!next);
        setToast(res.error ?? "Could not update. Try again.");
        setTimeout(() => setToast(null), 2500);
      }
    }
  };

  const sendEmail = async () => {
    if (!emailTo) return;
    setSending(true);
    if (isReal) {
      const res = await sendParentInvite(emailTo);
      setSending(false);
      if (res.ok) {
        setToast(`Sent to ${emailTo}`);
        setEmailTo("");
      } else {
        setToast(res.error ?? "Could not send. Try again.");
      }
    } else {
      setTimeout(() => {
        setSending(false);
        setToast(`Sent to ${emailTo}`);
        setEmailTo("");
      }, 700);
    }
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Parent View</span>
      </nav>

      <header className="mt-6 animate-hero-rise">
        <Eyebrow>For your parents</Eyebrow>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
          Keep them in the loop.
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
          Generate a read-only link. Share it once. Your parents see your live
          progress without ever logging in.
        </p>
      </header>

      {/* Block 1 — Link status */}
      <section className="mt-8 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5 sm:p-6 animate-fade-up">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Eyebrow>Shareable link</Eyebrow>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Toggle off to disable instantly.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggle(!enabled)}
            className={[
              "relative inline-block h-6 w-11 rounded-full transition-colors",
              enabled ? "bg-[var(--color-forest)]" : "bg-[var(--color-cream-deep)]",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                enabled ? "left-[1.375rem]" : "left-0.5",
              ].join(" ")}
            />
          </button>
        </div>

        {enabled ? (
          <>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
              <code className="flex-1 font-mono text-sm text-[var(--color-ink)] truncate">{url}</code>
              <button
                type="button"
                onClick={copy}
                className="rounded-md bg-[var(--color-cream-deep)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
              <span>{lastViewedAt ? `Last opened ${timeAgo(lastViewedAt)}` : "Never opened"}</span>
              <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
              <span>{views} total views</span>
              <button
                type="button"
                onClick={() => setRegenOpen(true)}
                className="ml-auto text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
              >
                Regenerate link
              </button>
            </div>
            <div className="mt-4">
              <Link
                href={`/parent/${token}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
              >
                Open parent view in new tab →
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-[var(--color-muted)]">
            Link disabled. Anyone visiting it will see &ldquo;link no longer active.&rdquo;
          </p>
        )}
      </section>

      {/* Block 2 — Preview */}
      <section className="mt-6 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5 sm:p-6 animate-fade-up">
        <Eyebrow>See what they see</Eyebrow>
        <div className="mt-4 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream)] p-4 sm:p-6">
          <div className="text-center max-w-md mx-auto">
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Read-only view</p>
            <h3 className="mt-2 font-display text-xl text-[var(--color-ink)] tracking-tight">Arya&rsquo;s F-1 Application</h3>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Currently on Phase 3: DS-160 and fees</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden">
              <div className="h-full bg-[var(--color-forest)]" style={{ width: "49%" }} />
            </div>
            <p className="mt-2 text-[11px] font-mono text-[var(--color-muted)]">23 of 47 complete · 49%</p>
          </div>
        </div>
      </section>

      {/* Block 3 — What's shared */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
        <div className="rounded-2xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/[0.04] p-5">
          <Eyebrow>Shared</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm">
            {["Progress count", "Current phase", "Next step title", "Interview date + consulate", "Recent activity (last 5)", "Document count"].map((x) => (
              <li key={x} className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-forest)] text-[var(--color-cream-soft)] shrink-0"><CheckIcon /></span>
                <span className="text-[var(--color-ink)]">{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5">
          <Eyebrow>Not shared</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm">
            {["Document files themselves", "AI conversations", "Mock interview transcripts", "Email address", "Settings"].map((x) => (
              <li key={x} className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-cream-deep)] text-[var(--color-muted)] shrink-0"><XIcon /></span>
                <span className="text-[var(--color-ink-soft)]">{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Block 4 — Email */}
      <section className="mt-6 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5 sm:p-6 animate-fade-up">
        <Eyebrow>Email it directly</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          We&rsquo;ll send your parents a short note with the link.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="parent@example.com"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
          />
          <button
            type="button"
            onClick={sendEmail}
            disabled={!emailTo || sending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send link"}
          </button>
        </div>
      </section>

      {plan === "free" && (
        <p className="mt-6 text-xs text-[var(--color-muted)] text-center">
          Free plan: parent view shows a small &ldquo;GetStamped · Free Plan&rdquo; watermark.
          Paid plans remove it.
        </p>
      )}

      {/* Regenerate confirmation modal */}
      <Modal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        eyebrow="Regenerate link"
        title="The old link will stop working"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRegenOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={regenerate}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors"
            >
              Generate new link
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          Anyone holding the current link will see &ldquo;link no longer active.&rdquo;
          You&rsquo;ll need to share the new link with your parents.
        </p>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="inline-flex items-center gap-3 rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-medium text-[var(--color-cream-soft)] shadow-[0_18px_40px_-15px_rgba(20,33,28,0.45)]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
