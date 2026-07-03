"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   Hero — scroll-through-the-playbook.

   A ~450vh runway with a sticky 100vh stage. Scroll drives three acts:

     ACT 1 (p 0 → 0.24)   Headline stack fades up and away while the
                          playbook card — rendered full-viewport but
                          clipped down to a small centered card via
                          clip-path — expands to fill the screen.
     ACT 2 (p 0.24 → 0.84) You scroll *through* the playbook: rows rise
                          past a fixed "now" line and tick off with a
                          persimmon check, the phase label flips
                          (02 → 05), dates advance, progress bar fills.
     ACT 3 (p 0.84 → 1)   The final step ticks and an F-1 stamp presses
                          onto the screen. Page releases into the
                          feature sections.

   Mechanics per house rules:
     • ONE rAF-throttled scroll listener, zero React state per frame —
       direct style/class writes only (same pattern as ScrollTransitions).
     • clip-path + transform + opacity only. No layout writes per frame.
     • Click anywhere (except links) skips to the end of the runway.
     • prefers-reduced-motion → a static hero, no runway, no pin.
     • All colors via var(--color-*) so dark mode flips automatically.
   ═════════════════════════════════════════════════════════════════════════ */

type PlayRow = { n: number; label: string; date: string; phase: string };

const PHASE_2 = "PHASE 02 · AFTER I-20";
const PHASE_3 = "PHASE 03 · DS-160 & FEES";
const PHASE_4 = "PHASE 04 · INTERVIEW PREP";
const PHASE_5 = "PHASE 05 · POST-APPROVAL";

const ROWS: PlayRow[] = [
  { n: 12, label: "Pay SEVIS I-901 fee", date: "Mar 03", phase: PHASE_2 },
  { n: 13, label: "Complete DS-160 form", date: "Mar 07", phase: PHASE_2 },
  { n: 14, label: "Schedule visa appointment", date: "Mar 10", phase: PHASE_2 },
  { n: 15, label: "Prepare document bundle", date: "Mar 12", phase: PHASE_2 },
  { n: 16, label: "US-spec visa photos", date: "Mar 14", phase: PHASE_2 },
  { n: 20, label: "Upload DS-160 photo", date: "Mar 21", phase: PHASE_3 },
  { n: 21, label: "Personal info — passport match", date: "Mar 24", phase: PHASE_3 },
  { n: 23, label: "Create visa service profile", date: "Mar 29", phase: PHASE_3 },
  { n: 24, label: "Pay the MRV fee", date: "Apr 02", phase: PHASE_3 },
  { n: 26, label: "Book the interview slot", date: "Apr 08", phase: PHASE_3 },
  { n: 30, label: "Financial story, to the dollar", date: "Apr 18", phase: PHASE_4 },
  { n: 31, label: "Return-intent answers", date: "Apr 22", phase: PHASE_4 },
  { n: 33, label: "Mock interview, round one", date: "Apr 26", phase: PHASE_4 },
  { n: 36, label: "Route + consulate day plan", date: "May 06", phase: PHASE_4 },
  { n: 37, label: "Final document check", date: "May 09", phase: PHASE_4 },
  { n: 40, label: "Track passport return", date: "May 16", phase: PHASE_5 },
  { n: 43, label: "Flights, bank, insurance", date: "May 24", phase: PHASE_5 },
  { n: 44, label: "Verify visa details", date: "May 28", phase: PHASE_5 },
  { n: 45, label: "Pre-departure essentials", date: "Jun 02", phase: PHASE_5 },
  { n: 47, label: "Port of entry — SEVIS validated", date: "Jun 14", phase: PHASE_5 },
];

const ROW_H = 64; // px, fixed — lets per-frame math avoid rect reads

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const sub = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function Hero() {
  const runwayRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);
  const nowlineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const runway = runwayRef.current;
    const head = headRef.current;
    const book = bookRef.current;
    const chrome = chromeRef.current;
    const track = trackRef.current;
    const phaseEl = phaseRef.current;
    const bar = barRef.current;
    const pct = pctRef.current;
    const stamp = stampRef.current;
    const handoff = handoffRef.current;
    const nowline = nowlineRef.current;
    if (!runway || !head || !book || !track) return;

    const rows = Array.from(track.querySelectorAll<HTMLElement>(".gs-hx-row"));
    let lastDone = -1;
    let ticking = false;

    const frame = () => {
      ticking = false;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const rect = runway.getBoundingClientRect();
      const total = rect.height - vh;
      if (total <= 0) return;
      const p = clamp01(-rect.top / total);
      progressRef.current = p;

      /* ACT 1 — headline out, card expands to fullscreen */
      const hOut = easeOut(sub(p, 0, 0.14));
      head.style.opacity = (1 - hOut).toFixed(3);
      head.style.transform = `translateY(${(-44 * hOut).toFixed(1)}px)`;
      head.style.pointerEvents = p > 0.1 ? "none" : "";

      const k = easeOut(sub(p, 0.03, 0.26));
      const isMobile = vw < 768;
      const sideStart = isMobile ? vw * 0.05 : Math.max((vw - 760) / 2, vw * 0.04);
      const topStart = vh * (isMobile ? 0.56 : 0.6);
      const botStart = vh * 0.05;
      const inTop = lerp(topStart, 0, k);
      const inSide = lerp(sideStart, 0, k);
      const inBot = lerp(botStart, 0, k);
      const rad = lerp(20, 0, k);
      book.style.clipPath = `inset(${inTop.toFixed(1)}px ${inSide.toFixed(1)}px ${inBot.toFixed(1)}px ${inSide.toFixed(1)}px round ${rad.toFixed(1)}px)`;

      if (chrome) chrome.style.opacity = easeOut(sub(p, 0.16, 0.28)).toFixed(3);
      if (nowline) nowline.style.opacity = easeOut(sub(p, 0.2, 0.3)).toFixed(3);

      /* ACT 2 — travel through the playbook */
      const t = sub(p, 0.26, 0.84);
      const padTop = vh * 0.62;
      const trackLen = padTop + ROWS.length * ROW_H;
      const maxT = trackLen - vh * 0.42;
      const translate = -easeInOutQuad(t) * maxT;
      track.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0)`;

      // A row is "done" once its center rises past the now-line (50vh).
      const done = Math.max(
        0,
        Math.min(
          ROWS.length,
          Math.floor((vh * 0.5 - padTop - ROW_H / 2 - translate) / ROW_H + 1),
        ),
      );
      if (done !== lastDone) {
        lastDone = done;
        rows.forEach((r, i) => r.classList.toggle("is-done", i < done));
        if (phaseEl) {
          const idx = Math.min(Math.max(done, 1) - 1, ROWS.length - 1);
          phaseEl.textContent = ROWS[idx].phase;
        }
        if (pct) pct.textContent = `${Math.round((done / ROWS.length) * 47)} / 47`;
        if (bar) bar.style.transform = `scaleX(${(done / ROWS.length).toFixed(3)})`;
      }

      /* ACT 3 — the stamp. Fast press: most of the motion happens in a
         short scroll window so it reads as an impact, not a fade. */
      if (stamp) {
        const s = easeOut(sub(p, 0.86, 0.92));
        stamp.style.opacity = Math.min(1, s * 1.4).toFixed(3);
        stamp.style.transform = `translate(-50%, -50%) scale(${lerp(1.45, 1, s).toFixed(3)}) rotate(-8deg)`;
        if (dimRef.current) dimRef.current.style.opacity = (0.55 * s).toFixed(3);
      }
      if (handoff) handoff.style.opacity = easeOut(sub(p, 0.94, 1)).toFixed(3);
    };

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };

    // Escape hatch — click anywhere that isn't a link skips the runway.
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      const p = progressRef.current;
      if (p <= 0.04 || p >= 0.96) return;
      const rect = runway.getBoundingClientRect();
      const absTop = window.scrollY + rect.top;
      window.scrollTo({ top: absTop + rect.height - window.innerHeight, behavior: "smooth" });
    };

    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    runway.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      runway.removeEventListener("click", onClick);
    };
  }, [reduced]);

  if (reduced) return <HeroStatic />;

  return (
    <section ref={runwayRef} aria-label="Hero" className="gs-hx-runway">
      <div className="gs-hx-sticky">
        {/* Warm afternoon glow pooling behind the headline — kills the
            flat-blank feel without adding any off-palette color. */}
        <div className="gs-hx-bg" aria-hidden>
          <span className="gs-hx-blob gs-hx-blob-a" />
          <span className="gs-hx-blob gs-hx-blob-b" />
          <span className="gs-hx-grain" />
        </div>

        {/* ── Layer A · headline stack ── */}
        <div ref={headRef} className="gs-hx-head">
          <p className="gs-hx-eyebrow">F-1 · 47 Steps · One Payment</p>
          <h1 className="gs-hx-h1">
            Forty-seven steps.
            <br />
            We have <em>all</em> of them.
          </h1>
          <p className="gs-hx-sub">
            A 47-step playbook in consulate order. AI document checks. Voice
            mock interviews. One workspace until your passport is stamped.
          </p>
          <div className="gs-hx-ctas">
            <Link href="/sign-up" className="gs-hx-primary">
              Start free — Phase 1 forever
            </Link>
            <span className="gs-hx-hint">
              Scroll to fast-forward the journey <span aria-hidden>↓</span>
            </span>
          </div>
          <p className="gs-hx-trust">
            Phase 1 free forever&ensp;·&ensp;No subscription&ensp;·&ensp;14-day refund
          </p>
        </div>

        {/* ── Layer B · the playbook (full viewport, clipped to a card) ── */}
        <div ref={bookRef} className="gs-hx-book" aria-hidden>
          <div ref={chromeRef} className="gs-hx-chrome">
            <span ref={phaseRef} className="gs-hx-phase">{PHASE_2}</span>
            <span className="gs-hx-meter">
              <span className="gs-hx-bar">
                <span ref={barRef} className="gs-hx-bar-fill" />
              </span>
              <span ref={pctRef} className="gs-hx-pct">0 / 47</span>
            </span>
          </div>

          <div ref={nowlineRef} className="gs-hx-nowline">
            <span>NOW</span>
          </div>

          <div ref={trackRef} className="gs-hx-track">
            {ROWS.map((r) => (
              <div key={r.n} className="gs-hx-row">
                <span className="gs-hx-mark" aria-hidden>
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="gs-hx-step">Step {r.n}</span>
                <span className="gs-hx-label">{r.label}</span>
                <span className="gs-hx-date">{r.date}</span>
              </div>
            ))}
          </div>

          {/* Dim wash under the stamp so it lands on a quiet surface */}
          <div ref={dimRef} className="gs-hx-dim" />

          {/* The stamp — passport-style rounded rectangle, double border */}
          <div ref={stampRef} className="gs-hx-stamp">
            <span className="gs-hx-stamp-frame">
              <span className="gs-hx-stamp-type">· U.S. CONSULATE ·</span>
              <span className="gs-hx-stamp-word">Stamped.</span>
              <span className="gs-hx-stamp-date">F-1 &nbsp;·&nbsp; JUN 14 &nbsp;·&nbsp; MULTIPLE ENTRIES</span>
            </span>
          </div>

          <div ref={handoffRef} className="gs-hx-handoff">
            That was the fast-forward. Here&rsquo;s how it actually works{" "}
            <span aria-hidden>↓</span>
          </div>
        </div>
      </div>

      <style>{`
        /* The pinned hero relies on position:sticky — keep it out of the
           content-visibility:auto scroll optimization (same exception the
           old hero + closer already had). */
        .v3-root main > .gs-hx-runway { content-visibility: visible; }

        .gs-hx-runway {
          position: relative;
          height: 460vh;
          background: var(--color-cream);
        }
        @media (max-width: 767px) { .gs-hx-runway { height: 340vh; } }

        .gs-hx-sticky {
          position: sticky; top: 0;
          height: 100vh; overflow: hidden;
        }

        /* ── headline stack ── */
        .gs-hx-head {
          position: absolute; inset: 0 0 auto 0;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          padding: clamp(96px, 13vh, 150px) 24px 0;
          z-index: 2;
          will-change: transform, opacity;
        }
        .gs-hx-eyebrow {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase;
          color: var(--color-persimmon); font-weight: 600;
          animation: gs-hx-up 700ms var(--ease-out) both;
        }
        .gs-hx-h1 {
          margin: 22px 0 0;
          font-family: var(--font-display-stack); font-weight: 400;
          font-size: clamp(46px, 7.4vw, 88px);
          line-height: 1.02; letter-spacing: -0.028em;
          color: var(--color-ink);
          text-wrap: balance;
          animation: gs-hx-up 700ms var(--ease-out) 120ms both;
        }
        .gs-hx-h1 em { font-style: italic; color: var(--color-persimmon); }
        .gs-hx-sub {
          margin: 20px auto 0; max-width: 560px;
          font-family: var(--font-sans-stack); font-size: 17px;
          line-height: 1.55; color: var(--color-ink-soft);
          animation: gs-hx-up 700ms var(--ease-out) 240ms both;
        }
        .gs-hx-ctas {
          margin-top: 32px; display: flex; flex-direction: column;
          align-items: center; gap: 14px;
          animation: gs-hx-up 700ms var(--ease-out) 360ms both;
        }
        .gs-hx-primary {
          background: var(--color-persimmon); color: #FAF8F4;
          font-family: var(--font-sans-stack); font-size: 15px; font-weight: 600;
          padding: 16px 30px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 10px 28px -10px rgba(232,98,42,0.55);
          transition: transform 200ms var(--ease-out), background 200ms var(--ease-out);
        }
        @media (hover: hover) {
          .gs-hx-primary:hover { transform: translateY(-1px); background: var(--color-persimmon-deep); }
        }
        .gs-hx-hint {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--color-muted);
        }
        .gs-hx-hint span { display: inline-block; animation: gs-hx-bob 1.8s var(--ease-in-out) infinite; }
        @keyframes gs-hx-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gs-hx-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }

        /* ── the playbook layer ── */
        .gs-hx-book {
          position: absolute; inset: 0; z-index: 3;
          background: var(--color-cream-soft);
          border: 1px solid var(--color-border-soft);
          clip-path: inset(60vh 20vw 5vh 20vw round 20px);
          will-change: clip-path;
        }
        .gs-hx-chrome {
          position: absolute; inset: 0 0 auto 0; height: 56px; z-index: 4;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(18px, 4vw, 48px);
          background: var(--color-cream-soft);
          border-bottom: 1px solid var(--color-border-soft);
          opacity: 0;
        }
        .gs-hx-phase {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px; letter-spacing: 0.24em; font-weight: 600;
          color: var(--color-persimmon);
        }
        .gs-hx-meter { display: inline-flex; align-items: center; gap: 12px; }
        .gs-hx-bar {
          width: clamp(80px, 16vw, 200px); height: 3px; border-radius: 999px;
          background: var(--color-border-soft); overflow: hidden; display: block;
        }
        .gs-hx-bar-fill {
          display: block; height: 100%; width: 100%;
          background: var(--color-persimmon);
          transform: scaleX(0); transform-origin: left center;
          transition: transform 300ms var(--ease-out);
        }
        .gs-hx-pct {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; color: var(--color-ink-soft);
          font-variant-numeric: tabular-nums;
        }

        .gs-hx-nowline {
          position: absolute; left: 0; right: 0; top: 50vh; z-index: 3;
          border-top: 1px dashed rgba(232,98,42,0.5);
          opacity: 0; pointer-events: none;
        }
        .gs-hx-nowline span {
          position: absolute; right: clamp(18px, 4vw, 48px); top: -9px;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 9px; letter-spacing: 0.22em; font-weight: 600;
          color: var(--color-persimmon);
          background: var(--color-cream-soft); padding: 2px 8px;
          border: 1px solid rgba(232,98,42,0.5); border-radius: 999px;
        }

        .gs-hx-track {
          position: absolute; inset: 0; z-index: 2;
          padding-top: 62vh;
          will-change: transform;
        }
        .gs-hx-row {
          display: grid;
          grid-template-columns: 24px 76px 1fr auto;
          align-items: center; gap: 16px;
          height: ${ROW_H}px;
          max-width: 860px; margin: 0 auto;
          padding: 0 clamp(18px, 4vw, 48px);
          border-bottom: 1px solid var(--color-border-soft);
          font-family: var(--font-sans-stack); font-size: 14.5px;
          color: var(--color-ink);
        }
        .gs-hx-step {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px; letter-spacing: 0.12em;
          color: var(--color-muted);
        }
        .gs-hx-label { letter-spacing: -0.003em; transition: color 250ms var(--ease-soft); }
        .gs-hx-date {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; color: var(--color-muted);
          font-variant-numeric: tabular-nums;
        }
        .gs-hx-mark {
          width: 19px; height: 19px; border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--color-border);
          background: transparent; color: transparent;
          transition: background 250ms var(--ease-soft),
            border-color 250ms var(--ease-soft),
            color 250ms var(--ease-soft),
            transform 250ms var(--ease-soft);
        }
        .gs-hx-mark svg { width: 10px; height: 10px; }
        .gs-hx-row.is-done .gs-hx-mark {
          background: var(--color-persimmon);
          border-color: var(--color-persimmon);
          color: #FAF8F4;
          transform: scale(1.08);
        }
        .gs-hx-row.is-done .gs-hx-label { color: var(--color-ink-soft); }

        /* ── hero background — warm pooled light + faint grain ── */
        .gs-hx-bg { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .gs-hx-blob {
          position: absolute; border-radius: 999px; filter: blur(46px);
        }
        .gs-hx-blob-a {
          width: 620px; height: 620px; left: -10%; top: -14%;
          background: radial-gradient(circle, rgba(245, 213, 144, 0.5) 0%, transparent 65%);
          opacity: 0.6;
        }
        .gs-hx-blob-b {
          width: 520px; height: 520px; right: -8%; top: 24%;
          background: radial-gradient(circle, rgba(232, 98, 42, 0.16) 0%, transparent 65%);
          opacity: 0.7;
        }
        html.dark .gs-hx-blob-a { opacity: 0.12; }
        html.dark .gs-hx-blob-b { opacity: 0.2; }
        .gs-hx-grain {
          position: absolute; inset: 0; opacity: 0.035;
          background-image:
            radial-gradient(circle at 25% 30%, rgba(28,25,23,0.5) 0.5px, transparent 1px),
            radial-gradient(circle at 75% 70%, rgba(28,25,23,0.4) 0.5px, transparent 1px);
          background-size: 4px 4px, 5px 5px;
        }
        html.dark .gs-hx-grain { opacity: 0.06; }

        .gs-hx-trust {
          margin-top: 26px;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--color-muted);
          animation: gs-hx-up 700ms var(--ease-out) 480ms both;
        }

        /* ── dim wash + the stamp ── */
        .gs-hx-dim {
          position: absolute; inset: 0; z-index: 4;
          background: var(--color-cream-soft);
          opacity: 0; pointer-events: none;
        }
        .gs-hx-stamp {
          position: absolute; left: 50%; top: 50%; z-index: 5;
          opacity: 0; pointer-events: none;
          transform: translate(-50%, -50%) scale(1.45) rotate(-8deg);
          will-change: transform, opacity;
        }
        .gs-hx-stamp-frame {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          text-align: center; color: var(--color-persimmon);
          padding: clamp(26px, 4vw, 38px) clamp(34px, 6vw, 64px);
          border: 3px solid var(--color-persimmon);
          border-radius: 14px;
          outline: 1.5px solid rgba(232, 98, 42, 0.55);
          outline-offset: 5px;
          background: radial-gradient(80% 90% at 50% 40%, rgba(232,98,42,0.10) 0%, rgba(232,98,42,0.02) 80%);
          box-shadow: 0 30px 90px -24px rgba(232, 98, 42, 0.4);
          /* subtle worn-ink effect */
          -webkit-mask-image: radial-gradient(140% 140% at 48% 52%, #000 62%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.95) 100%);
                  mask-image: radial-gradient(140% 140% at 48% 52%, #000 62%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.95) 100%);
        }
        .gs-hx-stamp-type, .gs-hx-stamp-date {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; letter-spacing: 0.34em; font-weight: 600;
          white-space: nowrap;
        }
        .gs-hx-stamp-word {
          font-family: var(--font-display-stack); font-style: italic;
          font-size: clamp(52px, 8vw, 84px); letter-spacing: -0.01em;
          line-height: 1;
        }

        .gs-hx-handoff {
          position: absolute; left: 0; right: 0; bottom: 5vh; z-index: 5;
          text-align: center; opacity: 0; pointer-events: none;
          font-family: var(--font-sans-stack); font-size: 14px;
          color: var(--color-ink-soft);
        }

        @media (max-width: 767px) {
          .gs-hx-row { grid-template-columns: 20px 58px 1fr auto; gap: 10px; font-size: 13px; }
          .gs-hx-h1 { font-size: clamp(36px, 9.6vw, 50px); }
          .gs-hx-sub { font-size: 15px; }
        }
      `}</style>
    </section>
  );
}

/* Static fallback — no runway, no pin, no per-frame writes. What
   reduced-motion users (and any non-JS render) get. */
function HeroStatic() {
  return (
    <section aria-label="Hero" className="gs-hxs">
      <p className="gs-hx-eyebrow">F-1 · 47 Steps · One Payment</p>
      <h1 className="gs-hx-h1">
        Forty-seven steps.
        <br />
        We have <em>all</em> of them.
      </h1>
      <p className="gs-hx-sub">
        A 47-step playbook in consulate order. AI document checks. Voice mock
        interviews. One workspace until your passport is stamped.
      </p>
      <div className="gs-hx-ctas">
        <Link href="/sign-up" className="gs-hx-primary">
          Start free — Phase 1 forever
        </Link>
        <Link href="#playbook" className="gs-hx-hint" style={{ textDecoration: "none" }}>
          See the 47 steps <span aria-hidden>↓</span>
        </Link>
      </div>
      <div className="gs-hxs-card">
        {ROWS.slice(0, 5).map((r, i) => (
          <div key={r.n} className={`gs-hx-row${i < 2 ? " is-done" : ""}`}>
            <span className="gs-hx-mark" aria-hidden>
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="gs-hx-step">Step {r.n}</span>
            <span className="gs-hx-label">{r.label}</span>
            <span className="gs-hx-date">{r.date}</span>
          </div>
        ))}
      </div>
      <style>{`
        .gs-hxs {
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          padding: clamp(96px, 13vh, 150px) 24px 80px;
          background: var(--color-cream);
        }
        .gs-hxs .gs-hx-eyebrow, .gs-hxs .gs-hx-h1, .gs-hxs .gs-hx-sub,
        .gs-hxs .gs-hx-ctas { animation: none !important; }
        .gs-hxs-card {
          margin-top: 56px; width: 100%; max-width: 760px;
          border: 1px solid var(--color-border-soft); border-radius: 20px;
          background: var(--color-cream-soft); overflow: hidden;
          text-align: left;
        }
        .gs-hxs-card .gs-hx-row:last-child { border-bottom: none; }
      `}</style>
    </section>
  );
}
