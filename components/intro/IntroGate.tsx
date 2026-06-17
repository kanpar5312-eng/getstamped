"use client";

/* ════════════════════════════════════════════════════════════════════════════
   IntroGate — thin wrapper that decides whether to mount the OpeningSequence.

   Only plays on the marketing landing route (`/`). Server renders nothing
   (no flash on SSR). On the client we also check a session-storage flag —
   if the visitor has already seen the intro this session, IntroGate stays
   unmounted. Otherwise OpeningSequence plays once and the flag is set on
   completion.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { OpeningSequence } from "./OpeningSequence";

export function IntroGate() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;
    try {
      if (sessionStorage.getItem("gs_intro_seen") === "1") return;
    } catch {
      // sessionStorage blocked (Safari private mode, etc.) — fall through and play
    }
    setShow(true);
  }, [pathname]);

  if (!show) return null;
  return <OpeningSequence onComplete={() => setShow(false)} />;
}
