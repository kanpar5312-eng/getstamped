"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════════════
   Hero — cinematic full-bleed stage.

   One dominant idea per fold: the dark passport film (/new.mp4 — ink
   black with a warm persimmon light beam, 1.9 MB, muted/looped) fills
   the viewport; a two-line Instrument Serif headline rises out of it
   line-by-line through overflow masks; an "F-1 · APPROVED" stamp
   presses over the corner of the last word like a real consulate
   stamp. That stamp is the brand (GetStamped) in one gesture.

   Deliberate choices:
   • No scroll pinning, no runway. Scroll releases the page immediately
     with only a soft parallax fade (single rAF listener, transform +
     opacity only).
   • The fixed dark chrome header finally sits on a surface that makes
     sense — the whole first fold is one dark composition.
   • Mobile is the same composition, not a cut-down: 100svh, centered
     column, stacked CTAs.
   • prefers-reduced-motion: entrances removed (everything visible),
     parallax off, film paused on its poster frame.
   ═════════════════════════════════════════════════════════════════════════ */

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Ambient film counts as motion — hold the poster frame.
      videoRef.current?.pause();
      return;
    }

    /* Parallax release — the stage recedes as the page scrolls on.
       One passive listener, rAF-throttled, transform/opacity only. */
    const root = rootRef.current;
    const video = videoRef.current;
    const content = contentRef.current;
    if (!root || !content) return;
    let ticking = false;
    const frame = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (y > vh * 1.2) return; // past the fold — nothing to update
      const p = Math.min(1, y / (vh * 0.85));
      content.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0)`;
      content.style.opacity = (1 - p * p).toFixed(3);
      if (video) video.style.transform = `translate3d(0, ${(y * 0.1).toFixed(1)}px, 0) scale(1.02)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={rootRef} aria-label="Hero" className="gs-h5">
      {/* The film */}
      <video
        ref={videoRef}
        className="gs-h5-film"
        src="/new.mp4"
        poster="/pass.png"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
      />
      {/* Scrim — guarantees text contrast whatever frame is playing */}
      <div className="gs-h5-scrim" aria-hidden />

      {/* The composition */}
      <div ref={contentRef} className="gs-h5-content">
        <p className="gs-h5-kicker">F-1 · From 10 countries · One payment</p>

        <h1 className="gs-h5-h1">
          <span className="gs-h5-mask">
            <span className="gs-h5-line gs-h5-line-1">Every step from home</span>
          </span>
          <span className="gs-h5-mask">
            <span className="gs-h5-line gs-h5-line-2">
              to your <em>US visa.</em>
              {/* The stamp — pressed over the corner of the last word */}
              <span className="gs-h5-stamp" aria-hidden>
                <span className="gs-h5-stamp-in">
                  <span className="gs-h5-stamp-top">F-1</span>
                  <span className="gs-h5-stamp-mid">APPROVED</span>
                  <span className="gs-h5-stamp-bot">GETSTAMPED</span>
                </span>
              </span>
            </span>
          </span>
        </h1>

        <p className="gs-h5-sub">
          The full route, sequenced for your home country — every form, fee,
          document, and interview between you and the stamp.
        </p>

        <div className="gs-h5-ctas">
          <Link href="/sign-up" className="gs-h5-primary">
            Start free — Phase 1 forever
          </Link>
          <Link href="#playbook" className="gs-h5-ghost">
            See how it works
          </Link>
        </div>

        <p className="gs-h5-trust">No subscription · 14-day refund</p>
      </div>

      {/* Scroll cue */}
      <div className="gs-h5-cue" aria-hidden>
        <span />
      </div>

      <style>{`
        /* Full-bleed stage relies on nothing being containment-skipped. */
        .v3-root main > .gs-h5 { content-visibility: visible; }

        .gs-h5 {
          position: relative;
          height: 100svh;
          min-height: 620px;
          overflow: hidden;
          background: #0A0908;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gs-h5-film {
          position: absolute;
          inset: -2% 0;
          width: 100%;
          height: 104%;
          object-fit: cover;
          opacity: 0;
          animation: gs-h5-film-in 1600ms cubic-bezier(0.22, 1, 0.36, 1) 100ms forwards;
          will-change: transform, opacity;
        }
        @keyframes gs-h5-film-in { to { opacity: 1; } }

        .gs-h5-scrim {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(120% 90% at 50% 42%, rgba(10, 9, 8, 0) 0%, rgba(10, 9, 8, 0.62) 100%),
            linear-gradient(180deg, rgba(10, 9, 8, 0.42) 0%, rgba(10, 9, 8, 0.12) 34%, rgba(10, 9, 8, 0.14) 66%, rgba(10, 9, 8, 0.66) 100%);
        }

        .gs-h5-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 24px;
          max-width: 1080px;
          will-change: transform, opacity;
        }

        .gs-h5-kicker {
          margin: 0 0 clamp(18px, 3vh, 28px);
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: #FF9E78;
          opacity: 0;
          animation: gs-h5-up 800ms cubic-bezier(0.22, 1, 0.36, 1) 350ms both;
        }

        .gs-h5-h1 {
          margin: 0;
          font-family: var(--font-display-stack);
          font-weight: 400;
          font-size: clamp(44px, 8.6vw, 92px);
          line-height: 1.04;
          letter-spacing: -0.025em;
          color: #F5F1E8;
          text-wrap: balance;
        }
        .gs-h5-h1 em {
          font-style: italic;
          color: #FF9E78;
        }
        /* Masked line-rise: each line lifts out of an overflow-hidden strip */
        .gs-h5-mask {
          display: block;
          overflow: hidden;
          padding-bottom: 0.08em; /* keep serif descenders unclipped */
          margin-bottom: -0.08em;
        }
        .gs-h5-line {
          display: inline-block;
          position: relative;
          transform: translateY(112%);
          animation: gs-h5-rise 1000ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .gs-h5-line-1 { animation-delay: 480ms; }
        .gs-h5-line-2 { animation-delay: 620ms; }
        @keyframes gs-h5-rise { to { transform: translateY(0); } }
        @keyframes gs-h5-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* The stamp — a consulate press over the corner of "visa." */
        .gs-h5-stamp {
          position: absolute;
          right: -0.55em;
          top: -0.52em;
          width: 1.52em;
          height: 1.52em;
          pointer-events: none;
          opacity: 0;
          transform: scale(1.6) rotate(4deg);
          animation: gs-h5-press 650ms cubic-bezier(0.19, 1, 0.22, 1) 1500ms both;
        }
        @keyframes gs-h5-press {
          to { opacity: 1; transform: scale(1) rotate(-12deg); }
        }
        .gs-h5-stamp-in {
          position: absolute;
          inset: 0;
          border: 2.5px solid rgba(255, 91, 46, 0.85);
          border-radius: 999px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.08em;
          box-shadow: inset 0 0 0 1.5px rgba(10, 9, 8, 0.25), inset 0 0 0.6em rgba(255, 91, 46, 0.14);
          /* worn ink — a real stamp never prints evenly */
          -webkit-mask-image: radial-gradient(135% 135% at 46% 54%, #000 58%, rgba(0,0,0,0.78) 82%, rgba(0,0,0,0.95) 100%);
                  mask-image: radial-gradient(135% 135% at 46% 54%, #000 58%, rgba(0,0,0,0.78) 82%, rgba(0,0,0,0.95) 100%);
        }
        .gs-h5-stamp-top, .gs-h5-stamp-bot {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 0.085em;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-indent: 0.3em; /* optically re-center tracked caps */
          color: rgba(255, 91, 46, 0.9);
          line-height: 1;
        }
        .gs-h5-stamp-mid {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 0.135em;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-indent: 0.22em;
          color: rgba(255, 91, 46, 0.95);
          line-height: 1;
          border-top: 1px solid rgba(255, 91, 46, 0.5);
          border-bottom: 1px solid rgba(255, 91, 46, 0.5);
          padding: 0.16em 0;
        }

        .gs-h5-sub {
          margin: clamp(20px, 3.4vh, 30px) auto 0;
          max-width: 52ch;
          font-family: var(--font-sans-stack);
          font-size: clamp(15px, 1.9vw, 17.5px);
          line-height: 1.6;
          color: rgba(245, 241, 232, 0.86);
          text-wrap: pretty;
          opacity: 0;
          animation: gs-h5-up 800ms cubic-bezier(0.22, 1, 0.36, 1) 950ms both;
        }

        .gs-h5-ctas {
          margin-top: clamp(26px, 4.4vh, 38px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          opacity: 0;
          animation: gs-h5-up 800ms cubic-bezier(0.22, 1, 0.36, 1) 1100ms both;
        }
        .gs-h5-primary {
          background: var(--color-persimmon, #E8622A);
          color: #FAF8F4;
          font-family: var(--font-sans-stack);
          font-size: 15px;
          font-weight: 600;
          padding: 17px 32px;
          border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 1px 0 rgba(255,255,255,0.22) inset, 0 14px 38px -12px rgba(232, 98, 42, 0.65);
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), background 200ms ease;
        }
        @media (hover: hover) {
          .gs-h5-primary:hover { transform: translateY(-2px); background: #F07040; }
        }
        .gs-h5-primary:active { transform: translateY(0) scale(0.98); }
        .gs-h5-ghost {
          font-family: var(--font-sans-stack);
          font-size: 15px;
          font-weight: 500;
          color: #F5F1E8;
          text-decoration: none;
          padding: 16px 26px;
          border-radius: 999px;
          border: 1px solid rgba(245, 241, 232, 0.32);
          transition: border-color 200ms ease, background 200ms ease;
        }
        @media (hover: hover) {
          .gs-h5-ghost:hover { border-color: rgba(245, 241, 232, 0.7); background: rgba(245, 241, 232, 0.06); }
        }

        .gs-h5-trust {
          margin: clamp(16px, 2.6vh, 22px) 0 0;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245, 241, 232, 0.6);
          opacity: 0;
          animation: gs-h5-up 800ms cubic-bezier(0.22, 1, 0.36, 1) 1250ms both;
        }

        .gs-h5-cue {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 42px;
          background: rgba(245, 241, 232, 0.18);
          overflow: hidden;
          opacity: 0;
          animation: gs-h5-film-in 800ms ease 1800ms forwards;
        }
        .gs-h5-cue span {
          position: absolute;
          left: 0;
          top: -10px;
          width: 1px;
          height: 10px;
          background: #FF9E78;
          animation: gs-h5-cue-run 2s cubic-bezier(0.4, 0, 0.2, 1) 2s infinite;
        }
        @keyframes gs-h5-cue-run {
          0%   { transform: translateY(0); opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(52px); opacity: 0; }
        }

        @media (max-width: 640px) {
          .gs-h5 { min-height: 560px; }
          .gs-h5-h1 { font-size: clamp(40px, 11.5vw, 54px); }
          .gs-h5-stamp { right: -0.35em; top: -0.62em; width: 1.42em; height: 1.42em; }
          .gs-h5-ctas { flex-direction: column; width: 100%; }
          .gs-h5-primary, .gs-h5-ghost {
            width: 100%;
            max-width: 340px;
            text-align: center;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gs-h5-film,
          .gs-h5-kicker,
          .gs-h5-line,
          .gs-h5-stamp,
          .gs-h5-sub,
          .gs-h5-ctas,
          .gs-h5-trust,
          .gs-h5-cue {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .gs-h5-stamp { transform: rotate(-12deg) !important; }
          .gs-h5-cue span { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </section>
  );
}
