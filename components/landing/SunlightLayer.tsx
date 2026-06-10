"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-locked wire.
 *
 * A glowing wire anchors at the left edge just after the hero, then snakes
 * down the page with random left/right swings. Progress is tied directly to
 * scrollY — no momentum, no lerp — so it moves only when the user moves.
 *
 * Performance notes:
 *   • No SVG filter (those re-rasterize on every dashoffset change → jank).
 *     Glow is done with three stacked paths at decreasing widths/opacities.
 *   • Head dot position is read from a pre-sampled point table built once at
 *     mount, so each scroll frame is O(1) — no getPointAtLength() per scroll.
 *   • Single passive scroll listener, RAF-debounced so we never paint more
 *     than once per frame even on fast wheels.
 *   • Path is rebuilt only on resize (debounced 200ms).
 */
export function SunlightLayer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const pathGlowRef = useRef<SVGPathElement>(null);
  const pathMidRef  = useRef<SVGPathElement>(null);
  const pathCoreRef = useRef<SVGPathElement>(null);
  const headOuterRef = useRef<SVGCircleElement>(null);
  const headCoreRef  = useRef<SVGCircleElement>(null);

  const dataRef = useRef<{
    length: number;
    startY: number;
    endY: number;
    /** Pre-sampled points along the path. Index ≈ length-step (≈ 6px). */
    samples: { x: number; y: number }[];
    sampleStep: number;
  } | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      const vw = window.innerWidth;
      const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const startY = window.innerHeight * 0.94;
      const endY = Math.max(startY + 600, docH - 80);

      const marginX = Math.min(80, vw * 0.06);

      // Seeded PRNG so the same wire persists across in-session resizes
      const seed = (() => {
        const s = sessionStorage.getItem("sunlight-seed");
        if (s) return parseFloat(s);
        const v = Math.random();
        sessionStorage.setItem("sunlight-seed", String(v));
        return v;
      })();
      let rng = seed;
      const random = () => {
        rng = (rng * 9301 + 49297) % 233280;
        return rng / 233280;
      };

      let cx = marginX;
      let cy = startY;
      const parts: string[] = [`M ${cx.toFixed(1)} ${cy.toFixed(1)}`];

      const segmentH = 280;
      while (cy < endY) {
        const nextY = Math.min(endY, cy + segmentH + random() * 90);
        const nextX = marginX + random() * (vw - 2 * marginX);
        const cp1x = cx + (random() - 0.5) * vw * 0.55;
        const cp1y = cy + (nextY - cy) * 0.35;
        const cp2x = nextX + (random() - 0.5) * vw * 0.55;
        const cp2y = cy + (nextY - cy) * 0.65;
        parts.push(
          `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${nextX.toFixed(1)} ${nextY.toFixed(1)}`,
        );
        cx = nextX;
        cy = nextY;
      }
      const d = parts.join(" ");

      if (!svgRef.current || !pathCoreRef.current || !pathMidRef.current || !pathGlowRef.current) return;

      const svgH = endY + 100;
      svgRef.current.setAttribute("width", String(vw));
      svgRef.current.setAttribute("height", String(svgH));
      svgRef.current.setAttribute("viewBox", `0 0 ${vw} ${svgH}`);
      if (wrapperRef.current) wrapperRef.current.style.height = `${svgH}px`;

      [pathCoreRef.current, pathMidRef.current, pathGlowRef.current].forEach((p) => {
        p.setAttribute("d", d);
      });

      // Use the core path (cheapest) for length + sampling — all 3 share `d`
      const length = pathCoreRef.current.getTotalLength();
      const sampleStep = 6;
      const sampleCount = Math.ceil(length / sampleStep);
      const samples: { x: number; y: number }[] = new Array(sampleCount + 1);
      for (let i = 0; i <= sampleCount; i++) {
        const pt = pathCoreRef.current.getPointAtLength(Math.min(length, i * sampleStep));
        samples[i] = { x: pt.x, y: pt.y };
      }

      [pathCoreRef.current, pathMidRef.current, pathGlowRef.current].forEach((p) => {
        p.style.strokeDasharray = `${length}`;
        p.style.strokeDashoffset = reduceMotion ? "0" : `${length}`;
      });

      dataRef.current = { length, startY, endY, samples, sampleStep };
      setReady(true);
      updateScroll();
    };

    const updateScroll = () => {
      const data = dataRef.current;
      if (!data) return;
      const core = pathCoreRef.current;
      const mid = pathMidRef.current;
      const glow = pathGlowRef.current;
      const headOuter = headOuterRef.current;
      const headCore = headCoreRef.current;
      if (!core || !mid || !glow) return;

      const sy = window.scrollY;
      const vh = window.innerHeight;
      const visibleBottom = sy + vh * 0.9; // draw to ~90% of viewport so wire stays just above fold

      const progress = Math.max(
        0,
        Math.min(1, (visibleBottom - data.startY) / Math.max(1, data.endY - data.startY)),
      );

      const drawn = data.length * progress;
      const offset = reduceMotion ? 0 : data.length - drawn;
      const offsetStr = `${offset.toFixed(1)}px`;
      core.style.strokeDashoffset = offsetStr;
      mid.style.strokeDashoffset  = offsetStr;
      glow.style.strokeDashoffset = offsetStr;

      // Head position via sample table — O(1)
      if (headOuter && headCore) {
        if (drawn < 8 || progress >= 0.997) {
          headOuter.style.opacity = "0";
          headCore.style.opacity = "0";
        } else {
          const idx = Math.min(data.samples.length - 1, Math.floor(drawn / data.sampleStep));
          const pt = data.samples[idx];
          // Set via transform on the parent <g> would be cheaper, but moving
          // two circles' cx/cy is fine — just two attribute writes per frame.
          headOuter.setAttribute("cx", pt.x.toFixed(1));
          headOuter.setAttribute("cy", pt.y.toFixed(1));
          headCore.setAttribute("cx", pt.x.toFixed(1));
          headCore.setAttribute("cy", pt.y.toFixed(1));
          headOuter.style.opacity = "1";
          headCore.style.opacity = "1";
        }
      }
    };

    let raf = 0;
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(() => {
        pending = false;
        updateScroll();
      });
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    };

    build();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className="pointer-events-none absolute left-0 right-0"
      style={{
        top: 0,
        zIndex: 1,
        opacity: ready ? 1 : 0,
        transition: "opacity 800ms ease-out",
      }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "visible",
          contain: "layout style paint",
        }}
      >
        {/* Outer glow — wide soft halo, no filter (filter-on-scroll = jank) */}
        <path
          ref={pathGlowRef}
          d="M 0 0"
          stroke="rgba(245, 213, 144, 0.18)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ willChange: "stroke-dashoffset" }}
        />
        {/* Mid halo */}
        <path
          ref={pathMidRef}
          d="M 0 0"
          stroke="rgba(245, 213, 144, 0.45)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ willChange: "stroke-dashoffset" }}
        />
        {/* Core line — bright */}
        <path
          ref={pathCoreRef}
          d="M 0 0"
          stroke="rgba(255, 232, 178, 1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ willChange: "stroke-dashoffset" }}
        />
        {/* Head — two stacked circles for the soft halo */}
        <circle
          ref={headOuterRef}
          r="14"
          fill="rgba(245, 213, 144, 0.35)"
          style={{ opacity: 0, transition: "opacity 200ms ease-out" }}
        />
        <circle
          ref={headCoreRef}
          r="6"
          fill="rgba(255, 244, 200, 1)"
          style={{ opacity: 0, transition: "opacity 200ms ease-out" }}
        />
      </svg>
    </div>
  );
}
