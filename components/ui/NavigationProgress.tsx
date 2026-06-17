"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top progress bar — instant feedback when the user clicks an internal link,
 * so the page never feels frozen during route resolution.
 *
 * How it works:
 *  - Intercepts clicks on `<a href>` pointing to the same origin.
 *  - Animates a persimmon bar across the top, easing toward 80% while we wait.
 *  - When the URL actually changes (`pathname` / `searchParams` flip), snaps
 *    to 100% then fades out.
 *  - Plain anchor (target="_blank", modifier keys, external links, hash) are
 *    ignored.
 *
 * No router events needed — Next 16 App Router doesn't emit them; observing
 * the URL primitives is the right pattern.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tickRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);

  // Snap to 100% + fade when URL actually changes
  useEffect(() => {
    if (!navigatingRef.current) return;
    navigatingRef.current = false;
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setProgress(100);
    const hide = window.setTimeout(() => {
      setVisible(false);
      // reset for next nav
      window.setTimeout(() => setProgress(0), 200);
    }, 220);
    return () => window.clearTimeout(hide);
  }, [pathname, searchParams]);

  // Intercept clicks on internal anchors
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      // External or protocol links
      if (/^(https?:|mailto:|tel:)/i.test(href) && !href.startsWith(window.location.origin)) return;
      // Pure hash on same page — no navigation, skip
      if (href.startsWith("#")) return;

      // Same path + same search? skip
      try {
        const next = new URL(anchor.href, window.location.href);
        const sameDoc =
          next.origin === window.location.origin &&
          next.pathname === window.location.pathname &&
          next.search === window.location.search;
        if (sameDoc) return;
      } catch {
        return;
      }

      // Kick off the indicator
      navigatingRef.current = true;
      setVisible(true);
      setProgress(8);

      // Trickle toward 80% over time so it doesn't look stuck
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 80) return p;
          // ease: the closer to 80, the slower
          const step = Math.max(0.6, (80 - p) * 0.06);
          return Math.min(80, p + step);
        });
      }, 80);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, var(--color-persimmon) 0%, var(--color-persimmon-deep) 100%)",
          boxShadow: "0 0 12px rgba(255,91,46,0.55), 0 0 2px rgba(255,91,46,0.8)",
          transition: "width 0.2s cubic-bezier(0.22,1,0.36,1)",
          willChange: "width",
        }}
      />
    </div>
  );
}
