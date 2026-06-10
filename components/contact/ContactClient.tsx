"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { submitContact, type ContactCategory } from "@/app/actions/contact";

const CATEGORIES: { id: ContactCategory; label: string; hint: string }[] = [
  { id: "general",  label: "General",     hint: "Anything else." },
  { id: "billing",  label: "Billing",     hint: "Refunds, receipts, plan changes." },
  { id: "bug",      label: "Bug report",  hint: "Something broken on the site." },
  { id: "feature",  label: "Feature ask", hint: "Something missing from the product." },
  { id: "press",    label: "Press / partnership", hint: "Media, partner programs." },
  { id: "other",    label: "Other",       hint: "Doesn't fit the above." },
];

export function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ContactCategory>("general");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitContact({ name, email, category, message });
      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
        setCategory("general");
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back
      </Link>

      <header className="mt-6">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight leading-snug text-[var(--color-ink)]">
          Reach a real person.
        </h1>
        <p className="mt-3 text-base text-[var(--color-ink-soft)] leading-relaxed max-w-2xl">
          One person reads every email. Replies within <strong>24 hours</strong> on
          weekdays. If your visa interview is in the next 48 hours, mark the message{" "}
          <span className="font-mono text-xs bg-[var(--color-cream-deep)] rounded px-1.5 py-0.5">URGENT</span>{" "}
          and I bump it to the front.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Form */}
        <section>
          {success ? (
            <div className="rounded-2xl border border-[var(--color-forest)]/30 bg-[var(--color-forest)]/[0.05] p-7 animate-fade-up">
              <span aria-hidden className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-forest)] text-[var(--color-cream-soft)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-11" /></svg>
              </span>
              <h2 className="mt-5 font-display text-2xl tracking-tight text-[var(--color-ink)]">
                Message received.
              </h2>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
                A confirmation just landed in your inbox. A real reply follows
                within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="c-name" className="text-xs font-medium text-[var(--color-ink)]">Your name</label>
                <input
                  id="c-name" name="name" value={name} onChange={(e) => setName(e.target.value)}
                  required autoComplete="name" minLength={2}
                  placeholder="Priya Sharma"
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="c-email" className="text-xs font-medium text-[var(--color-ink)]">Email</label>
                <input
                  id="c-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email"
                  placeholder="you@email.com"
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
                />
              </div>

              <div>
                <span className="text-xs font-medium text-[var(--color-ink)]">Category</span>
                <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => {
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        aria-pressed={active}
                        className={[
                          "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          active
                            ? "border-[var(--color-forest)] bg-[var(--color-forest)]/[0.06] text-[var(--color-ink)]"
                            : "border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] text-[var(--color-ink-soft)] hover:border-[var(--color-border)]",
                        ].join(" ")}
                      >
                        <span className="block font-medium">{c.label}</span>
                        <span className="block text-[10px] text-[var(--color-muted)] mt-0.5 leading-snug">{c.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="c-message" className="text-xs font-medium text-[var(--color-ink)]">Message</label>
                <textarea
                  id="c-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)}
                  required minLength={10} maxLength={5000} rows={6}
                  placeholder="What's going on?"
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors resize-y min-h-[120px]"
                />
                <p className="mt-1.5 text-[11px] text-[var(--color-muted)] flex items-center justify-between">
                  <span>10–5000 characters.</span>
                  <span className="font-mono tabular-nums">{message.length}/5000</span>
                </p>
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full inline-flex items-center justify-center rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-soft-pulse" />
                    Sending…
                  </span>
                ) : (
                  "Send message"
                )}
              </button>
            </form>
          )}
        </section>

        {/* Sidecar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5">
            <Eyebrow>Response time</Eyebrow>
            <p className="mt-3 text-sm text-[var(--color-ink)] leading-relaxed">
              <strong>24 hours</strong> on weekdays.{" "}
              <strong>48 hours</strong> on weekends.
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted)] leading-relaxed">
              Urgent visa-interview matters jump the queue — add{" "}
              <span className="font-mono bg-[var(--color-cream-deep)] rounded px-1">URGENT</span>{" "}
              to the subject when you reply to the confirmation email.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5">
            <Eyebrow>Other ways</Eyebrow>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-ink-soft)]">
              <li>
                Email:{" "}
                <a
                  href="mailto:hello@getstamped.app"
                  className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
                >
                  hello@getstamped.app
                </a>
              </li>
              <li>
                Legal &amp; data:{" "}
                <a
                  href="mailto:legal@getstamped.app"
                  className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
                >
                  legal@getstamped.app
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5">
            <Eyebrow>Already a customer?</Eyebrow>
            <p className="mt-3 text-xs text-[var(--color-ink-soft)] leading-relaxed">
              Use the Ask page inside your dashboard for product questions —
              faster than email.
            </p>
            <Link href="/dashboard/ask" className="mt-3 inline-flex text-xs font-medium text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
              Open Ask →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
