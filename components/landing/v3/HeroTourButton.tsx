"use client";

import { useState } from "react";
import { TourPlayer } from "./TourPlayer";

/**
 * The hero's "Watch a 60-second tour" button — a tiny client island so
 * Hero.tsx itself can stay a server component. Opens TourPlayer in a
 * full-screen overlay; ESC, the pause/sound/close controls, or the
 * scheduled end of the 60-second sequence all close it.
 */
export function HeroTourButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="v3-hero-ghost"
        onClick={() => setOpen(true)}
        aria-label="Watch a 60-second tour of GetStamped"
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
          <path d="M0 0L10 6L0 12V0Z" />
        </svg>
        Watch a 60-second tour
      </button>
      <TourPlayer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
