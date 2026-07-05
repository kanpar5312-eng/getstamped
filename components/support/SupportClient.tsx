"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const SUPPORT_EMAIL = "getstamped.online@gmail.com";

type Props = { isAuthed: boolean };

type QA = { q: string; a: string };
type Category = { id: string; name: string; icon: string; items: QA[] };

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    name: "Getting started",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    items: [
      { q: "What exactly is GetStamped?", a: "GetStamped is a step-by-step guide for the entire F-1 US student visa process. All 47 steps — from choosing universities to landing in the US — organized into one timeline with instructions, document checklists, AI Q&A, and voice mock interviews." },
      { q: "Is GetStamped free?", a: "Phase 1 (the first 6 steps) is free forever — no card required. You also get 3 AI questions and 1 mock interview free. The remaining 41 steps, unlimited AI, and weekly voice mock interviews (up to 5/week on Solo, 12/week on Family) unlock with a one-time payment." },
      { q: "How much does it cost?", a: "Solo is ₹2,999 / $39 one-time for one student. Family is ₹4,999 / $69 for up to 2 students. No subscription, no recurring charges. Lifetime access until your visa is stamped. The first 100 users get Solo at ₹799 / $9." },
      { q: "Do I need to download anything?", a: "No. GetStamped runs entirely in your browser on phone, tablet, or laptop. Your progress syncs across all devices automatically." },
      { q: "Which countries is GetStamped for?", a: "Any country. GetStamped is built for international students worldwide applying for the F-1 visa — India, China, Vietnam, Nigeria, Brazil, South Korea, Bangladesh, Mexico, and 50+ others. Consulate-specific details adjust based on your location." },
      { q: "I haven't received my I-20 yet. Is it too early to start?", a: "Not at all — Phase 1 covers everything before your I-20, including university selection, tests, and applications. Starting early is the single best thing you can do." },
      { q: "My interview is in 2 weeks. Is it too late to use this?", a: "No. GetStamped detects an imminent interview and switches to a prioritized prep mode — document verification, mock interviews, and the highest-impact steps first." },
    ],
  },
  {
    id: "payments",
    name: "Payments & refunds",
    icon: "M3 10h18M7 15h2m4 0h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
    items: [
      { q: "Is this a subscription?", a: "No. One payment, lifetime access until your visa is stamped. We never auto-charge you again." },
      { q: "What payment methods do you accept?", a: "Cards, UPI (India), net banking, and most major international payment methods. Pricing automatically shows in ₹ for India and $ elsewhere — you can switch manually in the footer." },
      { q: "What's your refund policy?", a: "Full refund within 14 days, no questions asked. Email us from your account email and we process it within 3-5 business days." },
      { q: "What does the Family plan include?", a: "Up to 2 students, each with their own separate account, timeline, documents, and progress. The buyer gets a family overview showing both. Ideal for siblings, cousins, or friends applying together." },
      { q: "Can I upgrade from Solo to Family later?", a: "Yes — pay only the difference. Go to Settings → Plan → Upgrade." },
      { q: "I paid but my account still shows Free.", a: "Refresh the page first. If it persists, log out and back in. Still stuck? Email us with your payment reference and we'll fix it within hours." },
    ],
  },
  {
    id: "visa-process",
    name: "The visa process",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    items: [
      { q: "Do you guarantee my visa will be approved?", a: "No. Visa decisions are made solely by US consular officers, and no preparation tool can change that. What GetStamped does is help you walk in prepared — with the right documents, the steps in the right order, and practice answering the questions officers commonly ask." },
      { q: "Is the information up to date?", a: "We monitor State Department and USCIS policy changes and update affected steps. Each step links to its official source so you can verify the underlying information yourself. Immigration policy can change without notice — please confirm critical forms and fees on the official government site before acting." },
      { q: "What is a 221(g) and does GetStamped help avoid it?", a: "A 221(g) is administrative processing — your case gets held, often for missing or mismatched paperwork, adding weeks of delay. Many 221(g) issues come from common formatting errors, and our document verification step is designed to flag those before your interview. It does not eliminate the possibility of a 221(g)." },
      { q: "What's the DS-160 and why does everyone fear it?", a: "It's the 91-field online visa application form. A typo on your SEVIS number or a date mismatch with your I-20 can derail your application. GetStamped breaks it into 12 stages with a check at each one — but it does not file the DS-160 on your behalf." },
      { q: "Does GetStamped cover UK, Canada, or Australia visas?", a: "Not yet — F-1 (US) only for now. UK Student Route, Canada Study Permit, and Australia Subclass 500 are on the roadmap. Existing users will be notified first." },
      { q: "Is GetStamped affiliated with the US government?", a: "No. GetStamped is an independent preparation tool. We are not affiliated with the US Department of State, USCIS, or any government agency, and we are not immigration attorneys." },
    ],
  },
  {
    id: "features",
    name: "Features & tools",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    items: [
      { q: "How does the voice mock interview work?", a: "Pick a scenario (Bachelor's, Master's, PhD), difficulty, and officer style. The AI officer asks questions out loud, you answer with your voice, and follow-ups adapt to what you say. You get scored on clarity, confidence, specificity, and the consistency of your financial story. This is automated practice — not a substitute for an officer's actual judgment." },
      { q: "Which browsers support the voice mock interview?", a: "Chrome, Edge, and Safari. Firefox has limited speech support. We do not store the raw audio — only the transcript is processed for scoring." },
      { q: "How does the AI Q&A work?", a: "Ask anything about your F-1 process — globally or scoped to a specific step. Answers are grounded in the structured process steps and cited sources, not generic advice. Free users get 3 questions; paid users get unlimited." },
      { q: "What's the Parent View?", a: "A read-only link your parents can open without any login. They see your progress, current phase, interview countdown, and recent activity — updated live as you complete steps. No app, no login, no access to your underlying documents." },
      { q: "Is my document data safe?", a: "Yes. Documents are deleted from our storage within 5 minutes of upload — only the structured checklist result is retained (for example, \"signature: verified\"). We never store the image, extracted text, or any personally identifying data beyond your account email and name. Our AI provider, Groq, has Zero Data Retention (ZDR) enabled on our account, so submitted content is not stored on their side either. We operate as a Data Fiduciary under India's DPDP Act." },
      { q: "What's the Interview Day Checklist PDF?", a: "One click compiles the structured records of every document you've prepared into a single labeled, printable PDF — so you walk into the consulate with an organized reference. The underlying files are not embedded; the PDF lists what you've prepared and your scan outcomes." },
      { q: "Can I use GetStamped on my phone?", a: "Yes — the entire app is mobile-first. Most students complete the majority of their steps from their phone." },
    ],
  },
  {
    id: "account",
    name: "Account & technical",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    items: [
      { q: "How do I reset my password?", a: "Click 'Sign in' → 'Forgot password' and we'll email you a reset link. Check spam if it doesn't arrive within 2 minutes." },
      { q: "Can I change my intake date after onboarding?", a: "Yes — Settings → Application → Intake term. Your entire 47-step timeline recalculates automatically." },
      { q: "Can I share my account with my sibling?", a: "Accounts are personal — visa data conflicts make sharing impractical. Use the Family plan instead: each student gets their own full account." },
      { q: "How do I delete my account?", a: "You can request deletion of your account and all associated data at any time by emailing getstampedlegal@gmail.com (or from Settings → Danger zone). We action deletion requests within 7 business days. You can export your data first." },
      { q: "What data does GetStamped keep about me?", a: "Your account info (name, email), a structured checklist of your document scan results, your mock interview transcripts and scores, and anonymous usage data for product improvement. We do not store raw document files, extracted text, or any PII beyond your account email and name. Full details are in our Privacy Policy." },
      { q: "Something looks broken. What do I do?", a: "Hard-refresh the page (Cmd/Ctrl + Shift + R). If it persists, email us with a screenshot and your browser name — we usually respond within a few hours." },
    ],
  },
];

export function SupportClient({ isAuthed }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return CATEGORIES.map(c => ({
      ...c,
      items: c.items.filter(
        it => !ql || it.q.toLowerCase().includes(ql) || it.a.toLowerCase().includes(ql)
      ),
    })).filter(c => (activeCat === "all" || c.id === activeCat) && c.items.length > 0);
  }, [query, activeCat]);

  const total = useMemo(
    () => filtered.reduce((n, c) => n + c.items.length, 0),
    [filtered]
  );

  return (
    <main className="sp">
      {isAuthed && (
        <div className="sp-topbar">
          <Link href="/dashboard" className="sp-back" aria-label="Back to dashboard">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to dashboard</span>
          </Link>
        </div>
      )}
      {/* header */}
      <header className="sp-head">
        <p className="sp-eyebrow">SUPPORT</p>
        <h1 className="sp-title">How can we help?</h1>
        <p className="sp-sub">
          Answers to everything students ask us. If it&rsquo;s not here, we&rsquo;re one email away.
        </p>
        <div className="sp-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a question… e.g. refund, DS-160, parent view"
          />
          {query && <button className="sp-clear" onClick={() => setQuery("")}>×</button>}
        </div>
      </header>

      {/* category chips */}
      <div className="sp-chips">
        <button className={`sp-chip ${activeCat === "all" ? "on" : ""}`} onClick={() => setActiveCat("all")}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c.id} className={`sp-chip ${activeCat === c.id ? "on" : ""}`}
            onClick={() => setActiveCat(activeCat === c.id ? "all" : c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* results */}
      {total === 0 ? (
        <div className="sp-empty">
          <p>No answers match &ldquo;{query}&rdquo;.</p>
          <span>Try different words — or reach us below.</span>
        </div>
      ) : (
        <div className="sp-cats">
          {filtered.map(cat => (
            <section key={cat.id} className="sp-cat">
              <div className="sp-cat-head">
                <span className="sp-cat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon} /></svg>
                </span>
                <h2>{cat.name}</h2>
                <span className="sp-cat-count">{cat.items.length}</span>
              </div>
              <div className="sp-list">
                {cat.items.map(item => {
                  const key = cat.id + item.q;
                  const isOpen = open === key;
                  return (
                    <div key={key} className={`sp-item ${isOpen ? "open" : ""}`}>
                      <button className="sp-q" onClick={() => setOpen(isOpen ? null : key)}>
                        <span>{item.q}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" className="sp-chev">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <div className="sp-a-wrap" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                        <div className="sp-a"><p>{item.a}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* contact card */}
      <section className="sp-contact">
        <div className="sp-contact-inner">
          <div>
            <p className="sp-contact-eyebrow">STILL STUCK?</p>
            <h2>Didn&rsquo;t find your answer?</h2>
            <p className="sp-contact-sub">
              Email us directly — a real person reads every message and replies within a few hours,
              usually faster. Include screenshots if something looks broken.
            </p>
          </div>
          <div className="sp-contact-actions">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="sp-btn-primary">
              Email support →
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20request`} className="sp-btn-ghost">
              Request a refund
            </a>
            <p className="sp-contact-note">{SUPPORT_EMAIL} · avg. reply under 6 hours</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .sp {
          min-height: 100dvh;
          background: var(--color-paper, #F4EFE6);
          padding: 24px 24px 96px;
          display: flex; flex-direction: column; align-items: center;
          position: relative;
        }

        /* ---- top bar — flush-left back link, full-width row ---- */
        .sp-topbar {
          width: 100%;
          max-width: 1100px;
          display: flex;
          justify-content: flex-start;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .sp { padding: 32px 48px 120px; }
        }

        /* ---- back to dashboard (logged-in only) ---- */
        .sp-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          margin-left: -10px;            /* optical alignment to the page edge */
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-ink-soft, #2A3441);
          text-decoration: none;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .sp-back:hover {
          color: var(--color-persimmon-deep, #D9461E);
          background: var(--color-persimmon-tint, #FFEEE8);
        }
        .sp-back svg { transition: transform 0.18s ease; }
        .sp-back:hover svg { transform: translateX(-2px); }

        .sp-head { width: 100%; max-width: 760px; text-align: center; }
        .sp-eyebrow {
          font-size: 11px; letter-spacing: 0.18em; font-weight: 500;
          color: var(--color-persimmon-deep, #D9461E); margin: 0;
        }
        .sp-title {
          font-family: var(--font-display, Georgia, serif); font-weight: 400;
          font-size: clamp(32px, 5.5vw, 52px); letter-spacing: -0.02em;
          color: var(--color-ink, #0F1419); margin: 12px 0 0;
        }
        .sp-sub {
          font-size: 15px; color: var(--color-ink-soft, #2A3441);
          margin: 14px auto 0; max-width: 440px; line-height: 1.6;
        }
        .sp-search {
          position: relative; margin: 32px auto 0; max-width: 560px;
          display: flex; align-items: center;
        }
        .sp-search svg {
          position: absolute; left: 16px; width: 17px; height: 17px;
          color: var(--color-muted, #6B7280);
        }
        .sp-search input {
          width: 100%; border-radius: 14px;
          border: 1px solid var(--color-border, #E2D8C6);
          background: var(--color-surface, #fff);
          padding: 14px 44px 14px 44px; font-size: 15px;
          color: var(--color-ink, #0F1419); outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .sp-search input:focus {
          border-color: var(--color-persimmon, #FF5B2E);
          box-shadow: 0 0 0 4px rgba(255, 91, 46, 0.10);
        }
        .sp-clear {
          position: absolute; right: 12px; border: none; background: none;
          font-size: 20px; color: var(--color-muted, #6B7280); cursor: pointer;
          line-height: 1; padding: 4px;
        }

        /* ---- chips ---- */
        .sp-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; margin-top: 28px; max-width: 760px;
        }
        .sp-chip {
          border-radius: 999px; padding: 8px 16px; font-size: 13px;
          cursor: pointer; transition: all 0.18s ease;
          border: 1px solid var(--color-border, #E2D8C6);
          background: var(--color-paper-soft, #FAF6ED);
          color: var(--color-ink, #0F1419);
        }
        .sp-chip.on {
          border-color: var(--color-persimmon, #FF5B2E);
          background: var(--color-persimmon-tint, #FFEEE8);
          color: var(--color-persimmon-deep, #D9461E);
          font-weight: 500;
        }

        /* ---- categories ---- */
        .sp-cats {
          width: 100%; max-width: 760px; margin-top: 48px;
          display: flex; flex-direction: column; gap: 40px;
        }
        .sp-cat-head {
          display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
        }
        .sp-cat-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--color-persimmon-tint, #FFEEE8);
          color: var(--color-persimmon-deep, #D9461E);
          display: grid; place-items: center; flex-shrink: 0;
        }
        .sp-cat-icon svg { width: 17px; height: 17px; }
        .sp-cat-head h2 {
          font-family: var(--font-display, Georgia, serif); font-weight: 400;
          font-size: 22px; letter-spacing: -0.01em;
          color: var(--color-ink, #0F1419); margin: 0;
        }
        .sp-cat-count {
          font-size: 12px; color: var(--color-muted, #6B7280);
          font-variant-numeric: tabular-nums;
          border: 1px solid var(--color-border-soft, #EDE4D2);
          border-radius: 999px; padding: 2px 9px;
        }

        /* ---- accordion ---- */
        .sp-list {
          border: 1px solid var(--color-border-soft, #EDE4D2);
          border-radius: 16px; overflow: hidden;
          background: var(--color-paper-soft, #FAF6ED);
        }
        .sp-item + .sp-item { border-top: 1px solid var(--color-border-soft, #EDE4D2); }
        .sp-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          gap: 16px; text-align: left; padding: 17px 20px;
          border: none; background: none; cursor: pointer;
          font-size: 15px; font-weight: 500; color: var(--color-ink, #0F1419);
          transition: background 0.18s ease;
        }
        .sp-q:hover { background: var(--color-paper-deep, #ECE4D3); }
        .sp-chev {
          width: 16px; height: 16px; flex-shrink: 0;
          color: var(--color-muted, #6B7280);
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sp-item.open .sp-chev {
          transform: rotate(180deg);
          color: var(--color-persimmon-deep, #D9461E);
        }
        .sp-a-wrap {
          display: grid;
          transition: grid-template-rows 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sp-a { overflow: hidden; }
        .sp-a p {
          margin: 0; padding: 0 20px 18px;
          font-size: 14px; line-height: 1.65;
          color: var(--color-ink-soft, #2A3441);
          max-width: 640px;
        }

        /* ---- empty ---- */
        .sp-empty {
          margin-top: 64px; text-align: center;
          border: 1px dashed var(--color-border, #E2D8C6);
          border-radius: 16px; padding: 48px 24px;
          width: 100%; max-width: 560px;
          background: var(--color-paper-soft, #FAF6ED);
        }
        .sp-empty p {
          margin: 0; font-size: 16px; font-weight: 500;
          color: var(--color-ink, #0F1419);
        }
        .sp-empty span {
          display: block; margin-top: 6px; font-size: 13px;
          color: var(--color-muted, #6B7280);
        }

        /* ---- contact card ---- */
        .sp-contact {
          width: 100%; max-width: 760px; margin-top: 64px;
        }
        .sp-contact-inner {
          border-radius: 20px; padding: 36px;
          background: var(--color-ink, #0F1419);
          display: grid; grid-template-columns: 1.3fr 1fr; gap: 32px;
          align-items: center;
        }
        @media (max-width: 640px) {
          .sp-contact-inner { grid-template-columns: 1fr; padding: 28px 22px; }
        }
        .sp-contact-eyebrow {
          font-size: 10px; letter-spacing: 0.18em; font-weight: 500;
          color: var(--color-persimmon, #FF5B2E); margin: 0;
        }
        .sp-contact-inner h2 {
          font-family: var(--font-display, Georgia, serif); font-weight: 400;
          font-size: clamp(22px, 3.4vw, 30px); letter-spacing: -0.01em;
          color: var(--color-paper, #F4EFE6); margin: 10px 0 0;
        }
        .sp-contact-sub {
          font-size: 14px; line-height: 1.65;
          color: rgba(244, 239, 230, 0.7); margin: 12px 0 0;
        }
        .sp-contact-actions { display: flex; flex-direction: column; gap: 10px; }
        .sp-btn-primary {
          display: block; text-align: center; text-decoration: none;
          background: var(--color-persimmon, #FF5B2E);
          color: var(--color-paper, #F4EFE6);
          font-size: 14px; font-weight: 500;
          padding: 13px 22px; border-radius: 12px;
          transition: background 0.2s ease;
        }
        .sp-btn-primary:hover { background: var(--color-persimmon-deep, #D9461E); }
        .sp-btn-ghost {
          display: block; text-align: center; text-decoration: none;
          border: 1px solid rgba(244, 239, 230, 0.25);
          color: rgba(244, 239, 230, 0.85);
          font-size: 14px; padding: 12px 22px; border-radius: 12px;
          transition: border 0.2s ease, color 0.2s ease;
        }
        .sp-btn-ghost:hover {
          border-color: var(--color-persimmon, #FF5B2E);
          color: var(--color-persimmon, #FF5B2E);
        }
        .sp-contact-note {
          margin: 4px 0 0; text-align: center;
          font-size: 11px; letter-spacing: 0.04em;
          color: rgba(244, 239, 230, 0.45);
        }
      `}</style>
    </main>
  );
}
