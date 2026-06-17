"use client";

/* ════════════════════════════════════════════════════════════════════════════
   OpeningSequence — 5.5s site-open cinematic. Plays once per session.

   Phases:
   1. Black void + 1px persimmon hairline fades in    0.0 → 0.6s
   2. "Ready." materializes via 1500+ canvas particles 0.6 → 2.4s
   3. Language cycle: 6 translations crossfade        2.8 → 4.2s
   4. Word scales to 1.8x + fades; panels split apart  4.2 → 5.1s
   5. Unmount, session flag set                       5.5s

   Particle physics: spring-damped, GPU-friendly (single canvas, no DOM
   per particle). Reduced-motion path skips particles + cycle → straight
   to a static "Ready." then panel split.
   ═════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const LANGUAGES = ["Ready.", "तैयार.", "准备好了.", "Sẵn sàng.", "준비됐어.", "Pronto."];

/* Color stops — particles travel from persimmon → paper as they settle.
   The period at the end stays persimmon. */
const PERSIMMON: [number, number, number] = [255, 91, 46];
const PAPER: [number, number, number] = [244, 239, 230];

/* Easings */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

/* Master schedule (ms from mount) */
const T = {
  LINE_IN: 0,
  FORM_START: 600,
  FORM_END: 2400,
  HOLD_BEFORE_CYCLE: 400,
  CYCLE_START: 2800,
  CYCLE_END: 4200,
  SCALE_START: 4200,
  SCALE_DUR: 800,
  SPLIT_START: 4400,
  SPLIT_DUR: 900,
  UNMOUNT: 5500,
};

type Phase = "line" | "forming" | "cycling" | "scaling" | "splitting" | "done";

export function OpeningSequence({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("line");
  const [langIndex, setLangIndex] = useState(0);
  const [reduce, setReduce] = useState(false);

  /* Respect reduced motion */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduce(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  /* Master timer */
  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    try {
      sessionStorage.setItem("gs_intro_seen", "1");
    } catch {}
    /* Signal the hero (and anyone else listening) that the cinematic just
       cleared — they can use this to start their entrance fresh instead of
       fading in invisibly while the panels are still closed. */
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("gs:intro-complete"));
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (reduce) {
      // Static fallback: line → settled "Ready." → split
      setPhase("forming");
      const t1 = window.setTimeout(() => setPhase("splitting"), 1600);
      const t2 = window.setTimeout(finish, 2600);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("forming"), T.FORM_START));
    timers.push(window.setTimeout(() => setPhase("cycling"), T.CYCLE_START));
    timers.push(window.setTimeout(() => {
      setLangIndex(0); // back to English before scaling out
      setPhase("scaling");
    }, T.SCALE_START));
    timers.push(window.setTimeout(() => setPhase("splitting"), T.SPLIT_START));
    timers.push(window.setTimeout(finish, T.UNMOUNT));
    return () => timers.forEach(window.clearTimeout);
  }, [reduce, finish]);

  /* Language cycle interval — only runs during cycling phase */
  useEffect(() => {
    if (phase !== "cycling") return;
    let i = 0;
    const tick = () => {
      i = (i + 1) % LANGUAGES.length;
      setLangIndex(i);
    };
    const interval = window.setInterval(tick, (T.CYCLE_END - T.CYCLE_START) / LANGUAGES.length);
    return () => window.clearInterval(interval);
  }, [phase]);

  /* Canvas particle system — runs during forming phase only */
  useEffect(() => {
    if (reduce) return;
    if (phase !== "forming") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    /* Render "Ready." on an offscreen canvas to extract pixel targets */
    const text = "Ready.";
    const fontFamily =
      'var(--font-display-stack, "Instrument Serif", "Times New Roman", Georgia, serif)';
    const fontSize = Math.min(Math.max(W * 0.16, 96), 260);
    const fontSpec = `400 ${fontSize}px Instrument Serif, "Times New Roman", Georgia, serif`;

    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true })!;
    offCtx.font = fontSpec;
    const metrics = offCtx.measureText(text);
    const padding = 24;
    const offW = Math.ceil(metrics.width + padding * 2);
    const offH = Math.ceil(fontSize * 1.4);
    off.width = offW;
    off.height = offH;
    offCtx.font = fontSpec;
    offCtx.fillStyle = "#fff";
    offCtx.textBaseline = "middle";
    offCtx.fillText(text, padding, offH / 2);

    /* Letter boundaries (right edge of each letter) so we can stagger formation */
    const letterEdges: number[] = [];
    let cumWidth = padding;
    for (let i = 0; i < text.length; i++) {
      cumWidth += offCtx.measureText(text[i]).width;
      letterEdges.push(cumWidth);
    }

    /* Sample filled pixels */
    const img = offCtx.getImageData(0, 0, offW, offH);
    const STEP = fontSize > 180 ? 5 : fontSize > 120 ? 4 : 3;
    const targets: { x: number; y: number; letterIndex: number; isPeriod: boolean }[] = [];
    for (let y = 0; y < offH; y += STEP) {
      for (let x = 0; x < offW; x += STEP) {
        const idx = (y * offW + x) * 4;
        if (img.data[idx + 3] > 128) {
          let letterIndex = 0;
          for (let i = 0; i < letterEdges.length; i++) {
            if (x < letterEdges[i]) {
              letterIndex = i;
              break;
            }
          }
          targets.push({
            x,
            y,
            letterIndex,
            isPeriod: text[letterIndex] === ".",
          });
        }
      }
    }

    /* Translate offscreen coords to viewport-centered */
    const ox = (W - offW) / 2;
    const oy = (H - offH) / 2;

    /* Particles */
    type P = {
      x: number; y: number;
      tx: number; ty: number;
      vx: number; vy: number;
      bornAt: number;
      size: number;
      isPeriod: boolean;
    };
    const particles: P[] = targets.map((t) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 220 + Math.random() * 240;
      const tx = ox + t.x;
      const ty = oy + t.y;
      return {
        x: tx + Math.cos(angle) * radius,
        y: ty + Math.sin(angle) * radius,
        tx,
        ty,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        bornAt: t.letterIndex * 120,
        size: 1.3 + Math.random() * 1.4,
        isPeriod: t.isPeriod,
      };
    });

    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);

      /* Shimmer band position — starts after letters have settled (~1.2s) */
      const shimmerActive = elapsed > 1200;
      const shimmerProgress = Math.min(1, Math.max(0, (elapsed - 1200) / 1200));
      const shimmerX = -100 + shimmerProgress * (W + 200);

      for (const p of particles) {
        if (elapsed < p.bornAt) continue;

        /* Spring physics toward target */
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const stiffness = 0.06;
        const damping = 0.84;
        p.vx = (p.vx + dx * stiffness) * damping;
        p.vy = (p.vy + dy * stiffness) * damping;
        p.x += p.vx;
        p.y += p.vy;

        /* Distance-based color blend: far = persimmon, near = paper */
        const dist = Math.hypot(dx, dy);
        const t01 = Math.max(0, Math.min(1, 1 - dist / 180));
        let r: number, g: number, b: number;
        if (p.isPeriod) {
          /* Period stays persimmon */
          r = PERSIMMON[0]; g = PERSIMMON[1]; b = PERSIMMON[2];
        } else {
          r = PERSIMMON[0] + (PAPER[0] - PERSIMMON[0]) * t01;
          g = PERSIMMON[1] + (PAPER[1] - PERSIMMON[1]) * t01;
          b = PERSIMMON[2] + (PAPER[2] - PERSIMMON[2]) * t01;
        }

        /* Shimmer: brighten particles near the shimmer band */
        let brightness = 1;
        if (shimmerActive) {
          const bandDist = Math.abs(p.x - shimmerX);
          if (bandDist < 120) {
            const k = 1 - bandDist / 120;
            brightness = 1 + k * 0.7;
            r = Math.min(255, r * brightness);
            g = Math.min(255, g * brightness);
            b = Math.min(255, b * brightness);
          }
        }

        ctx.fillStyle = `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [phase, reduce]);

  /* Skip handler */
  const handleSkip = useCallback(() => {
    if (completedRef.current) return;
    setPhase("splitting");
    window.setTimeout(finish, T.SPLIT_DUR);
  }, [finish]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      role="presentation"
      aria-hidden="true"
    >
      {/* Black backdrop — receives the panel split */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-black"
          initial={{ x: 0 }}
          animate={{ x: phase === "splitting" ? "-100%" : 0 }}
          transition={{
            duration: T.SPLIT_DUR / 1000,
            ease: EASE_OUT,
          }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 bg-black"
          initial={{ x: 0 }}
          animate={{ x: phase === "splitting" ? "100%" : 0 }}
          transition={{
            duration: T.SPLIT_DUR / 1000,
            ease: EASE_OUT,
          }}
        />
      </div>

      {/* Persimmon hairline — phase 1 only */}
      <AnimatePresence>
        {phase === "line" && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 60,
              height: 1,
              background: "#FF5B2E",
            }}
          />
        )}
      </AnimatePresence>

      {/* Canvas — particle formation, only during 'forming' (full motion) */}
      {phase === "forming" && !reduce && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Static "Ready." for reduced-motion fallback */}
      {phase === "forming" && reduce && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            style={{
              fontFamily:
                'Instrument Serif, "Times New Roman", Georgia, serif',
              fontWeight: 400,
              fontSize: "clamp(72px, 16vw, 240px)",
              lineHeight: 1,
              color: "#F4EFE6",
            }}
          >
            <span>Ready</span>
            <span style={{ color: "#FF5B2E" }}>.</span>
          </span>
        </div>
      )}

      {/* DOM text — language cycle + scale-out reveal */}
      {(phase === "cycling" || phase === "scaling") && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`${phase}-${langIndex}`}
              initial={
                phase === "cycling"
                  ? { opacity: 0, scale: 0.98 }
                  : { opacity: 1, scale: 1 }
              }
              animate={
                phase === "scaling"
                  ? { opacity: 0, scale: 1.8 }
                  : { opacity: 1, scale: 1 }
              }
              exit={{ opacity: 0, scale: 1.02 }}
              transition={
                phase === "scaling"
                  ? { duration: T.SCALE_DUR / 1000, ease: EASE_OUT }
                  : { duration: 0.3, ease: EASE_IN_OUT }
              }
              style={{
                fontFamily:
                  'Instrument Serif, "Songti SC", "Noto Serif CJK SC", "Batang", "Times New Roman", Georgia, serif',
                fontWeight: 400,
                fontSize: "clamp(72px, 16vw, 240px)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "#F4EFE6",
                display: "inline-block",
                willChange: "transform, opacity",
              }}
            >
              {LANGUAGES[langIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Skip button */}
      {phase !== "splitting" && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute bottom-6 right-6 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/80 transition-colors duration-200 pointer-events-auto"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
