"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";

/* ════════════════════════════════════════════════════════════════════════
   TextType — typewriter that cycles a list of phrases. Types, pauses,
   deletes, advances. GSAP handles the cursor blink so its timing is
   precise even if the text loop is mid-frame.

   Both `text` and `texts` are accepted (the reference snippet passes
   both); `texts` wins when both are present so existing call sites
   don't break.

   Variable-speed mode picks a random delay between [min,max] for each
   keystroke — feels more human than a constant interval.
   ═════════════════════════════════════════════════════════════════════════ */

type Props = {
  text?: string[];
  texts?: string[];
  typingSpeed?: number;       // ms per character when variable speed is off
  deletingSpeed?: number;     // ms per character while deleting
  pauseDuration?: number;     // ms to hold a fully-typed phrase
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorStyle?: CSSProperties;
  cursorBlinkDuration?: number; // seconds — full blink cycle
  variableSpeedEnabled?: boolean;
  variableSpeedMin?: number;
  variableSpeedMax?: number;
  className?: string;
  style?: CSSProperties;
};

export default function TextType({
  text,
  texts,
  typingSpeed = 75,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "_",
  cursorClassName,
  cursorStyle,
  cursorBlinkDuration = 0.5,
  variableSpeedEnabled = false,
  variableSpeedMin = 60,
  variableSpeedMax = 120,
  className,
  style,
}: Props) {
  // `texts` wins when both arrays are provided.
  const phrases = useMemo(() => {
    if (texts && texts.length) return texts;
    if (text && text.length) return text;
    return [""];
  }, [text, texts]);

  const [output, setOutput] = useState("");
  const [phaseIdx, setPhaseIdx] = useState(0);
  const cursorRef = useRef<HTMLSpanElement>(null);

  /* ── Cursor blink via GSAP — frame-independent of the type loop ── */
  useEffect(() => {
    if (!showCursor || !cursorRef.current) return;
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration / 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
    return () => {
      tween.kill();
    };
  }, [showCursor, cursorBlinkDuration]);

  /* ── Type / pause / delete state machine ──────────────────────── */
  useEffect(() => {
    const phrase = phrases[phaseIdx] ?? "";
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const stepDelay = () =>
      variableSpeedEnabled
        ? Math.floor(
            variableSpeedMin + Math.random() * Math.max(0, variableSpeedMax - variableSpeedMin),
          )
        : typingSpeed;

    const typeForward = (i: number) => {
      if (cancelled) return;
      if (i <= phrase.length) {
        setOutput(phrase.slice(0, i));
        timer = setTimeout(() => typeForward(i + 1), stepDelay());
      } else {
        // Fully typed — pause, then begin deleting.
        timer = setTimeout(() => typeBackward(phrase.length), pauseDuration);
      }
    };

    const typeBackward = (i: number) => {
      if (cancelled) return;
      if (i >= 0) {
        setOutput(phrase.slice(0, i));
        timer = setTimeout(() => typeBackward(i - 1), deletingSpeed);
      } else {
        // Advance to the next phrase (wraps).
        setPhaseIdx((p) => (p + 1) % phrases.length);
      }
    };

    // Kick off typing the current phrase from scratch.
    setOutput("");
    timer = setTimeout(() => typeForward(1), stepDelay());

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    phaseIdx, phrases, typingSpeed, deletingSpeed, pauseDuration,
    variableSpeedEnabled, variableSpeedMin, variableSpeedMax,
  ]);

  return (
    <span className={className} style={style} aria-live="polite">
      <span>{output}</span>
      {showCursor && (
        <span
          ref={cursorRef}
          aria-hidden
          className={cursorClassName}
          style={{ display: "inline-block", marginLeft: "0.06em", ...cursorStyle }}
        >
          {cursorCharacter}
        </span>
      )}
    </span>
  );
}
