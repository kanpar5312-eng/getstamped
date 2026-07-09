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
/* First N rows render pre-ticked so the resting card reads as a journey
   already in motion (persimmon checks visible before any scroll). */
const PRETICKED = 5;

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
  const ghostRef = useRef<HTMLSpanElement>(null);
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
    // Coarse-grained mobile detection to trim clip-path repaint precision —
    // one read on mount/resize, not per frame.
    let isMobile = window.innerWidth < 768;

    // Repainting clip-path every frame at sub-pixel precision is the single
    // biggest source of mobile jank here (clip-path forces a real repaint of
    // the region, not just a compositor update, on most mobile browsers).
    // Snapping to a coarser grid on phones cuts the number of distinct
    // shapes the browser has to rasterize per second without any visible
    // difference at this element's size.
    const snap = (v: number, step: number) => Math.round(v / step) * step;
    let lastClip = "";
    let lastHeadT = "";
    let lastChromeOp = "";
    let lastNowlineOp = "";
    // clip-path is a real repaint (not a compositor-only op) on every
    // mobile browser tested — even snapped to a coarse grid, writing it
    // every single rAF tick during a fast fling was still the dominant
    // cost in the scroll-jank reports. Skipping every other frame for
    // this ONE write (everything else in frame() still runs at full
    // rate — track transform, opacity, row ticking) halves the repaint
    // rate during Act 1 with no visible stepping, since inset() at this
    // element's size doesn't need 60fps precision to read as smooth.
    let clipFrameSkip = 0;
    // Android's address bar hides/shows *during* a scroll gesture, which
    // changes window.innerHeight mid-frame (desktop's viewport is stable,
    // no address-bar resize) — visualViewport.height tracks the actual
    // visible area more consistently through that than innerHeight does.
    // Bailing out on a bad reading used to freeze the headline/card
    // clip-path at a stale frame while native scroll kept moving
    // underneath (headline and playbook card overlapping mid-transition).
    // Falling back to the last known-good total instead means a
    // momentary bad reading just reuses the previous frame's geometry
    // for one tick — imperceptible — rather than freezing entirely.
    let lastGoodTotal = 0;

    const frame = () => {
      ticking = false;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const vw = window.innerWidth;
      const rect = runway.getBoundingClientRect();
      let total = rect.height - vh;
      if (total <= 0) {
        if (lastGoodTotal <= 0) return;
        total = lastGoodTotal;
      } else {
        lastGoodTotal = total;
      }
      const p = clamp01(-rect.top / total);
      progressRef.current = p;

      /* ACT 1 — headline out, card expands to fullscreen */
      const hOut = easeOut(sub(p, 0, 0.14));
      const headT = `translateY(${(-44 * hOut).toFixed(1)}px)`;
      if (headT !== lastHeadT) {
        lastHeadT = headT;
        head.style.opacity = (1 - hOut).toFixed(3);
        head.style.transform = headT;
        head.style.pointerEvents = p > 0.1 ? "none" : "";
      }

      // Gate the whole clip-path recompute+write behind the frame-skip on
      // mobile — not just the write, the math too, since there's no point
      // computing a value we're not going to use this tick.
      clipFrameSkip++;
      if (!isMobile || clipFrameSkip % 2 === 0) {
        const k = easeOut(sub(p, 0.03, 0.26));
        const sideStart = isMobile ? vw * 0.05 : Math.max((vw - 760) / 2, vw * 0.04);
        const topStart = vh * (isMobile ? 0.62 : 0.58);
        const botStart = vh * 0.05;
        const clipStep = isMobile ? 6 : 1;
        const radStep = isMobile ? 4 : 1;
        const inTop = snap(lerp(topStart, 0, k), clipStep);
        const inSide = snap(lerp(sideStart, 0, k), clipStep);
        const inBot = snap(lerp(botStart, 0, k), clipStep);
        const rad = snap(lerp(20, 0, k), radStep);
        const clip = `inset(${inTop}px ${inSide}px ${inBot}px ${inSide}px round ${rad}px)`;
        if (clip !== lastClip) {
          lastClip = clip;
          book.style.clipPath = clip;
        }
      }

      const chromeOp = easeOut(sub(p, 0.16, 0.28)).toFixed(2);
      if (chrome && chromeOp !== lastChromeOp) { lastChromeOp = chromeOp; chrome.style.opacity = chromeOp; }
      const nowlineOp = easeOut(sub(p, 0.2, 0.3)).toFixed(2);
      if (nowline && nowlineOp !== lastNowlineOp) { lastNowlineOp = nowlineOp; nowline.style.opacity = nowlineOp; }

      /* ACT 2 — travel through the playbook */
      const t = sub(p, 0.26, 0.84);
      const padTop = vh * 0.66;
      const trackLen = padTop + ROWS.length * ROW_H;
      const maxT = trackLen - vh * 0.42;
      const translate = -easeInOutQuad(t) * maxT;
      track.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0)`;

      // A row is "done" once its center rises past the now-line (50vh);
      // floored at PRETICKED so the resting card's checks never un-tick.
      const done = Math.max(
        PRETICKED,
        Math.min(
          ROWS.length,
          Math.floor((vh * 0.5 - padTop - ROW_H / 2 - translate) / ROW_H + 1),
        ),
      );
      if (done !== lastDone) {
        lastDone = done;
        rows.forEach((r, i) => {
          r.classList.toggle("is-done", i < done);
          r.classList.toggle("is-current", i === done && done < ROWS.length);
        });
        const idx = Math.min(Math.max(done, 1) - 1, ROWS.length - 1);
        if (phaseEl) phaseEl.textContent = ROWS[idx].phase;
        // "PHASE 0X · …" → the big ghost numeral behind the rows
        if (ghostRef.current) ghostRef.current.textContent = ROWS[idx].phase.slice(6, 8);
        if (pct) pct.textContent = `${Math.round((done / ROWS.length) * 100)}%`;
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
    const onResize = () => {
      isMobile = window.innerWidth < 768;
      onScroll();
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
    window.addEventListener("resize", onResize);
    runway.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
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
          <span className="gs-hx-blob gs-hx-blob-c" />
          <span className="gs-hx-grain" />
        </div>

        {/* ── Layer A · headline stack ── */}
        <div ref={headRef} className="gs-hx-head">
          <p className="gs-hx-eyebrow">F-1 · 47 steps · One payment</p>
          <h1 className="gs-hx-h1">
            Every step from <em>home</em>
            <br />
            to your US visa.
          </h1>
          <p className="sr-only">
            GetStamped is a guided F-1 student visa preparation workspace
            that walks international students through all 47 required steps,
            checks visa documents with AI, and runs voice-based mock visa
            interviews, in one place.
          </p>
          <p className="gs-hx-sub">
            AI-checked documents. Real mock interviews. Every step, in order.
          </p>
          <div className="gs-hx-ctas">
            <Link href="/sign-up" className="gs-hx-primary">
              Start free — Phase 1 forever
            </Link>
            <span className="gs-hx-hint">
              Scroll to fast-forward <span aria-hidden>↓</span>
            </span>
          </div>
          <p className="gs-hx-trust">
            Free forever&ensp;·&ensp;No subscription&ensp;·&ensp;14-day refund
          </p>
        </div>

        {/* ── Layer B · the playbook (full viewport, clipped to a card) ── */}
        <div ref={bookRef} className="gs-hx-book" aria-hidden>
          {/* Ghost phase numeral + paper grain so the fullscreen stretch
              never reads as a flat empty sheet */}
          <span ref={ghostRef} className="gs-hx-ghost">02</span>
          <span className="gs-hx-book-grain" />

          <div ref={chromeRef} className="gs-hx-chrome">
            <span ref={phaseRef} className="gs-hx-phase">{PHASE_2}</span>
            <span className="gs-hx-meter">
              <span className="gs-hx-bar">
                <span ref={barRef} className="gs-hx-bar-fill" />
              </span>
              <span ref={pctRef} className="gs-hx-pct">25%</span>
            </span>
          </div>

          <div ref={nowlineRef} className="gs-hx-nowline">
            <span>NOW</span>
          </div>

          <div ref={trackRef} className="gs-hx-track">
            {/* Card masthead — visible in the resting card, scrolls away
                with the journey */}
            <div className="gs-hx-minihead">
              <span className="gs-hx-minihead-dot" />
              Live playbook · tuned to your home country
            </div>
            {ROWS.map((r, i) => (
              <div key={r.n} className={`gs-hx-row${i < PRETICKED ? " is-done" : ""}${i === PRETICKED ? " is-current" : ""}`}>
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
          /* Was 460vh — a visitor had to scroll nearly 5 screens before
             reaching any real feature content (Document Vault, Mock
             Interview, Parent Share) below. Same three acts, same
             easing, just compressed so the payoff arrives sooner. */
          height: 340vh;
          background: var(--color-cream);
        }
        @media (max-width: 767px) { .gs-hx-runway { height: 260vh; } }

        .gs-hx-sticky {
          position: sticky; top: 0;
          /* 100vh on mobile Chrome/Android is measured against a
             viewport height that changes as the address bar hides/shows
             mid-scroll — mismatched from the actual visible area, which
             is exactly the class of bug already fixed in this file's JS
             (visualViewport.height). The box itself needs the same fix:
             dvh tracks the real visible viewport. Desktop Safari/Chrome
             has no address-bar resize, so this is a no-op there. */
          height: 100vh; height: 100dvh;
          overflow: hidden;
        }

        /* ── headline stack ── */
        .gs-hx-head {
          position: absolute; inset: 0 0 auto 0;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          /* Was clamp(96px, 13vh, 150px) — left a dead gap between the nav
             and the eyebrow line. Pulled the whole stack up so it sits
             closer to the pooled glow behind it instead of floating in
             empty cream. */
          padding: clamp(64px, 9vh, 108px) 24px 0;
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
          position: relative;
          background: linear-gradient(180deg, var(--color-persimmon-soft) 0%, var(--color-persimmon) 62%, var(--color-persimmon-deep) 100%);
          color: #FAF8F4;
          font-family: var(--font-sans-stack); font-size: 15px; font-weight: 600;
          padding: 16px 30px; border-radius: 999px; text-decoration: none;
          box-shadow:
            0 16px 36px -12px rgba(232,98,42,0.55),
            0 4px 10px -4px rgba(232,98,42,0.4),
            inset 0 1px 0 rgba(255,255,255,0.35);
          transition: transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out);
        }
        @media (hover: hover) {
          .gs-hx-primary:hover {
            transform: translateY(-2px);
            box-shadow:
              0 20px 44px -12px rgba(232,98,42,0.6),
              0 6px 14px -4px rgba(232,98,42,0.45),
              inset 0 1px 0 rgba(255,255,255,0.35);
          }
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
          /* Promote to its own compositor layer so the clip-path repaint
             doesn't drag the blurred glow layer behind it along with it —
             the single biggest win for mobile scroll smoothness here. */
          transform: translateZ(0);
          backface-visibility: hidden;
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

        .gs-hx-ghost {
          position: absolute; left: 2vw; top: 50%; z-index: 1;
          transform: translateY(-50%);
          font-family: var(--font-display-stack); font-style: italic;
          font-size: clamp(200px, 34vh, 380px); line-height: 1;
          color: var(--color-ink); opacity: 0.045;
          pointer-events: none; user-select: none;
          font-variant-numeric: tabular-nums;
        }
        .gs-hx-book-grain {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          opacity: 0.03;
          background-image:
            radial-gradient(circle at 25% 30%, rgba(28,25,23,0.5) 0.5px, transparent 1px),
            radial-gradient(circle at 75% 70%, rgba(28,25,23,0.4) 0.5px, transparent 1px);
          background-size: 4px 4px, 5px 5px;
        }
        html.dark .gs-hx-book-grain { opacity: 0.05; }

        .gs-hx-track {
          position: absolute; inset: 0; z-index: 2;
          padding-top: 66vh;
          will-change: transform;
        }
        .gs-hx-minihead {
          position: absolute; top: calc(66vh - 52px); left: 0; right: 0;
          max-width: 920px; margin: 0 auto;
          padding: 0 clamp(18px, 4vw, 48px);
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--color-persimmon); font-weight: 600;
        }
        .gs-hx-minihead-dot {
          width: 7px; height: 7px; border-radius: 999px;
          background: var(--color-persimmon);
          animation: gs-hx-pulse 1.8s var(--ease-in-out) infinite;
        }
        @keyframes gs-hx-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.55; }
        }
        .gs-hx-row {
          display: grid;
          grid-template-columns: 24px 76px 1fr auto;
          align-items: center; gap: 16px;
          height: ${ROW_H}px;
          max-width: 920px; margin: 0 auto;
          padding: 0 clamp(18px, 4vw, 48px);
          border-bottom: 1px solid var(--color-border-soft);
          font-family: var(--font-sans-stack); font-size: 15px;
          color: var(--color-ink);
          transition: background 250ms var(--ease-soft);
        }
        .gs-hx-row.is-current {
          background: rgba(232, 98, 42, 0.05);
        }
        .gs-hx-row.is-current .gs-hx-mark { border-color: var(--color-persimmon); }
        .gs-hx-step {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px; letter-spacing: 0.12em;
          color: var(--color-persimmon-deep); opacity: 0.75;
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
          background: radial-gradient(circle, rgba(245, 213, 144, 0.58) 0%, transparent 65%);
          opacity: 0.68;
        }
        .gs-hx-blob-b {
          width: 520px; height: 520px; right: -8%; top: 24%;
          background: radial-gradient(circle, rgba(232, 98, 42, 0.2) 0%, transparent 65%);
          opacity: 0.75;
        }
        /* Both blobs above sit near the page edges — neither actually
           pools behind the headline itself, which is why the top of the
           hero read as an empty cream void. This one sits centered right
           behind the eyebrow/headline stack. */
        .gs-hx-blob-c {
          width: 720px; height: 480px; left: 50%; top: -8%;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(245, 213, 144, 0.42) 0%, transparent 68%);
          opacity: 0.8;
        }
        html.dark .gs-hx-blob-a { opacity: 0.12; }
        html.dark .gs-hx-blob-b { opacity: 0.2; }
        html.dark .gs-hx-blob-c { opacity: 0.08; }
        .gs-hx-grain {
          position: absolute; inset: 0; opacity: 0.035;
          background-image:
            radial-gradient(circle at 25% 30%, rgba(28,25,23,0.5) 0.5px, transparent 1px),
            radial-gradient(circle at 75% 70%, rgba(28,25,23,0.4) 0.5px, transparent 1px);
          background-size: 4px 4px, 5px 5px;
        }
        html.dark .gs-hx-grain { opacity: 0.06; }
        /* filter: blur() is one of the costliest paints on mobile GPUs, and
           it sits directly under a layer whose clip-path repaints on every
           scroll frame — that combination is the main source of the mobile
           jank. Trade blur radius for size on phones; the gradient itself
           already tapers to transparent so the glow still reads softly. */
        @media (max-width: 767px) {
          .gs-hx-blob { filter: blur(20px); }
          .gs-hx-blob-a { width: 380px; height: 380px; }
          .gs-hx-blob-b { width: 340px; height: 340px; }
          .gs-hx-blob-c { width: 420px; height: 320px; }
          .gs-hx-grain { display: none; }
          .gs-hx-book-grain { display: none; }
        }

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
          /* Compact the headline stack so it clears the card preview that
             starts rising at ~62vh — previously the CTA/trust line could
             sit right at that boundary and read as crowded/cut off. */
          .gs-hx-head { padding: clamp(76px, 13vh, 108px) 20px 0; }
          /* The fixed nav pill sits at top:14px, height 64px (~78px total).
             At 0.42em letter-spacing the full-width eyebrow line overflowed
             past the viewport edge, right under the nav — tighten spacing
             and let it wrap instead of clipping. */
          .gs-hx-eyebrow {
            font-size: 10px; letter-spacing: 0.18em;
            white-space: normal; overflow-wrap: break-word;
          }
          .gs-hx-h1 { margin-top: 14px; font-size: clamp(34px, 9vw, 48px); }
          .gs-hx-sub { margin-top: 14px; font-size: 15px; line-height: 1.5; }
          .gs-hx-ctas { margin-top: 22px; gap: 12px; }
          .gs-hx-trust { margin-top: 16px; }
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
      <p className="gs-hx-eyebrow">F-1 · From 10 countries · One payment</p>
      <h1 className="gs-hx-h1">
        Every step from <em>home</em>
        <br />
        to your US visa.
      </h1>
      <p className="gs-hx-sub">
        The full F-1 route, sequenced for your home country — every form,
        fee, and interview between you and the stamp. AI document checks.
        Voice mock interviews. One workspace until your passport says yes.
      </p>
      <div className="gs-hx-ctas">
        <Link href="/sign-up" className="gs-hx-primary">
          Start free — Phase 1 forever
        </Link>
        <Link href="#playbook" className="gs-hx-hint" style={{ textDecoration: "none" }}>
          See the playbook <span aria-hidden>↓</span>
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
        /* Self-contained on purpose — HeroStatic can mount without the
           animated Hero() ever rendering (mobile widths, reduced-motion,
           no-JS), so it can't rely on that component's own <style> block
           for its base classes. Same class names as the runway version
           (.gs-hx-eyebrow, .gs-hx-row, .gs-hx-mark, etc.) so both stay
           visually consistent, but every rule those classes need lives
           here rather than being split across two components. */
        .gs-hxs {
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          padding: clamp(96px, 13vh, 150px) 24px 80px;
          background: var(--color-cream);
        }
        .gs-hxs .gs-hx-eyebrow, .gs-hxs .gs-hx-h1, .gs-hxs .gs-hx-sub,
        .gs-hxs .gs-hx-ctas { animation: none !important; }
        .gs-hx-eyebrow {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase;
          color: var(--color-persimmon); font-weight: 600;
        }
        .gs-hx-h1 {
          margin: 22px 0 0;
          font-family: var(--font-display-stack); font-weight: 400;
          font-size: clamp(46px, 7.4vw, 88px);
          line-height: 1.02; letter-spacing: -0.028em;
          color: var(--color-ink);
          text-wrap: balance;
        }
        .gs-hx-h1 em { font-style: italic; color: var(--color-persimmon); }
        .gs-hx-sub {
          margin: 20px auto 0; max-width: 560px;
          font-family: var(--font-sans-stack); font-size: 17px;
          line-height: 1.55; color: var(--color-ink-soft);
        }
        .gs-hx-ctas {
          margin-top: 32px; display: flex; flex-direction: column;
          align-items: center; gap: 14px;
        }
        .gs-hx-primary {
          position: relative;
          background: linear-gradient(180deg, var(--color-persimmon-soft) 0%, var(--color-persimmon) 62%, var(--color-persimmon-deep) 100%);
          color: #FAF8F4;
          font-family: var(--font-sans-stack); font-size: 15px; font-weight: 600;
          padding: 16px 30px; border-radius: 999px; text-decoration: none;
          box-shadow:
            0 16px 36px -12px rgba(232,98,42,0.55),
            0 4px 10px -4px rgba(232,98,42,0.4),
            inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .gs-hx-hint {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--color-muted);
        }
        .gs-hxs-card {
          margin-top: 56px; width: 100%; max-width: 760px;
          border: 1px solid var(--color-border-soft); border-radius: 20px;
          background: var(--color-cream-soft); overflow: hidden;
          text-align: left;
        }
        .gs-hxs-card .gs-hx-row:last-child { border-bottom: none; }
        .gs-hx-row {
          display: grid;
          grid-template-columns: 24px 76px 1fr auto;
          align-items: center; gap: 16px;
          height: ${ROW_H}px;
          padding: 0 clamp(18px, 4vw, 48px);
          border-bottom: 1px solid var(--color-border-soft);
          font-family: var(--font-sans-stack); font-size: 15px;
          color: var(--color-ink);
        }
        .gs-hx-step {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px; letter-spacing: 0.12em;
          color: var(--color-persimmon-deep); opacity: 0.75;
        }
        .gs-hx-label { letter-spacing: -0.003em; }
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
        }
        .gs-hx-mark svg { width: 10px; height: 10px; }
        .gs-hx-row.is-done .gs-hx-mark {
          background: var(--color-persimmon);
          border-color: var(--color-persimmon);
          color: #FAF8F4;
        }
        .gs-hx-row.is-done .gs-hx-label { color: var(--color-ink-soft); }

        @media (max-width: 767px) {
          .gs-hxs { padding: clamp(76px, 13vh, 108px) 20px 56px; }
          .gs-hx-eyebrow {
            font-size: 10px; letter-spacing: 0.18em;
            white-space: normal; overflow-wrap: break-word;
          }
          .gs-hx-h1 { margin-top: 14px; font-size: clamp(34px, 9vw, 48px); }
          .gs-hx-sub { margin-top: 14px; font-size: 15px; line-height: 1.5; }
          .gs-hx-ctas { margin-top: 22px; gap: 12px; }
          .gs-hx-row { grid-template-columns: 20px 58px 1fr auto; gap: 10px; font-size: 13px; }
        }
      `}</style>
    </section>
  );
}
