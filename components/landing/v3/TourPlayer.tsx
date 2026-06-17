"use client";

/**
 * TourPlayer — 60-second playable explainer rendered live.
 *
 * Six scenes, ~10s each. Each scene mounts its own CSS-driven mock so the
 * whole thing is a single React tree, no MP4. Web Audio API renders an
 * ambient pad + soft per-scene "chimes" so it feels like a finished film
 * without shipping any audio files.
 *
 * Autoplay-policy compliant: AudioContext is created inside the user's
 * click on the open button (passed down via `wasUserActivated`). Sound
 * defaults to ON; a muted icon toggles it. `prefers-reduced-motion`
 * collapses each scene to its end state and keeps the pad off.
 *
 * The visuals deliberately *hint at* the real product — Vault, Mock,
 * Parent View — without revealing screenshots of the actual dashboard.
 */

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SCENES = [
  { id: "intro",  durationMs: 8000  },
  { id: "steps",  durationMs: 10000 },
  { id: "docs",   durationMs: 11000 },
  { id: "mock",   durationMs: 11000 },
  { id: "parent", durationMs: 10000 },
  { id: "closer", durationMs: 10000 },
] as const;

type SceneId = (typeof SCENES)[number]["id"];

const TOTAL_MS = SCENES.reduce((a, s) => a + s.durationMs, 0); // 60_000

export function TourPlayer({ open, onClose }: Props) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [progress, setProgress] = useState(0);    // 0..1 across full tour
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  // RAF scheduler — tracks elapsed time across the whole tour.
  const startedAt = useRef<number | null>(null);
  const offsetAt = useRef<number>(0);             // accumulated elapsed when paused
  const rafId = useRef<number>(0);
  const closedAt = useRef<boolean>(false);

  /* ── Audio ────────────────────────────────────────────────────────── */
  type AudioRefs = {
    ctx: AudioContext;
    pad: GainNode;
    master: GainNode;
  };
  const audio = useRef<AudioRefs | null>(null);

  // Create / tear down audio on open
  useEffect(() => {
    if (!open) {
      teardownAudio();
      return;
    }
    bootAudio();
    return teardownAudio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Respond to mute toggle
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.master.gain.cancelScheduledValues(a.ctx.currentTime);
    a.master.gain.linearRampToValueAtTime(muted ? 0 : 1, a.ctx.currentTime + 0.18);
  }, [muted]);

  function bootAudio() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();

      const master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);

      // Ambient pad: two detuned sines, slow LFO on amplitude
      const pad = ctx.createGain();
      pad.gain.value = 0.0;
      pad.connect(master);

      const o1 = ctx.createOscillator();
      o1.type = "sine"; o1.frequency.value = 110;
      const o2 = ctx.createOscillator();
      o2.type = "sine"; o2.frequency.value = 110 * 1.5; // perfect 5th
      o2.detune.value = -6;
      o1.connect(pad); o2.connect(pad);
      o1.start(); o2.start();

      // LFO on pad gain — slow breathing
      const lfo = ctx.createOscillator();
      lfo.type = "sine"; lfo.frequency.value = 0.10;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.022;
      lfo.connect(lfoGain).connect(pad.gain);
      lfo.start();

      // Ramp pad in
      pad.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);

      audio.current = { ctx, pad, master };
    } catch {
      audio.current = null;
    }
  }

  function teardownAudio() {
    const a = audio.current;
    if (!a) return;
    try {
      a.master.gain.cancelScheduledValues(a.ctx.currentTime);
      a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.4);
      window.setTimeout(() => { a.ctx.close().catch(() => {}); }, 500);
    } catch {}
    audio.current = null;
  }

  function chime(freq: number, durationS = 1.2, gainPeak = 0.10) {
    const a = audio.current;
    if (!a || muted) return;
    const ctx = a.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(gainPeak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durationS);
    osc.connect(g).connect(a.master);
    osc.start(now);
    osc.stop(now + durationS + 0.05);
  }

  /* ── Scene engine ─────────────────────────────────────────────────── */
  // Returns scene index given elapsed ms
  function sceneAt(elapsed: number): number {
    let t = 0;
    for (let i = 0; i < SCENES.length; i++) {
      t += SCENES[i].durationMs;
      if (elapsed < t) return i;
    }
    return SCENES.length - 1;
  }

  useEffect(() => {
    if (!open || paused) return;

    closedAt.current = false;
    if (startedAt.current == null) startedAt.current = performance.now() - offsetAt.current;

    const tick = (now: number) => {
      if (closedAt.current) return;
      const elapsed = Math.min(TOTAL_MS, now - (startedAt.current ?? now));
      const p = elapsed / TOTAL_MS;
      setProgress(p);
      const newScene = sceneAt(elapsed);
      setSceneIdx((prev) => {
        if (newScene !== prev) {
          // Per-scene chime — gentle tonal nudge as the camera cuts.
          const tones = [330, 392, 440, 494, 392, 523];
          chime(tones[newScene] ?? 392, 1.4, 0.08);
        }
        return newScene;
      });
      if (elapsed >= TOTAL_MS) {
        // Hold on closer for ~600ms, then close.
        window.setTimeout(() => { if (!closedAt.current) onClose(); }, 600);
        return;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      // Record where we were so resume is seamless.
      offsetAt.current = performance.now() - (startedAt.current ?? performance.now());
    };
  }, [open, paused, onClose, muted]);

  // Reset state when the modal opens fresh
  useEffect(() => {
    if (open) {
      startedAt.current = null;
      offsetAt.current = 0;
      setSceneIdx(0);
      setProgress(0);
      setPaused(false);
      // First chime at scene 1 start
      window.setTimeout(() => chime(330, 1.6, 0.10), 60);
    } else {
      closedAt.current = true;
      cancelAnimationFrame(rafId.current);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " || e.key === "k") { e.preventDefault(); setPaused((p) => !p); }
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const scene = SCENES[sceneIdx].id;
  const num = String(sceneIdx + 1).padStart(2, "0");

  return (
    <div className="tp-root" role="dialog" aria-modal="true" aria-label="GetStamped 60-second tour">
      <div className="tp-stage">
        <header className="tp-hud">
          <span className="tp-count">{num} <span className="tp-count-dim">/ 06</span></span>
          <span className="tp-title">GetStamped — a 60-second tour</span>
          <div className="tp-controls">
            <button className="tp-icon" aria-label={paused ? "Play" : "Pause"} onClick={() => setPaused((p) => !p)}>
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
            <button className="tp-icon" aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)}>
              {muted ? <MutedIcon /> : <SoundIcon />}
            </button>
            <button className="tp-icon" aria-label="Close tour" onClick={onClose}><CloseIcon /></button>
          </div>
        </header>

        <div className="tp-scene" key={scene}>
          {scene === "intro"  && <SceneIntro />}
          {scene === "steps"  && <SceneSteps />}
          {scene === "docs"   && <SceneDocs />}
          {scene === "mock"   && <SceneMock />}
          {scene === "parent" && <SceneParent />}
          {scene === "closer" && <SceneCloser />}
        </div>

        <footer className="tp-foot">
          <div className="tp-bar" aria-hidden>
            <span className="tp-bar-fill" style={{ width: `${(progress * 100).toFixed(2)}%` }} />
          </div>
          <span className="tp-time">{formatT(progress * TOTAL_MS)} / 1:00</span>
        </footer>
      </div>

      <style>{`
        .tp-root {
          position: fixed; inset: 0; z-index: 110;
          background: #0e0d0c;
          display: flex; align-items: stretch; justify-content: stretch;
          opacity: 1;                  /* visible by default */
          animation: tp-in 320ms var(--ease-out) backwards;
          font-family: var(--font-sans-stack);
          color: var(--color-paper-soft);
        }
        @keyframes tp-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        .tp-stage {
          position: relative; width: 100%; height: 100%;
          display: grid; grid-template-rows: auto 1fr auto;
          background:
            radial-gradient(60% 50% at 50% 0%, rgba(255,91,46,0.08) 0%, transparent 60%),
            radial-gradient(40% 40% at 50% 100%, rgba(255,228,216,0.04) 0%, transparent 60%),
            #0e0d0c;
        }

        /* ── HUD ───────────────────────────────────────────────── */
        .tp-hud {
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center; gap: 16px;
          padding: 18px 24px;
          font-family: var(--font-mono-stack);
        }
        .tp-count { font-size: 12px; letter-spacing: 0.18em; color: var(--color-persimmon); font-weight: 600; }
        .tp-count-dim { color: rgba(255,255,255,0.4); }
        .tp-title {
          font-family: var(--font-display-stack); font-style: italic;
          font-size: 14px; color: rgba(255,255,255,0.6); letter-spacing: 0;
          text-align: center;
        }
        .tp-controls { display: inline-flex; gap: 6px; justify-content: flex-end; }
        .tp-icon {
          all: unset; cursor: pointer;
          width: 32px; height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.75);
          border-radius: 999px;
          transition: background-color 200ms var(--ease-soft), color 200ms var(--ease-soft);
        }
        .tp-icon:hover { background: rgba(255,255,255,0.08); color: var(--color-paper-soft); }
        .tp-icon:active { transform: scale(0.92); }

        /* ── Scene container ──────────────────────────────────── */
        .tp-scene {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          min-height: 380px;          /* defensive: never collapse the row */
          opacity: 1;                 /* visible by default; animation enhances */
          animation: tp-scene-in 540ms var(--ease-out) forwards;
        }
        @keyframes tp-scene-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.992); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0)   scale(1);     filter: blur(0); }
        }

        /* ── Footer / progress ─────────────────────────────────── */
        .tp-foot {
          display: grid; grid-template-columns: 1fr auto;
          align-items: center; gap: 16px;
          padding: 14px 24px 18px;
        }
        .tp-bar {
          height: 2px; background: rgba(255,255,255,0.12); border-radius: 999px; overflow: hidden;
        }
        .tp-bar-fill {
          display: block; height: 100%; background: var(--color-persimmon);
          transition: width 80ms linear;
        }
        .tp-time {
          font-family: var(--font-mono-stack); font-size: 11px;
          letter-spacing: 0.06em; color: rgba(255,255,255,0.5);
        }

        /* ── Shared scene typography ───────────────────────────── */
        .tp-eyebrow {
          font-family: var(--font-mono-stack);
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--color-persimmon);
        }
        .tp-head {
          font-family: var(--font-display-stack); font-weight: 400;
          font-size: clamp(34px, 5vw, 60px); line-height: 1.05;
          letter-spacing: -0.02em; color: var(--color-paper-soft);
          max-width: 22ch; text-wrap: balance;
        }
        .tp-sub {
          font-size: 15px; line-height: 1.55; color: rgba(255,255,255,0.7);
          max-width: 48ch; margin-top: 14px;
        }
        .tp-italic { font-style: italic; }
        .tp-persimmon { color: var(--color-persimmon); }

        /* ── Scene 1 — Intro ───────────────────────────────────── */
        .sc-intro { text-align: center; }
        .sc-intro .tp-head {
          font-size: clamp(48px, 8vw, 96px); max-width: 18ch;
          margin: 0 auto;
        }
        .sc-intro-line { display: block; overflow: hidden; }
        .sc-intro-word {
          display: inline-block;
          opacity: 1;                   /* visible by default — animation is enhancement */
          animation: tp-line-up 900ms var(--ease-out) forwards;
          padding: 0 0.12em;
        }
        .sc-intro .sc-intro-line:nth-child(2) .sc-intro-word { animation-delay: 700ms; }
        @keyframes tp-line-up {
          0%   { transform: translateY(110%); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        .sc-intro-tag {
          margin-top: 28px; font-family: var(--font-mono-stack);
          font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          opacity: 1;
          animation: tp-fade-in 700ms var(--ease-out) 1700ms forwards;
        }
        @keyframes tp-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }

        /* ── Scene 2 — Steps ───────────────────────────────────── */
        .sc-steps {
          display: grid; grid-template-columns: 1fr 1.1fr; gap: 56px;
          max-width: 1100px; width: 100%;
        }
        @media (max-width: 880px) { .sc-steps { grid-template-columns: 1fr; gap: 28px; } }
        .sc-steps-rails { display: flex; flex-direction: column; gap: 14px; }
        .sc-rail {
          display: grid; grid-template-columns: auto 1fr auto; gap: 18px;
          align-items: center;
          padding: 14px 4px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .sc-rail-num {
          font-family: var(--font-mono-stack); font-size: 11px;
          letter-spacing: 0.16em; color: var(--color-persimmon);
        }
        .sc-rail-name {
          font-family: var(--font-display-stack); font-size: 22px;
          color: var(--color-paper-soft);
        }
        .sc-rail-meta {
          font-family: var(--font-mono-stack); font-size: 11px;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.45);
        }
        .sc-rail-bar {
          grid-column: 1 / -1;
          height: 1px; background: var(--color-persimmon);
          margin-top: 8px;
          transform-origin: left center;
          transform: scaleX(1);                 /* visible by default */
          animation: tp-bar-in 800ms var(--ease-out) forwards;
        }
        @keyframes tp-bar-in {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        /* ── Scene 3 — Docs ────────────────────────────────────── */
        .sc-docs {
          display: grid; grid-template-columns: 1fr 1fr; gap: 56px;
          max-width: 1100px; width: 100%; align-items: center;
        }
        @media (max-width: 880px) { .sc-docs { grid-template-columns: 1fr; gap: 28px; } }
        .sc-docs-rows {
          display: flex; flex-direction: column; gap: 10px;
        }
        .sc-doc-row {
          position: relative; overflow: hidden;
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          font-size: 14px; color: rgba(255,255,255,0.85);
        }
        .sc-doc-name { font-weight: 500; }
        .sc-doc-pill {
          font-family: var(--font-mono-stack); font-size: 11px;
          padding: 4px 10px; border-radius: 999px;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sc-doc-busy { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.55); }
        .sc-doc-ok   { background: rgba(95, 200, 130, 0.18); color: #B7F0CC; }
        .sc-doc-scan {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,91,46,0.22) 50%, transparent 100%);
          clip-path: inset(0 100% 0 0);
          animation: tp-scan 2.6s var(--ease-in-out) infinite;
        }
        @keyframes tp-scan {
          0%   { clip-path: inset(0 100% 0 0); }
          50%  { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 0 0 100%); }
        }
        /* DocRow flipping is handled by React state (see component) — these
           classes simply tag the rows for the pill-fade selector below. */
        .sc-doc-pill-busy-1, .sc-doc-pill-busy-2, .sc-doc-pill-busy-3 {
          opacity: 1; transition: opacity 320ms var(--ease-out);
        }
        .sc-doc-pill-ok-1, .sc-doc-pill-ok-2, .sc-doc-pill-ok-3 {
          opacity: 0; position: absolute; right: 18px; transition: opacity 320ms var(--ease-out);
        }
        .sc-doc-flip-1.flipped .sc-doc-pill-busy-1,
        .sc-doc-flip-2.flipped .sc-doc-pill-busy-2,
        .sc-doc-flip-3.flipped .sc-doc-pill-busy-3 { opacity: 0; }
        .sc-doc-flip-1.flipped .sc-doc-pill-ok-1,
        .sc-doc-flip-2.flipped .sc-doc-pill-ok-2,
        .sc-doc-flip-3.flipped .sc-doc-pill-ok-3 { opacity: 1; }

        /* ── Scene 4 — Mock ────────────────────────────────────── */
        .sc-mock {
          display: grid; grid-template-columns: 1fr 1fr; gap: 56px;
          max-width: 1100px; width: 100%; align-items: center;
        }
        @media (max-width: 880px) { .sc-mock { grid-template-columns: 1fr; gap: 28px; } }
        .sc-mock-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 22px;
        }
        .sc-mock-q {
          font-family: var(--font-display-stack); font-style: italic;
          font-size: clamp(22px, 2.2vw, 28px); line-height: 1.3;
          color: var(--color-paper-soft);
          clip-path: inset(0 0 0 0);          /* visible by default */
          animation: tp-type 3.4s steps(54, end) forwards;
        }
        @keyframes tp-type {
          0%   { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0    0 0); }
        }
        .sc-mic { display: flex; gap: 4px; align-items: end; height: 38px; margin-top: 18px; }
        .sc-mic span {
          display: block; width: 4px; background: var(--color-persimmon); border-radius: 2px;
          height: 6px; animation: tp-mic 1.1s var(--ease-in-out) infinite;
        }
        @keyframes tp-mic { 0%,100% { height: 6px; } 50% { height: 32px; } }
        .sc-scores {
          margin-top: 12px;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
        }
        .sc-score {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
        }
        .sc-score-label { font-size: 12px; color: rgba(255,255,255,0.6); }
        .sc-score-val {
          font-family: var(--font-mono-stack); font-size: 18px; font-weight: 600;
          color: var(--color-paper-soft);
        }

        /* ── Scene 5 — Parent ──────────────────────────────────── */
        .sc-parent {
          display: grid; grid-template-columns: 1fr 1fr; gap: 56px;
          max-width: 1100px; width: 100%; align-items: center;
        }
        @media (max-width: 880px) { .sc-parent { grid-template-columns: 1fr; gap: 28px; } }
        .sc-phone-wrap { display: flex; justify-content: center; }
        .sc-phone {
          width: 280px; aspect-ratio: 9 / 18.5;
          background: #1a1918;
          border-radius: 36px; padding: 10px; position: relative;
          box-shadow: 0 30px 60px -30px rgba(0,0,0,0.6);
        }
        .sc-phone-notch {
          position: absolute; left: 50%; top: 10px; transform: translateX(-50%);
          width: 92px; height: 22px; background: #1a1918;
          border-radius: 0 0 14px 14px; z-index: 2;
        }
        .sc-phone-screen {
          width: 100%; height: 100%; background: var(--color-paper);
          border-radius: 26px; padding: 48px 18px 18px;
          display: flex; flex-direction: column; gap: 12px;
          color: var(--color-ink);
        }
        .sc-phone-eye { font-family: var(--font-mono-stack); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-muted); }
        .sc-phone-h { font-family: var(--font-display-stack); font-size: 18px; }
        .sc-phone-bar { height: 4px; background: var(--color-paper-deep); border-radius: 999px; overflow: hidden; }
        .sc-phone-bar > span {
          display: block; height: 100%; width: 63%;       /* visible by default */
          background: var(--color-persimmon);
          animation: tp-parent-prog 4s var(--ease-out) forwards;
        }
        @keyframes tp-parent-prog {
          0%   { width: 0%; }
          100% { width: 63%; }
        }
        .sc-phone-meta { font-family: var(--font-mono-stack); font-size: 10.5px; color: var(--color-muted); }
        .sc-phone-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .sc-phone-chip {
          font-family: var(--font-mono-stack); font-size: 10.5px;
          background: var(--color-paper-soft); border: 1px solid var(--color-border);
          padding: 5px 9px; border-radius: 999px;
          opacity: 1;                            /* visible by default */
          animation: tp-fade-in 360ms var(--ease-out) backwards;
        }
        .sc-phone-foot {
          margin-top: auto; display: flex; gap: 8px; align-items: center;
          font-family: var(--font-mono-stack); font-size: 10.5px; color: var(--color-ink-soft);
        }
        .sc-phone-dot {
          width: 8px; height: 8px; border-radius: 999px;
          background: var(--color-persimmon);
          box-shadow: 0 0 0 0 var(--color-persimmon);
          animation: tp-pulse 1.8s var(--ease-out) infinite;
        }
        @keyframes tp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,91,46,0.55); }
          100% { box-shadow: 0 0 0 10px rgba(255,91,46,0); }
        }

        /* ── Scene 6 — Closer ──────────────────────────────────── */
        .sc-closer { text-align: center; max-width: 920px; width: 100%; }
        .sc-closer .tp-head {
          font-size: clamp(48px, 7vw, 84px); margin: 0 auto;
        }
        .sc-closer-img {
          margin: 28px auto 0; max-width: 540px;
          opacity: 1;                            /* visible by default */
          animation: tp-img-in 1400ms var(--ease-out) 200ms backwards,
                     tp-img-float 6s ease-in-out 1600ms infinite;
        }
        @keyframes tp-img-in {
          0%   { opacity: 0;    transform: translateY(8px); }
          100% { opacity: 0.95; transform: translateY(0); }
        }
        @keyframes tp-img-float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-6px); }
        }
        .sc-closer-img svg { width: 100%; height: auto; }
        .sc-closer-cta {
          margin-top: 24px;
          font-family: var(--font-mono-stack); font-size: 12px; letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          opacity: 1;
          animation: tp-fade-in 700ms var(--ease-out) 1000ms backwards;
        }

        /* ── Reduced motion ────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .sc-intro-word, .sc-rail-bar, .sc-mock-q,
          .sc-phone-chip, .sc-doc-scan,
          .sc-closer-img, .sc-closer-cta, .sc-mic span, .sc-phone-dot {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            clip-path: inset(0 0 0 0) !important;
          }
          .sc-phone-bar > span {
            animation: none !important; width: 63% !important;
          }
          .tp-scene { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────── Scenes ─────────────────────────── */

function SceneIntro() {
  return (
    <section className="sc-intro">
      <h2 className="tp-head">
        <span className="sc-intro-line">
          <span className="sc-intro-word">The F-1 visa,</span>
        </span>
        <span className="sc-intro-line">
          <span className="sc-intro-word tp-italic tp-persimmon">end to end.</span>
        </span>
      </h2>
      <p className="sc-intro-tag">A 60-second tour</p>
    </section>
  );
}

const PHASES = [
  { num: "01", name: "Before your I-20",    meta: "STEPS 01–06 · ~6 WEEKS" },
  { num: "02", name: "After I-20 arrival",  meta: "STEPS 07–17 · ~3 WEEKS" },
  { num: "03", name: "DS-160 and fees",     meta: "STEPS 18–28 · ~2 WEEKS" },
  { num: "04", name: "Interview prep",      meta: "STEPS 29–40 · ~2 WEEKS" },
  { num: "05", name: "Post-approval",       meta: "STEPS 41–47 · ~1 WEEK"  },
];

function SceneSteps() {
  return (
    <section className="sc-steps">
      <div>
        <p className="tp-eyebrow">The playbook</p>
        <h2 className="tp-head" style={{ marginTop: 14 }}>
          Forty-seven steps. <span className="tp-italic tp-persimmon">Ordered.</span>
        </h2>
        <p className="tp-sub">
          Five phases, each with its own deadlines, evidence, and explanation
          for why it matters.
        </p>
      </div>
      <ol className="sc-steps-rails">
        {PHASES.map((p, i) => (
          <li key={p.num} className="sc-rail">
            <span className="sc-rail-num">PHASE {p.num}</span>
            <span className="sc-rail-name">{p.name}</span>
            <span className="sc-rail-meta">{p.meta}</span>
            <span className="sc-rail-bar" style={{ animationDelay: `${300 + i * 200}ms` }} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function SceneDocs() {
  // Flip each row from "Checking…" → "Checked ✓" on a stagger.
  return (
    <section className="sc-docs">
      <div>
        <p className="tp-eyebrow">Document Vault</p>
        <h2 className="tp-head" style={{ marginTop: 14 }}>
          Each one verified <span className="tp-italic tp-persimmon">before</span> you upload.
        </h2>
        <p className="tp-sub">
          AI vision trained on real consular refusal patterns. Errors come back
          in plain language, not error codes.
        </p>
      </div>
      <div className="sc-docs-rows">
        <DocRow flipClass="sc-doc-flip-1" name="Passport (bio page)" />
        <DocRow flipClass="sc-doc-flip-2" name="I-20 — signature page" />
        <DocRow flipClass="sc-doc-flip-3" name="Bank statement · page 3" />
      </div>
    </section>
  );
}

function DocRow({ name, flipClass }: { name: string; flipClass: string }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    // Mirror the CSS scan-line cycle: ~2.2s in we flip the pill.
    const delay = flipClass === "sc-doc-flip-1" ? 2200
                : flipClass === "sc-doc-flip-2" ? 4400
                : 6600;
    const t = setTimeout(() => setFlipped(true), delay);
    return () => clearTimeout(t);
  }, [flipClass]);
  return (
    <div className={`sc-doc-row ${flipClass}${flipped ? " flipped" : ""}`}>
      <span className="sc-doc-name">{name}</span>
      <span style={{ position: "relative", display: "inline-block", width: 100, height: 18 }}>
        <span className={`sc-doc-pill sc-doc-busy sc-doc-pill-busy-${flipClass.slice(-1)}`}>Checking…</span>
        <span className={`sc-doc-pill sc-doc-ok sc-doc-pill-ok-${flipClass.slice(-1)}`}>Checked ✓</span>
      </span>
      {!flipped && <span className="sc-doc-scan" aria-hidden />}
    </div>
  );
}

function SceneMock() {
  return (
    <section className="sc-mock">
      <div>
        <p className="tp-eyebrow">Mock Interview</p>
        <h2 className="tp-head" style={{ marginTop: 14 }}>
          Hear every question <span className="tp-italic tp-persimmon">before</span> they ask it.
        </h2>
        <p className="tp-sub">
          Voice in, voice out. Scored on the four things consular officers
          actually grade.
        </p>
      </div>
      <div className="sc-mock-card">
        <p className="sc-mock-q">
          Why this university over the others that admitted you?
        </p>
        <div className="sc-mic">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <div className="sc-scores">
          <CountTile label="Clarity"     to={94} />
          <CountTile label="Confidence"  to={88} />
          <CountTile label="Specificity" to={91} />
          <CountTile label="Financials"  to={76} />
        </div>
      </div>
    </section>
  );
}

function CountTile({ label, to }: { label: string; to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to); return;
    }
    let raf = 0; const start = performance.now(); const dur = 1500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <div className="sc-score">
      <span className="sc-score-label">{label}</span>
      <span className="sc-score-val">{n}</span>
    </div>
  );
}

function SceneParent() {
  return (
    <section className="sc-parent">
      <div>
        <p className="tp-eyebrow">Parent Share</p>
        <h2 className="tp-head" style={{ marginTop: 14 }}>
          Your parents see what matters. <span className="tp-italic tp-persimmon">Nothing else.</span>
        </h2>
        <p className="tp-sub">
          One read-only link. No app, no login. Progress, next step, interview
          date — that&rsquo;s it.
        </p>
      </div>
      <div className="sc-phone-wrap">
        <div className="sc-phone">
          <div className="sc-phone-notch" />
          <div className="sc-phone-screen">
            <p className="sc-phone-eye">Anika — Family view</p>
            <h4 className="sc-phone-h">Your child&rsquo;s application</h4>
            <div className="sc-phone-bar"><span /></div>
            <p className="sc-phone-meta">63% complete · updated 2m ago</p>
            <ul className="sc-phone-chips">
              <li className="sc-phone-chip" style={{ animationDelay: "600ms" }}>Phase 4 of 5</li>
              <li className="sc-phone-chip" style={{ animationDelay: "1000ms" }}>Mocks done: 2</li>
              <li className="sc-phone-chip" style={{ animationDelay: "1400ms" }}>Docs 12 / 14</li>
            </ul>
            <div className="sc-phone-foot">
              <span className="sc-phone-dot" />
              <span>Live updates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneCloser() {
  return (
    <section className="sc-closer">
      <p className="tp-eyebrow" style={{ textAlign: "center", marginBottom: 14 }}>Stamped.</p>
      <h2 className="tp-head">
        Take the <span className="tp-italic tp-persimmon">stamped</span> way.
      </h2>
      <div className="sc-closer-img">
        <PassportSvg />
      </div>
      <p className="sc-closer-cta">Start free — Phase 1 forever</p>
    </section>
  );
}

/* ─────────────────────────── Icons ─────────────────────────── */
function PlayIcon()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden><path d="M3 1.5L12 7L3 12.5V1.5Z"/></svg>; }
function PauseIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden><rect x="2.5" y="2" width="3" height="10" rx="0.6"/><rect x="8.5" y="2" width="3" height="10" rx="0.6"/></svg>; }
function SoundIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden><path d="M2 5h2.4L8 2v10L4.4 9H2V5Z" fill="currentColor"/><path d="M10 4.5C11 5.5 11 8.5 10 9.5"/><path d="M12 3C13.5 4.5 13.5 9.5 12 11"/></svg>; }
function MutedIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden><path d="M2 5h2.4L8 2v10L4.4 9H2V5Z" fill="currentColor"/><path d="M10 5l3 4M13 5l-3 4"/></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><path d="M3 3L11 11M11 3L3 11"/></svg>; }

/* A tiny stylized passport so the closer doesn't need to load /pass.png. */
function PassportSvg() {
  return (
    <svg viewBox="0 0 540 340" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pass-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#1A2540" />
          <stop offset="100%" stopColor="#0F1828" />
        </linearGradient>
        <radialGradient id="pass-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#FF5B2E" stopOpacity="0.36" />
          <stop offset="100%" stopColor="#FF5B2E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="270" cy="320" rx="190" ry="14" fill="rgba(0,0,0,0.32)" />
      <rect x="60" y="40" width="420" height="260" rx="14" fill="url(#pass-cover)" />
      <rect x="60" y="40" width="420" height="260" rx="14" fill="none" stroke="rgba(255,255,255,0.08)" />
      {/* Embossed mark */}
      <g transform="translate(180 110)" stroke="#D9C8B0" strokeOpacity="0.55" strokeWidth="6" fill="none" strokeLinecap="square">
        <path d="M 8 90 L 38 90 M 23 90 L 23 55" />
        <path d="M 23 55 Q 23 27 50 27 Q 77 27 77 55" />
        <path d="M 77 55 L 77 90 M 62 90 L 92 90" />
        <path d="M 23 90 L 105 22" />
        <path d="M 82 14 L 110 14 L 110 42" />
      </g>
      <text x="270" y="244" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontSize="22" fill="#D9C8B0" fillOpacity="0.62">GetStamped</text>
      <circle cx="420" cy="80" r="46" fill="url(#pass-glow)" />
      <circle cx="420" cy="80" r="18" fill="#FF5B2E" fillOpacity="0.85" />
      <text x="420" y="84" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="#FFE4D8" fontWeight="700" letterSpacing="0.2">F-1</text>
    </svg>
  );
}

/* ─────────────────────────── Utils ─────────────────────────── */
function formatT(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
