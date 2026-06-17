"use client";

import {
  useEffect, useRef, useState, useCallback,
  type ReactNode, type CSSProperties, type HTMLAttributes,
} from "react";

/* ════════════════════════════════════════════
   1. SMOOTH SCROLL — no-op pass-through.
   Native browser scrolling (macOS trackpad / iOS momentum) is already
   the smoothest possible. JS scroll-hijacking via Lenis/Locomotive
   conflicts with fixed nav, modals, side panels, and on heavy pages
   feels worse than native. Keeping the export so call sites don't
   break, but it just renders children.
   ════════════════════════════════════════════ */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/* ════════════════════════════════════════════
   2. REVEAL — entrance on first view (once only)
   ════════════════════════════════════════════ */
export function Reveal({
  children, delay = 0, y = 18, className = "",
}: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: on ? 1 : 0,
      transform: on ? "none" : `translateY(${y}px)`,
      transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                   transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      willChange: on ? "auto" : "opacity, transform",
    }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   3. MAGNETIC — CTAs subtly pull toward cursor
   ════════════════════════════════════════════ */
const clampPx = (v: number, m: number) => Math.max(-m, Math.min(m, v));

export function Magnetic({
  children, strength = 0.25, maxPx = 8,
}: { children: ReactNode; strength?: number; maxPx?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${clampPx(dx, maxPx)}px, ${clampPx(dy, maxPx)}px)`;
  }, [strength, maxPx]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "translate(0,0)";
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ display: "inline-block", transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   4. TILT CARD — 3D perspective tilt + light sheen
   ════════════════════════════════════════════ */
export function TiltCard({
  children, className = "", maxTilt = 4,
}: { children: ReactNode; className?: string; maxTilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg)`;
    if (sheen.current) {
      sheen.current.style.opacity = "1";
      sheen.current.style.background =
        `radial-gradient(420px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px,
         rgba(255,91,46,0.07), transparent 65%)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
    if (sheen.current) sheen.current.style.opacity = "0";
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={className}
      style={{ position: "relative", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)", willChange: "transform" }}>
      <div ref={sheen} aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: "inherit",
        opacity: 0, transition: "opacity 0.4s ease", pointerEvents: "none",
      }} />
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   5. PARALLAX — element drifts slower than scroll
   ════════════════════════════════════════════ */
export function Parallax({
  children, speed = 0.12, className = "",
}: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    }, { rootMargin: "200px 0px 200px 0px" });
    io.observe(el);
    const tick = () => {
      if (visible) {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * -speed}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [speed]);
  return <div ref={ref} className={className} style={{ willChange: "transform" }}>{children}</div>;
}

/* ════════════════════════════════════════════
   6. COUNT UP — stat numbers count in when seen
   ════════════════════════════════════════════ */
export function CountUp({
  to, duration = 1400, prefix = "", suffix = "", className = "",
}: { to: number; duration?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Hydration-safe: render final `to` on the server AND first client render so
  // the HTML matches. The IntersectionObserver in useEffect then resets to 0
  // and animates up — post-hydration, no React mismatch.
  const [val, setVal] = useState<number>(to);
  const startedRef = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (startedRef.current) { setVal(to); return; }
    startedRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(to); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      // Reset to 0 right before animating so the bump is visible.
      setVal(0);
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
    {prefix}{val}{suffix}
  </span>;
}

/* ════════════════════════════════════════════
   7. TEXT REVEAL — headline unmasks word by word
   ════════════════════════════════════════════ */
export function TextReveal({
  text, className = "", stagger = 45,
}: { text: string; className?: string; stagger?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <span style={{
            display: "inline-block",
            transform: on ? "translateY(0)" : "translateY(110%)",
            transition: `transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * stagger}ms`,
          }}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </span>
  );
}

/* ════════════════════════════════════════════
   8. CURSOR GLOW — faint persimmon light follows cursor
   ════════════════════════════════════════════ */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      if (ref.current)
        ref.current.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} aria-hidden style={{
      position: "fixed", top: 0, left: 0, width: 600, height: 600,
      borderRadius: "50%", pointerEvents: "none", zIndex: 1,
      background: "radial-gradient(circle, rgba(255,91,46,0.06) 0%, transparent 65%)",
      willChange: "transform",
    }} />
  );
}

/* ════════════════════════════════════════════
   9. STAGGER GROUP — children cascade in
   ════════════════════════════════════════════ */
export function Stagger({
  children, gap = 80, className = "",
}: { children: ReactNode | ReactNode[]; gap?: number; className?: string }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {items.map((c, i) => <Reveal key={i} delay={i * gap}>{c}</Reveal>)}
    </div>
  );
}

/* ════════════════════════════════════════════
   10. RIPPLE — press feedback from touch point
   ════════════════════════════════════════════ */
type RippleProps = { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>;

export function Ripple({ children, className = "", ...rest }: RippleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onDown = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const s = document.createElement("span");
    const size = Math.max(r.width, r.height) * 2;
    Object.assign(s.style, {
      position: "absolute", borderRadius: "50%",
      width: `${size}px`, height: `${size}px`,
      left: `${e.clientX - r.left - size / 2}px`,
      top: `${e.clientY - r.top - size / 2}px`,
      background: "rgba(255,91,46,0.18)",
      transform: "scale(0)", pointerEvents: "none",
      transition: "transform 0.55s ease, opacity 0.6s ease",
    } as CSSProperties);
    el.appendChild(s);
    requestAnimationFrame(() => { s.style.transform = "scale(1)"; s.style.opacity = "0"; });
    setTimeout(() => { if (s.parentNode === el) el.removeChild(s); }, 650);
  };
  return (
    <div ref={ref} onMouseDown={onDown} className={className}
      style={{ position: "relative", overflow: "hidden" }} {...rest}>
      {children}
    </div>
  );
}
