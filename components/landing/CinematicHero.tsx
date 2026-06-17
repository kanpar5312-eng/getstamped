"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Magnetic, CountUp } from "@/components/motion/MotionKit";

type Props = {
  totalSignups: number;
  earlyBirdClaimed: number;
};

/**
 * Cinematic hero — full-bleed video that plays once, ends on the doors-open
 * frame. Text reveals in a stagger, synced to the video's actual playback
 * (kicks off when the doors hit ~50% open). Bottom edge dissolves into the
 * paper of the next section so downstream blends in smoothly.
 *
 * Mac-cool:
 *   • One <video> element, hardware-decoded by the GPU media engine
 *   • One `timeupdate` listener, sets a single state once, removes itself
 *   • CSS keyframes handle the stagger (no JS animation loop)
 *   • prefers-reduced-motion falls back to the poster frame + immediate text
 */
export function CinematicHero({ totalSignups, earlyBirdClaimed }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setRevealed(true);
      return;
    }
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => v.play().catch(() => { /* user-gesture required, leave poster */ });

    const onLoaded = () => {
      setVideoReady(true);
      tryPlay();
    };
    const onTime = () => {
      if (v.duration > 0 && v.currentTime / v.duration >= 0.45) {
        setRevealed(true);
        v.removeEventListener("timeupdate", onTime);
      }
    };
    const onEnd = () => {
      const last = Math.max(0, v.duration - 0.04);
      v.currentTime = last;
      v.pause();
      setRevealed(true);
    };

    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);

    const safety = window.setTimeout(() => setRevealed(true), 3500);

    return () => {
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnd);
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section className="relative isolate w-full overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Video layer */}
      <div aria-hidden className="absolute inset-0 z-0 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="/train.mp4" type="video/mp4" />
        </video>

        {/* Gemini watermark mask — bottom-right vignette that blends with the smoke */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: "240px",
            height: "120px",
            background:
              "radial-gradient(ellipse 80% 70% at 100% 100%, rgba(8,6,4,0.95) 0%, rgba(8,6,4,0.75) 30%, rgba(8,6,4,0.4) 55%, transparent 85%)",
          }}
        />

        {/* Cinematic legibility overlay — dark at top + bottom, transparent at center */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Bottom dissolve — fades to paper so the next section blends */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[28vh] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(245,239,228,0.35) 55%, rgba(245,239,228,0.85) 85%, var(--color-paper) 100%)",
          }}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-6 lg:px-10 flex flex-col items-center justify-center text-center" style={{ minHeight: "100vh", paddingTop: "12vh", paddingBottom: "16vh" }}>
        <div
          className={`hero-cine-eyebrow ${revealed ? "is-visible" : ""}`}
          style={{ transitionDelay: "0ms" }}
        >
          <Eyebrow>
            <span style={{ color: "rgba(255,255,255,0.78)" }}>F-1 visa · International students</span>
          </Eyebrow>
        </div>

        <h1
          className={`hero-cine-line mt-6 font-display text-[2.6rem] sm:text-[3.6rem] lg:text-[4.4rem] leading-[1.04] tracking-tight ${revealed ? "is-visible" : ""}`}
          style={{
            color: "#FFFFFF",
            textShadow: "0 2px 24px rgba(0,0,0,0.55), 0 1px 0 rgba(0,0,0,0.35)",
            transitionDelay: "120ms",
            maxWidth: "20ch",
          }}
        >
          The only F-1 visa prep tool you&rsquo;ll ever{" "}
          <span style={{ color: "#FFE9A8", fontStyle: "italic" }}>need</span>.
        </h1>

        <p
          className={`hero-cine-line mt-6 max-w-xl text-base sm:text-lg leading-relaxed ${revealed ? "is-visible" : ""}`}
          style={{
            color: "rgba(250,246,237,0.85)",
            textShadow: "0 1px 12px rgba(0,0,0,0.55)",
            transitionDelay: "260ms",
          }}
        >
          Forty-seven steps. Voice-based mock interviews. A document
          organizer your parents can actually understand.
        </p>

        <div
          className={`hero-cine-line mt-9 flex flex-wrap items-center justify-center gap-3 ${revealed ? "is-visible" : ""}`}
          style={{ transitionDelay: "420ms" }}
        >
          <Magnetic>
            <Link href="/dashboard" aria-label="Start free — no card required">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #EDE7DA 100%)",
                  color: "#1C1B1A",
                  boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                Start free — no card required
              </button>
            </Link>
          </Magnetic>
          <Link href="#how-it-works">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium border transition-colors duration-300"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#FFFFFF",
                borderColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              See how it works
            </button>
          </Link>
        </div>

        {totalSignups > 0 && (
          <div
            className={`hero-cine-line mt-8 inline-flex items-center gap-3 rounded-full px-4 py-2 ${revealed ? "is-visible" : ""}`}
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              transitionDelay: "560ms",
              color: "rgba(250,246,237,0.85)",
            }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-soft-pulse shrink-0" />
            <span className="text-[13px] tracking-tight">
              <CountUp
                to={totalSignups}
                className="font-display"
              />{" "}
              on the waitlist ·{" "}
              <CountUp
                to={earlyBirdClaimed}
                className="font-display"
              />
              /100 early-bird spots claimed
            </span>
          </div>
        )}

        {/* Scroll cue */}
        <div
          className={`hero-cine-line absolute bottom-[7vh] left-1/2 -translate-x-1/2 ${revealed ? "is-visible" : ""}`}
          style={{ transitionDelay: "720ms" }}
        >
          <div
            className="flex flex-col items-center gap-1.5"
            style={{ color: "rgba(250,246,237,0.7)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.22em] font-mono">Scroll</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce-soft" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14" />
              <path d="M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading hint — only visible if the video is still buffering */}
      {!videoReady && (
        <div
          aria-hidden
          className="absolute top-4 right-4 z-20 text-[10px] font-mono uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          loading
        </div>
      )}
    </section>
  );
}
