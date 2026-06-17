"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { Footer } from "@/components/landing/Footer";
import { PRICES, formatPrice } from "@/lib/pricing";
import type { Currency } from "@/lib/pricing";
import { Reveal, TiltCard, Magnetic } from "@/components/motion/MotionKit";

type Props = {
  currency: Currency;
  totalSignups: number;
  earlyBirdClaimed: number;
};

/* ════════════════════════════════════════════════════════════════════════════
   GetStamped — macOS-style landing
   --------------------------------------------------------------------------
   The whole page is presented as a warm-paper desktop. Above the fold lives
   a single "Hero.app" window that opens with a 700ms scale+fade. Below it,
   a tabbed "Workspace.app" window lets visitors flip through Why / 47 Steps
   / Documents / Mock Interview / Ask / Parents. Then a Pricing window,
   testimonial Notes, a FAQ window, and a Launch CTA — each styled like a
   macOS application surface with traffic lights, a title bar, and the
   brand's warm ink + persimmon + paper palette.
   ════════════════════════════════════════════════════════════════════════════ */

export function MacLanding({ currency, earlyBirdClaimed }: Props) {
  return (
    <div className="mac-root">
      <MenuBar />

      {/* Wallpaper layer — fixed, drifts subtly behind everything */}
      <Wallpaper />

      <main className="mac-stage">
        <HeroWindow />
        <FeaturesWindow />
        <DocsSpotlight />
        <MockSpotlight />
        <ParentsSpotlight />
        <QuestionShelf />
        <ReviewsMarquee />
        <PricingWindow currency={currency} earlyBirdClaimed={earlyBirdClaimed} />
        <NotesWall />
        <FAQWindow />
        <StampedCloser />
        <LaunchWindow />
      </main>

      <Footer />

      <Styles />
    </div>
  );
}

/* ──────────────────────────── Menu bar ──────────────────────────── */

function MenuBar() {

  return (
    <header className="mac-menubar">
      <div className="mac-menubar-inner">
        <Link href="/" className="mac-brand" aria-label="GetStamped">
          <BrandMark size={18} />
          <span>GetStamped</span>
        </Link>
        <nav className="mac-menus">
          <a href="#workspace">Workspace</a>
          <a href="#reviews">Reviews</a>
          <a href="#pricing">Pricing</a>
          <a href="#notes">Students</a>
          <a href="#faq">Help</a>
          <a href="/support">Support</a>
        </nav>
        <div className="mac-menu-right">
          <span className="mac-status-dot" aria-hidden />
          <Link href="/sign-in" className="mac-signin">Sign in</Link>
          <Link href="/sign-up" className="mac-signup">Sign up</Link>
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────── Wallpaper ──────────────────────────── */

function Wallpaper() {
  return (
    <div aria-hidden className="mac-wallpaper">
      <div className="mac-wp-glow" />
      <div className="mac-wp-grid" />
      {/* Faint floating "icons" hinting at app names — desk-clutter feel */}
      <div className="mac-wp-icons">
        <DesktopIcon label="47-Step.playbook" style={{ top: "12%", left: "5%" }} kind="doc" />
        <DesktopIcon label="Passport.scan"     style={{ top: "26%", left: "3%" }} kind="image" />
        <DesktopIcon label="DS-160.form"       style={{ top: "42%", left: "6%" }} kind="form" />
        <DesktopIcon label="Mock Interview.app" style={{ top: "16%", right: "4%" }} kind="mic" />
        <DesktopIcon label="Parent View.share"  style={{ top: "34%", right: "3%" }} kind="share" />
        <DesktopIcon label="Approved.stamp"     style={{ top: "52%", right: "6%" }} kind="stamp" />
      </div>
    </div>
  );
}

function DesktopIcon({
  label,
  style,
  kind,
}: {
  label: string;
  style?: React.CSSProperties;
  kind: "doc" | "image" | "form" | "mic" | "share" | "stamp";
}) {
  return (
    <div className="mac-wp-icon" style={style}>
      <span className={`mac-wp-icon-img mac-wp-icon-${kind}`} aria-hidden />
      <span className="mac-wp-icon-label">{label}</span>
    </div>
  );
}

/* ──────────────────────────── Window primitive ──────────────────────────── */

type WindowProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  reveal?: boolean; // open on scroll-into-view
  size?: "lg" | "md";
};

function MacWindow({ title, subtitle, children, className = "", id, reveal = true, size = "lg" }: WindowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(!reveal);
  useEffect(() => {
    if (!reveal) return;
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setOpen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOpen(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  return (
    <section
      ref={ref}
      id={id}
      className={`mac-window mac-window-${size} ${open ? "is-open" : "is-closed"} ${className}`}
    >
      <div className="mac-titlebar">
        <div className="mac-lights" aria-hidden>
          <span className="mac-light mac-light-r" />
          <span className="mac-light mac-light-y" />
          <span className="mac-light mac-light-g" />
        </div>
        <div className="mac-title">
          <span className="mac-title-name">{title}</span>
          {subtitle && <span className="mac-title-sub">— {subtitle}</span>}
        </div>
        <div className="mac-window-actions" aria-hidden>
          <span className="mac-window-icon" />
          <span className="mac-window-icon" />
          <span className="mac-window-icon" />
        </div>
      </div>
      <div className="mac-window-body">{children}</div>
    </section>
  );
}

/* ──────────────────────────── Hero ──────────────────────────── */

function HeroWindow() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reduced motion → show text immediately, skip the staggered reveal.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    // If the opening cinematic has already played (returning visitor in this
    // session), reveal after a small beat. Otherwise wait for the cinematic
    // to clear so the hero stagger lands in fresh viewport, not behind panels.
    let introSeen = false;
    try {
      introSeen = sessionStorage.getItem("gs_intro_seen") === "1";
    } catch {}

    if (introSeen) {
      const t = window.setTimeout(() => setRevealed(true), 380);
      return () => window.clearTimeout(t);
    }

    const onIntroDone = () => setRevealed(true);
    window.addEventListener("gs:intro-complete", onIntroDone);
    // Safety net: if for any reason the event doesn't fire (intro errored,
    // disabled, etc.), reveal after 6s rather than leaving the hero blank.
    const fallback = window.setTimeout(() => setRevealed(true), 6000);
    return () => {
      window.removeEventListener("gs:intro-complete", onIntroDone);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => { /* autoplay blocked — leave first frame */ });
    if (v.readyState >= 2) tryPlay();
    else {
      const onReady = () => { tryPlay(); v.removeEventListener("loadeddata", onReady); };
      v.addEventListener("loadeddata", onReady);
      return () => v.removeEventListener("loadeddata", onReady);
    }
  }, []);

  return (
    <MacWindow
      title="Welcome.mdx"
      subtitle="GetStamped"
      size="lg"
      reveal={false}
      className="mac-hero"
    >
      <div className="mac-hero-video-wrap">
        <video
          ref={videoRef}
          className="mac-hero-video"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden
        >
          <source src="/newtrain.mp4" type="video/mp4" />
        </video>

        {/* Vignette overlay for text legibility */}
        <div aria-hidden className="mac-hero-vignette" />

        {/* Floating Apple-style analog clock widget */}
        <AnalogClock />


        {/* Text floats over the video, words stagger in */}
        <div className={`mac-hero-content ${revealed ? "is-on" : ""}`}>
          <p className="mac-hero-eyebrow" style={{ "--d": "0ms" } as React.CSSProperties}>
            F-1 visa · International students
          </p>

          <h1 className="mac-hero-h1">
            <WordReveal text="The F-1 visa," baseDelay={120} />
            {" "}
            <i className="mac-hero-h1-italic"><WordReveal text="end to end." baseDelay={120 + 4 * 90} /></i>
          </h1>

          <p className="mac-hero-lead" style={{ "--d": "780ms" } as React.CSSProperties}>
            47 ordered steps. AI document checks. Voice mock interviews scored
            like the real thing. One workspace, until your visa is stamped.
          </p>

          <div className="mac-hero-ctas" style={{ "--d": "900ms" } as React.CSSProperties}>
            <Magnetic strength={0.3} maxPx={10}>
              <Link href="/dashboard" className="mac-cta mac-cta-primary">
                Start free — no card
                <ArrowRight />
              </Link>
            </Magnetic>
            <a href="#workspace" className="mac-cta mac-cta-on-video">
              Open the workspace
              <ArrowDown />
            </a>
          </div>

          <ul className="mac-hero-chips" style={{ "--d": "1040ms" } as React.CSSProperties}>
            <li><Check /> Phase 1 free, forever</li>
            <li><Check /> $19 one-time after that</li>
            <li><Check /> 14-day refund</li>
          </ul>
        </div>
      </div>

    </MacWindow>
  );
}

/* Apple-style analog clock — sweeping second hand, smoothly drifting minute
   and hour hands. State-driven rotation so React owns the DOM (no hand-vs-
   hydration races). Throttled to ~30fps via rAF + last-applied tracking. */
function AnalogClock() {
  // Start at 12:00 on both server and client to avoid hydration mismatch.
  // useEffect snaps to the real time on mount, then drives the sweep.
  const [a, setA] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    setA(angles(new Date()));

    if (reduce) {
      const id = window.setInterval(() => setA(angles(new Date())), 1000);
      return () => window.clearInterval(id);
    }

    let raf = 0;
    let stopped = false;
    let lastFrame = 0;
    const loop = (t: number) => {
      if (stopped) return;
      // ~33ms throttle — second hand still reads as smooth sweep, but we
      // avoid re-rendering React 60×/sec for the analog widget.
      if (t - lastFrame >= 33) {
        lastFrame = t;
        setA(angles(new Date()));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const ticks = Array.from({ length: 60 }, (_, i) => i);
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="hero-clock" aria-hidden="true">
      <div className="hero-clock-face">
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          {/* Tick marks */}
          {ticks.map((i) => {
            const isHour = i % 5 === 0;
            return (
              <line
                key={i}
                x1="100"
                y1={isHour ? 8 : 9}
                x2="100"
                y2={isHour ? 18 : 13}
                stroke={isHour ? "#111" : "#9A9A9A"}
                strokeWidth={isHour ? 2.6 : 1.1}
                strokeLinecap="round"
                transform={`rotate(${i * 6} 100 100)`}
              />
            );
          })}
          {/* Numbers */}
          {numbers.map((n) => {
            const rad = ((n * 30 - 90) * Math.PI) / 180;
            const r = 74;
            // toFixed pins precision so server and client serialize to the
            // exact same string — last-bit float drift caused a hydration
            // mismatch on the "11" label.
            const x = (100 + r * Math.cos(rad)).toFixed(3);
            const y = (100 + r * Math.sin(rad)).toFixed(3);
            return (
              <text
                key={n}
                x={x}
                y={y}
                fontSize="22"
                fontWeight="600"
                fontFamily='-apple-system, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif'
                textAnchor="middle"
                dominantBaseline="central"
                fill="#111"
              >
                {n}
              </text>
            );
          })}
          {/* Hour hand */}
          <line
            x1="100"
            y1="112"
            x2="100"
            y2="58"
            stroke="#111"
            strokeWidth="6"
            strokeLinecap="round"
            transform={`rotate(${a.h} 100 100)`}
          />
          {/* Minute hand */}
          <line
            x1="100"
            y1="115"
            x2="100"
            y2="34"
            stroke="#111"
            strokeWidth="4.5"
            strokeLinecap="round"
            transform={`rotate(${a.m} 100 100)`}
          />
          {/* Second hand */}
          <line
            x1="100"
            y1="118"
            x2="100"
            y2="24"
            stroke="#FF7A1A"
            strokeWidth="1.8"
            strokeLinecap="round"
            transform={`rotate(${a.s} 100 100)`}
          />
          {/* Center pin */}
          <circle cx="100" cy="100" r="4.8" fill="#FF7A1A" />
          <circle cx="100" cy="100" r="1.6" fill="#111" />
        </svg>
      </div>
    </div>
  );
}

function angles(d: Date) {
  const h = (d.getHours() % 12) + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const m = d.getMinutes() + d.getSeconds() / 60 + d.getMilliseconds() / 60_000;
  const s = d.getSeconds() + d.getMilliseconds() / 1000;
  return { h: h * 30, m: m * 6, s: s * 6 };
}

/* Reveal text word by word — each word fades + slides up with a per-word delay.
   Server-safe: when revealed=true it renders the final text immediately so SSR
   matches CSR. The CSS keyframe handles the per-word animation timing. */
function WordReveal({ text, baseDelay = 0, step = 90 }: { text: string; baseDelay?: number; step?: number }) {
  const words = text.split(" ");
  return (
    <span className="mac-word-reveal">
      {words.map((w, i) => (
        <span
          key={i}
          className="mac-word"
          style={{ animationDelay: `${baseDelay + i * step}ms` } as React.CSSProperties}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/* ──────────────────────────── Workspace notebook ──────────────────────────── */

type NotebookPage = {
  id: string;
  label: string;
  file: string;
  title: string;
  body: string;
  bullets: string[];
  Demo: React.ComponentType;
};

const PAGES: readonly NotebookPage[] = [
  {
    id: "why",
    label: "Why?",
    file: "why.mdx",
    title: "The visa is small. The process isn't.",
    body: "From choosing universities to landing in the US, the F-1 has 47 discrete steps. GetStamped turns that mess into an ordered playbook with a deadline, a checklist, and a coach for every single step.",
    bullets: [
      "One ordered timeline, recalculated around your intake date",
      "AI doc checks catch 221(g)-bait mistakes before you upload",
      "Voice mocks scored like the real interview",
      "A view your parents can open without an app",
    ],
    Demo: WhyDemo,
  },
  {
    id: "steps",
    label: "47 Steps",
    file: "playbook.mdx",
    title: "All 47 steps. Ordered. Estimated. Annotated.",
    body: "Each step shows what to do, what to upload, what officers actually check, and how long it takes. Phase 1 is unlocked free so you can see the structure before paying.",
    bullets: [
      "Five phases, forty-seven actionable steps",
      "Estimated time-to-finish for every step",
      "Officer-style notes on the gnarly ones",
    ],
    Demo: StepsDemo,
  },
  {
    id: "documents",
    label: "Documents",
    file: "vault.mdx",
    title: "A vault that reads your paperwork.",
    body: "Upload your I-20, passport, SEVIS receipt, DS-160, and bank statements. Each one is verified by an AI vision model — wrong document, blurry scan, missing field. Errors come back in plain language.",
    bullets: [
      "Private bucket, signed URLs only — never public",
      "Fourteen required documents covered",
      "Interview Day PDF generated when you're ready",
    ],
    Demo: DocumentsDemo,
  },
  {
    id: "mock",
    label: "Mock Interview",
    file: "officer.mdx",
    title: "A consulate, in your browser.",
    body: "The officer asks questions out loud. You answer with your voice. The AI scores you on the four things real officers grade — clarity, confidence, consistency, financial story.",
    bullets: [
      "200+ real-world F-1 questions",
      "Two officer personalities — standard or strict",
      "Transcripts kept; audio never stored",
    ],
    Demo: MockDemo,
  },
  {
    id: "ask",
    label: "Ask AI",
    file: "ask.mdx",
    title: "Ask a specialist any time of day.",
    body: "Type a question and get an answer grounded in the actual F-1 process — not generic web advice. Sources cited every time. Free users get 3 per day; paid plans are unlimited.",
    bullets: [
      "Scope to a step or ask the global model",
      "Sources cited every answer",
      "Threads persist across devices",
    ],
    Demo: AskDemo,
  },
  {
    id: "parents",
    label: "For Parents",
    file: "share.mdx",
    title: "A view your parents will actually understand.",
    body: "Generate a share link from Settings. Parents open it on any phone, no login. They see your phase, your progress, and the interview date — and they can pay for your plan straight from that page.",
    bullets: [
      "Read-only view, never editable",
      "No app, no account, no setup",
      "Pay directly from the share page",
    ],
    Demo: ParentsDemo,
  },
] as const;

function FeaturesWindow() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastIdxRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const narrow = window.matchMedia?.("(max-width: 760px)").matches;
    if (narrow) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = el.offsetHeight - vh;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      let idx = Math.floor(progress * PAGES.length);
      if (idx >= PAGES.length) idx = PAGES.length - 1;
      if (idx < 0) idx = 0;
      if (idx !== lastIdxRef.current) {
        setDirection(idx > lastIdxRef.current ? 1 : -1);
        lastIdxRef.current = idx;
        setActive(idx);
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const page = PAGES[active];

  return (
    <section id="workspace" className="mac-section nb-section">
      <SectionEyebrow label="Workspace" />
      <h2 className="mac-h2">One file, every page.</h2>
      <p className="mac-section-sub">
        Keep scrolling. The notebook flips through Why → 47 Steps → Documents →
        Mock → Ask → Parents — the same pages you&rsquo;ll live inside the app.
      </p>

      {/* Desktop: sticky pin + page-flip */}
      <div className="nb-stage" ref={stageRef}>
        <div className="nb-pin">
          <MacWindow title={page.file} subtitle="GetStamped" size="lg">
            <div className="nb-tabs" aria-hidden="true">
              {PAGES.map((p, i) => (
                <span
                  key={p.id}
                  className={`nb-tab ${i === active ? "is-active" : ""}`}
                >
                  {p.label}
                </span>
              ))}
            </div>
            <div className="nb-spread" data-dir={direction === 1 ? "fwd" : "back"}>
              <span className="nb-binding" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className="nb-binding-hole" />
                ))}
              </span>
              {PAGES.map((p, i) => {
                const D = p.Demo;
                const state = i === active ? "on" : i < active ? "before" : "after";
                return (
                  <div
                    key={p.id}
                    className="nb-page"
                    data-state={state}
                    aria-hidden={state !== "on"}
                  >
                    <div className="nb-text">
                      <h3 className="mac-h3">{p.title}</h3>
                      <p className="mac-body">{p.body}</p>
                      <ul className="mac-bullets">
                        {p.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="nb-demo">
                      <D />
                    </div>
                  </div>
                );
              })}
            </div>
          </MacWindow>
          <NotebookProgress active={active} />
        </div>
      </div>

      {/* Mobile / reduced-motion: stacked vertical */}
      <div className="nb-stack">
        {PAGES.map((p) => {
          const D = p.Demo;
          return (
            <article key={p.id} className="nb-stack-card">
              <p className="nb-stack-label">{p.label}</p>
              <h3 className="mac-h3">{p.title}</h3>
              <p className="mac-body">{p.body}</p>
              <ul className="mac-bullets">
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="nb-demo">
                <D />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function NotebookProgress({ active }: { active: number }) {
  return (
    <div className="nb-progress" aria-hidden="true">
      {PAGES.map((p, i) => (
        <span
          key={p.id}
          className={`nb-progress-tick ${i === active ? "is-active" : ""}`}
        />
      ))}
      <span className="nb-progress-label">
        page {active + 1} / {PAGES.length}
      </span>
    </div>
  );
}

/* ──────────────────────────── Notebook page demos ──────────────────────────── */
/* All animations: SVG / CSS keyframes / divs only. Zero image assets, zero
   video files, zero third-party libs. Every demo loops 4–6s, pauses 1.5–3s
   between cycles, and renders its final state under prefers-reduced-motion. */

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);
  return reduce;
}

/* 1. Why? — 2×2 counting stat cards ------------------------------------- */
function WhyDemo() {
  return (
    <div className="nb-why">
      <CountCard value={47} label="ordered steps" />
      <CountCard value={14} label="documents verified" />
      <CountCard value={200} suffix="+" label="interview questions" />
      <CountCard value={1} suffix="×" label="payment, lifetime" />
    </div>
  );
}

function CountCard({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    let stopped = false;
    let raf = 0;
    let hold: ReturnType<typeof setTimeout> | null = null;
    const run = () => {
      const start = performance.now();
      const dur = 700;
      const tick = (t: number) => {
        if (stopped) return;
        const p = Math.min(1, (t - start) / dur);
        const ease = 1 - Math.pow(1 - p, 3);
        setN(Math.round(ease * value));
        if (p < 1) raf = requestAnimationFrame(tick);
        else
          hold = setTimeout(() => {
            if (stopped) return;
            setN(0);
            run();
          }, 3000);
      };
      raf = requestAnimationFrame(tick);
    };
    run();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (hold) clearTimeout(hold);
    };
  }, [reduce, value]);
  return (
    <div className="nb-stat">
      <p className="nb-stat-n tabular-nums">
        {n}
        {suffix}
      </p>
      <p className="nb-stat-l">{label}</p>
    </div>
  );
}

/* 2. 47 Steps — vertical timeline with traveling dot --------------------- */
function StepsDemo() {
  const phases = [
    "Before your I-20",
    "After I-20 arrival",
    "DS-160 & visa fees",
    "Interview preparation",
    "Post-approval",
  ];
  return (
    <div className="nb-timeline">
      <span className="nb-timeline-rail" aria-hidden="true" />
      <span className="nb-timeline-dot" aria-hidden="true" />
      <ol className="nb-timeline-list">
        {phases.map((p, i) => (
          <li
            key={p}
            className="nb-timeline-node"
            style={{ ["--i" as string]: i } as React.CSSProperties}
          >
            <span className="nb-timeline-pip" aria-hidden="true" />
            <span className="nb-timeline-label">
              <span className="nb-timeline-idx">Phase {i + 1}</span>
              <span className="nb-timeline-name">{p}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 3. Documents — cursor sweeps over checking rows ----------------------- */
function DocumentsDemo() {
  const docs = ["Passport — bio page", "Form I-20", "SEVIS I-901 receipt"];
  return (
    <div className="nb-docs">
      <svg
        className="nb-cursor"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path d="M2 1l4.4 13 2-5.6L13.5 7z" fill="currentColor" />
      </svg>
      {docs.map((d, i) => (
        <div
          key={d}
          className="nb-doc"
          style={{ ["--i" as string]: i } as React.CSSProperties}
        >
          <span className="nb-doc-icon" aria-hidden="true" />
          <span className="nb-doc-name">{d}</span>
          <span className="nb-doc-pill">
            <span className="nb-doc-state nb-doc-checking">Checking…</span>
            <span className="nb-doc-state nb-doc-ok">Checked ✓</span>
          </span>
        </div>
      ))}
      <div className="nb-doc-bar" aria-hidden="true">
        <span className="nb-doc-bar-fill" />
      </div>
    </div>
  );
}

/* 4. Mock Interview — typewriter Q + score count-up + waveform ----------- */
function MockDemo() {
  return (
    <div className="nb-mock">
      <p className="nb-mock-q">
        <span className="nb-mock-q-typewriter">Why this university?</span>
      </p>
      <div className="nb-mock-scores">
        <Score label="Clarity" target={82} />
        <Score label="Confidence" target={74} />
        <Score label="Consistency" target={88} />
        <Score label="Financial" target={67} />
      </div>
      <div className="nb-mock-bars" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="nb-mock-bar"
            style={{ ["--i" as string]: i } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

function Score({ label, target }: { label: string; target: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setN(target);
      return;
    }
    let stopped = false;
    let raf = 0;
    let hold: ReturnType<typeof setTimeout> | null = null;
    const run = () => {
      const start = performance.now();
      const dur = 800;
      const tick = (t: number) => {
        if (stopped) return;
        const p = Math.min(1, (t - start) / dur);
        const ease = 1 - Math.pow(1 - p, 3);
        setN(Math.round(ease * target));
        if (p < 1) raf = requestAnimationFrame(tick);
        else
          hold = setTimeout(() => {
            if (stopped) return;
            setN(0);
            run();
          }, 2500);
      };
      raf = requestAnimationFrame(tick);
    };
    run();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (hold) clearTimeout(hold);
    };
  }, [reduce, target]);
  return (
    <div className="nb-score">
      <span className="nb-score-l">{label}</span>
      <span className="nb-score-v tabular-nums">{n}</span>
    </div>
  );
}

/* 5. Ask AI — chat sequence with typewriter reply ----------------------- */
const ASK_REPLY =
  "Bring originals of your passport, I-20, SEVIS receipt, and DS-160. Mumbai officers also ask to see your own savings — even if your parents are sponsoring.";

function AskDemo() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(reduce ? 3 : 0);
  const [typed, setTyped] = useState(reduce ? ASK_REPLY : "");

  useEffect(() => {
    if (reduce) {
      setStage(3);
      setTyped(ASK_REPLY);
      return;
    }
    let stopped = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let charTimer: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      setStage(0);
      setTyped("");
      timeouts.push(setTimeout(() => !stopped && setStage(1), 800));
      timeouts.push(setTimeout(() => !stopped && setStage(2), 2000));
      timeouts.push(
        setTimeout(() => {
          let i = 0;
          const typeChar = () => {
            if (stopped) return;
            i++;
            setTyped(ASK_REPLY.slice(0, i));
            if (i < ASK_REPLY.length) {
              charTimer = setTimeout(typeChar, 22);
            } else {
              setStage(3);
              timeouts.push(setTimeout(() => !stopped && run(), 2800));
            }
          };
          typeChar();
        }, 2100),
      );
    };
    run();
    return () => {
      stopped = true;
      timeouts.forEach(clearTimeout);
      if (charTimer) clearTimeout(charTimer);
    };
  }, [reduce]);

  return (
    <div className="nb-ask">
      <div className="nb-bubble nb-bubble-user">
        What documents do I take to the consulate?
      </div>
      {stage === 1 && (
        <div className="nb-bubble nb-bubble-typing" aria-label="AI is typing">
          <span />
          <span />
          <span />
        </div>
      )}
      {stage >= 2 && (
        <div className="nb-bubble nb-bubble-ai">
          {typed}
          {stage === 2 && <span className="nb-caret" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}

/* 6. For Parents — phone mockup with progress + chips -------------------- */
function ParentsDemo() {
  const chips = ["Phase 4 of 5", "Mocks done: 2", "Docs 12 / 14"];
  return (
    <div className="nb-parent">
      <div className="nb-phone" role="img" aria-label="Parent view on a phone">
        <span className="nb-phone-notch" aria-hidden="true" />
        <div className="nb-phone-screen">
          <div className="nb-phone-bar" aria-hidden="true">
            <span>9:41</span>
            <span className="nb-phone-bar-r">
              <span />
              <span />
              <span />
            </span>
          </div>
          <p className="nb-parent-eyebrow">Your child&rsquo;s F-1 application</p>
          <p className="nb-parent-title tabular-nums">63% complete</p>
          <div className="nb-parent-bar">
            <span className="nb-parent-bar-fill" />
          </div>
          <p className="nb-parent-meta">30 of 47 steps · interview in 5 days</p>
          <div className="nb-parent-chips">
            {chips.map((c, i) => (
              <span
                key={c}
                className="nb-parent-chip"
                style={{ ["--i" as string]: i } as React.CSSProperties}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Pricing ──────────────────────────── */

function PricingWindow({ currency, earlyBirdClaimed }: { currency: Currency; earlyBirdClaimed: number }) {
  const solo = PRICES.solo[currency];
  const family = PRICES.family[currency];
  const free = PRICES.free[currency];
  return (
    <section id="pricing" className="mac-section">
      <Reveal>
        <SectionEyebrow label="Pricing" />
        <h2 className="mac-h2">One payment. Until you&rsquo;re stamped.</h2>
        <p className="mac-section-sub">
          Phase 1 is free forever. Paid plans are one-time — never a subscription.
          14-day refund, no questions.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <MacWindow title="Pricing.app" subtitle="Lifetime access">
          <div className="mac-pricing-grid">
            <PriceCard
              name="Free"
              current={formatPrice(free)}
              original={null}
              discount={null}
              features={["Phase 1 unlocked", "3 AI questions / day", "1 voice mock / week"]}
              cta="Start free"
              href="/dashboard"
              tone="ghost"
            />
            <TiltCard maxTilt={2} className="mac-plan-tilt">
              <PriceCard
                name="Solo"
                current={formatPrice(solo)}
                original={solo.originalAmount ? `${solo.symbol}${solo.originalAmount}` : null}
                discount={solo.discountPct ?? null}
                features={[
                  "All 47 steps · every phase",
                  "Unlimited AI Q&A",
                  "Unlimited voice mocks",
                  "Document AI checks",
                  "Parent view + share link",
                  "14-day refund",
                ]}
                cta="Get Solo"
                href="/dashboard?plan=solo"
                tone="primary"
                highlight
              />
            </TiltCard>
            <PriceCard
              name="Family"
              current={formatPrice(family)}
              original={family.originalAmount ? `${family.symbol}${family.originalAmount}` : null}
              discount={family.discountPct ?? null}
              features={[
                "Everything in Solo",
                "3 separate student accounts",
                "Shared parent overview",
                "Best for siblings",
              ]}
              cta="Get Family"
              href="/dashboard?plan=family"
              tone="ghost"
            />
          </div>
          {earlyBirdClaimed < 100 && (
            <p className="mac-pricing-foot">
              First 100 students get Solo at <b>{currency === "INR" ? "₹799" : "$19"}</b>. {earlyBirdClaimed} of 100 claimed.
            </p>
          )}
        </MacWindow>
      </Reveal>
    </section>
  );
}

function PriceCard({
  name,
  current,
  original,
  discount,
  features,
  cta,
  href,
  tone,
  highlight = false,
}: {
  name: string;
  current: string;
  original: string | null;
  discount: number | null;
  features: string[];
  cta: string;
  href: string;
  tone: "primary" | "ghost";
  highlight?: boolean;
}) {
  return (
    <div className={`mac-plan ${highlight ? "is-popular" : ""}`}>
      {highlight && <span className="mac-plan-badge">Most popular</span>}
      <p className="mac-plan-name">{name}</p>
      <div className="mac-plan-price">
        <span className="mac-plan-current">{current}</span>
        {original && <span className="mac-plan-original">{original}</span>}
        {discount && <span className="mac-plan-discount">{discount}% off</span>}
      </div>
      <ul className="mac-plan-features">
        {features.map((f) => (
          <li key={f}>
            <Check /> {f}
          </li>
        ))}
      </ul>
      <Link href={href} className={`mac-cta ${tone === "primary" ? "mac-cta-primary" : "mac-cta-ghost"} mac-plan-cta`}>
        {cta} <ArrowRight />
      </Link>
    </div>
  );
}

/* ──────────────────────────── Notes (testimonials) ──────────────────────────── */

/* ──────────────────────────── Spotlight sections ────────────────────────────
   Campsite-style feature explainers: a serif headline up top, a constellation
   of floating product-mock cards in the middle, and a highlighted pull-quote
   underneath. Three of them, one per high-leverage feature. All visuals are
   pure CSS — no image or video assets. */

function DocsSpotlight() {
  return (
    <section className="mac-section spot">
      <p className="spot-eyebrow">Document vault</p>
      <h2 className="spot-h2">
        Catch the mistake that <i>would&rsquo;ve</i> cost you a month.
      </h2>
      <p className="spot-sub">
        Upload your paperwork. An AI vision model checks every page — wrong
        document, blurry scan, missing signature — and tells you in plain
        language. No legalese, no guessing.
      </p>

      <div className="spot-stage spot-stage-docs">
        <article className="spot-card spot-card-doc spot-card-left">
          <span className="spot-doc-icon" aria-hidden />
          <div className="spot-doc-body">
            <p className="spot-doc-name">Passport — bio page</p>
            <p className="spot-doc-sub">Checking…</p>
          </div>
          <span className="spot-pill spot-pill-check">Checking</span>
        </article>

        <article className="spot-card spot-card-doc spot-card-center">
          <span className="spot-doc-icon" aria-hidden />
          <div className="spot-doc-body">
            <p className="spot-doc-name">Form I-20</p>
            <p className="spot-doc-sub">Verified by AI vision · 4 fields read</p>
          </div>
          <span className="spot-pill spot-pill-ok">Checked ✓</span>
        </article>

        <article className="spot-card spot-card-doc spot-card-right">
          <span className="spot-doc-icon" aria-hidden />
          <div className="spot-doc-body">
            <p className="spot-doc-name">Bank statement (6 mo)</p>
            <p className="spot-doc-sub">Cut-off corner on page 3 — re-scan</p>
          </div>
          <span className="spot-pill spot-pill-warn">Fix</span>
        </article>

        <span className="spot-scribble spot-scribble-tl" aria-hidden>
          <svg viewBox="0 0 90 60" width="80" height="56">
            <path
              d="M5 50 C 25 30, 55 18, 80 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M70 22 L82 28 L74 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="spot-scribble-label">auto-checked</span>
        </span>
      </div>

      <SpotQuote
        before="The document checker caught a "
        highlight="missing signature on my financials"
        after=" the day before my appointment. Saved my interview slot."
        name="Diego R."
        meta="Master's · Bogotá"
        initials="DR"
      />
    </section>
  );
}

function MockSpotlight() {
  return (
    <section className="mac-section spot">
      <p className="spot-eyebrow">Mock interview</p>
      <h2 className="spot-h2">
        Hear every question <i>before</i> they ask it.
      </h2>
      <p className="spot-sub">
        A voice-driven officer asks real F-1 questions. You answer out loud.
        The AI scores you on the four things consular officers actually grade.
      </p>

      <div className="spot-stage spot-stage-mock">
        <article className="spot-card spot-card-q spot-card-left">
          <p className="spot-q-meta">Officer Reyes · Question 3 of 8</p>
          <p className="spot-q-text">
            &ldquo;Why this university over others that admitted you?&rdquo;
          </p>
          <div className="spot-q-bars" aria-hidden>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} style={{ ["--i" as string]: i } as React.CSSProperties} />
            ))}
          </div>
        </article>

        <article className="spot-card spot-card-scores spot-card-center">
          <p className="spot-score-title">Your scores</p>
          <ul className="spot-score-list">
            <li><span>Clarity</span><b>82</b></li>
            <li><span>Confidence</span><b>74</b></li>
            <li><span>Consistency</span><b>88</b></li>
            <li><span>Financial story</span><b>67</b></li>
          </ul>
        </article>

        <article className="spot-card spot-card-transcript spot-card-right">
          <p className="spot-trans-eyebrow">Transcript · 00:14</p>
          <p className="spot-trans-body">
            &ldquo;The lab I&rsquo;ll join at Purdue is the only one in the
            US working on solid-state battery <u>thermal runaway</u>…&rdquo;
          </p>
        </article>
      </div>

      <SpotQuote
        before="The voice mock is "
        highlight="brutal in the best way"
        after=". By the real one I&rsquo;d already heard every variant of the question."
        name="Ji-min P."
        meta="Master's · Seoul"
        initials="JP"
      />
    </section>
  );
}

function ParentsSpotlight() {
  return (
    <section className="mac-section spot">
      <p className="spot-eyebrow">Parent share</p>
      <h2 className="spot-h2">
        Your parents see what matters. <i>Nothing else.</i>
      </h2>
      <p className="spot-sub">
        Generate a share link. They open it on any phone — no app, no login.
        They see your phase, your progress, your interview date. They can pay
        for your plan from the same page.
      </p>

      <div className="spot-stage spot-stage-parents">
        <article className="spot-card spot-card-link spot-card-left">
          <p className="spot-link-eyebrow">Share link · read-only</p>
          <p className="spot-link-url">getstamped.app/p/8h2k…rt9</p>
          <div className="spot-link-actions">
            <span className="spot-link-btn">Copy</span>
            <span className="spot-link-btn spot-link-btn-ghost">Revoke</span>
          </div>
        </article>

        <article className="spot-card spot-card-phone spot-card-center">
          <p className="spot-phone-eyebrow">Your child&rsquo;s F-1 application</p>
          <p className="spot-phone-title">63% complete</p>
          <div className="spot-phone-bar"><span /></div>
          <p className="spot-phone-meta">Interview in 5 days · 30 of 47 steps</p>
          <div className="spot-phone-chips">
            <span>Phase 4 of 5</span>
            <span>Mocks: 2</span>
            <span>Docs 12 / 14</span>
          </div>
        </article>

        <article className="spot-card spot-card-pay spot-card-right">
          <p className="spot-pay-eyebrow">Family plan · 2 students</p>
          <p className="spot-pay-amount tabular-nums">$69<span>/once</span></p>
          <span className="spot-pay-btn">Pay for plan</span>
        </article>
      </div>

      <SpotQuote
        before="The share link to my parents "
        highlight="replaced three nightly phone calls"
        after=". They could finally see where I actually was."
        name="Folake A."
        meta="Bachelor's · Lagos"
        initials="FA"
      />
    </section>
  );
}

function SpotQuote({
  before,
  highlight,
  after,
  name,
  meta,
  initials,
}: {
  before: string;
  highlight: string;
  after: string;
  name: string;
  meta: string;
  initials: string;
}) {
  return (
    <figure className="spot-quote">
      <blockquote>
        {before}
        <mark>{highlight}</mark>
        {after}
      </blockquote>
      <figcaption>
        <span className="spot-quote-avatar">{initials}</span>
        <span>
          <b>{name}</b> · {meta}
        </span>
      </figcaption>
    </figure>
  );
}

/* ──────────────────────────── Question shelf (sideways scroll) ──────────────────────────── */
/* Raycast-style horizontal carousel: a row of cards, each showing a real
   consulate question category with its own accent color + tiny visual.
   Native CSS scroll-snap, no JS scroll-jacking. Drag with trackpad / shift+
   wheel / click the arrows. */

type ShelfCard = {
  id: string;
  bg: string; // base dark card background
  glow: string; // accent color used for the radial glow in the corner
  accent: string; // accent text/icon color
  icon: ReactNode;
  title: string;
  body: string;
  visual: ReactNode;
};

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const SHELF_CARDS: ShelfCard[] = [
  {
    id: "mock",
    bg: "#1a0e0a",
    glow: "#FF5B2E",
    accent: "#FF8A5C",
    icon: (
      <Glyph>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </Glyph>
    ),
    title: "Mock Interview",
    body: "200+ real F-1 questions. The officer adapts to your answers.",
    visual: <MockCardVisual />,
  },
  {
    id: "steps",
    bg: "#081814",
    glow: "#2DD4BF",
    accent: "#5EEAD4",
    icon: (
      <Glyph>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 12l3 3 5-6" />
      </Glyph>
    ),
    title: "47 Steps",
    body: "Every step from I-20 to visa stamp. Nothing missing, nothing hidden.",
    visual: <StepsCardVisual />,
  },
  {
    id: "docs",
    bg: "#16120a",
    glow: "#F59E0B",
    accent: "#FCD34D",
    icon: (
      <Glyph>
        <path d="M8 4h7l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M15 4v5h5" />
        <path d="M9 14h6" />
        <path d="M9 17h4" />
      </Glyph>
    ),
    title: "Documents",
    body: "Upload once. Auto-organized. Interview Day PDF in one click.",
    visual: <DocsCardVisual />,
  },
  {
    id: "parent",
    bg: "#0c0f1a",
    glow: "#818CF8",
    accent: "#A5B4FC",
    icon: (
      <Glyph>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </Glyph>
    ),
    title: "Parent View",
    body: "One link. No login. They see your progress live.",
    visual: <ParentCardVisual />,
  },
];

function MockCardVisual() {
  return (
    <div className="qs-v qs-v-mock">
      <div className="qs-v-bubble qs-v-bubble-l">
        Why did you choose this university specifically?
      </div>
      <div className="qs-v-bubble qs-v-bubble-r">
        I&rsquo;m joining Prof. Mehta&rsquo;s lab at Purdue — her work on
        solid-state batteries directly aligns with…
      </div>
      <div className="qs-v-scores">
        <span>Clarity <b className="tabular-nums">94</b></span>
        <span>Confidence <b className="tabular-nums">88</b></span>
        <span>Specificity <b className="tabular-nums">91</b></span>
      </div>
    </div>
  );
}

function StepsCardVisual() {
  const phases = [
    { n: "01", name: "Before I-20", status: "done", count: "6 steps" },
    { n: "02", name: "After I-20", status: "done", count: "8 steps" },
    { n: "03", name: "DS-160", status: "progress", count: "12 steps" },
    { n: "04", name: "Interview Prep", status: "locked", count: "14 steps" },
    { n: "05", name: "Post-approval", status: "locked", count: "7 steps" },
  ];
  return (
    <ol className="qs-v qs-v-steps">
      {phases.map((p) => (
        <li key={p.n} className={`qs-v-step qs-v-step-${p.status}`}>
          <span className="qs-v-step-n">{p.n}</span>
          <span className="qs-v-step-name">{p.name}</span>
          <span className="qs-v-step-icon" aria-hidden="true">
            {p.status === "done" ? (
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l3 3 7-7" />
              </svg>
            ) : p.status === "progress" ? (
              <span className="qs-v-step-progress-bar"><span style={{ width: "45%" }} /></span>
            ) : (
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            )}
          </span>
          <span className="qs-v-step-count">{p.count}</span>
        </li>
      ))}
    </ol>
  );
}

function DocsCardVisual() {
  const docs = [
    { name: "I-20 Form (signed)", status: "done", meta: "Uploaded 2 days ago" },
    { name: "DS-160 Confirmation", status: "done", meta: "Uploaded today" },
    { name: "Bank Statement", status: "todo", meta: "Upload now →" },
    { name: "Passport Copy", status: "todo", meta: "Upload now →" },
  ];
  return (
    <div className="qs-v qs-v-docs">
      <ul className="qs-v-doc-list">
        {docs.map((d) => (
          <li key={d.name} className={`qs-v-doc qs-v-doc-${d.status}`}>
            <span className="qs-v-doc-dot" aria-hidden="true" />
            <span className="qs-v-doc-text">
              <b>{d.name}</b>
              <small>{d.meta}</small>
            </span>
          </li>
        ))}
      </ul>
      <div className="qs-v-doc-progress" aria-hidden="true">
        <span style={{ width: "67%" }} />
      </div>
      <p className="qs-v-doc-summary">6 of 9 documents ready</p>
    </div>
  );
}

function ParentCardVisual() {
  return (
    <div className="qs-v qs-v-parent">
      <p className="qs-v-parent-title">Rohan&rsquo;s F-1 Application</p>
      <div className="qs-v-parent-bar" aria-hidden="true">
        <span style={{ width: "49%" }} />
      </div>
      <p className="qs-v-parent-meta">
        <b className="tabular-nums">23 of 47 steps</b> · Phase 3: DS-160 &amp; fees
      </p>
      <ul className="qs-v-parent-act">
        <li>
          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="qs-v-parent-check"><path d="M3 8l3 3 7-7" /></svg>
          Mock interview completed
          <small>2h ago</small>
        </li>
        <li>
          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="qs-v-parent-check"><path d="M3 8l3 3 7-7" /></svg>
          Financial docs uploaded
          <small>yesterday</small>
        </li>
        <li className="qs-v-parent-now">
          <span className="qs-v-parent-now-dot" />
          Interview question practice
          <small>now</small>
        </li>
      </ul>
      <div className="qs-v-parent-live">
        <span className="qs-v-parent-live-dot" />
        Updates in real time
      </div>
    </div>
  );
}

function QuestionShelf() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".qs-card");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section className="mac-section qs">
      <header className="qs-head">
        <div className="qs-head-text">
          <p className="qs-eyebrow">Question bank</p>
          <h2 className="qs-h2">There&rsquo;s a question for that.</h2>
          <p className="qs-sub">
            Two-hundred real F-1 questions. By the day of your interview,
            you&rsquo;ll have already heard every one of them.
          </p>
        </div>
        <div className="qs-controls" aria-hidden="true">
          <button
            type="button"
            className="qs-ctrl"
            onClick={() => scrollBy(-1)}
            aria-label="Previous"
          >
            ←
          </button>
          <button
            type="button"
            className="qs-ctrl"
            onClick={() => scrollBy(1)}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </header>

      <div className="qs-scroller" ref={scrollerRef}>
        {SHELF_CARDS.map((c) => (
          <article
            key={c.id}
            className="qs-card"
            style={
              {
                ["--bg" as string]: c.bg,
                ["--glow" as string]: c.glow,
                ["--accent" as string]: c.accent,
              } as React.CSSProperties
            }
          >
            <span className="qs-card-glow" aria-hidden="true" />
            <header className="qs-card-head">
              <span className="qs-card-icon" aria-hidden="true">{c.icon}</span>
              <span className="qs-card-arrow" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12 12 4" />
                  <path d="M6 4h6v6" />
                </svg>
              </span>
            </header>
            <h3 className="qs-card-title">{c.title}</h3>
            <p className="qs-card-body">{c.body}</p>
            <span className="qs-card-divider" aria-hidden="true" />
            <div className="qs-card-visual">{c.visual}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────── Reviews.app marquee ──────────────────────────── */

type Review = {
  name: string;
  role: string;
  quote: string;
  tint: string;
  interviewMin: number;
};

const REVIEWS_ROW_A: Review[] = [
  { name: "Aarav S.", role: "Bachelor's · Mumbai", quote: "Went from zero idea about SEVIS to a packed I-20 folder in a weekend. The 47-step file is just… the answer.", tint: "#FFE4D8", interviewMin: 4 },
  { name: "Ji-min P.", role: "Master's · Seoul", quote: "Mock interview is brutal in the best way. By the real one I'd already heard every variant of the question.", tint: "#E8EEFB", interviewMin: 3 },
  { name: "Folake A.", role: "Bachelor's · Lagos", quote: "Share link to my parents replaced three nightly phone calls. They could finally see where I actually was.", tint: "#E9F4EA", interviewMin: 6 },
  { name: "Diego R.", role: "Master's · Bogotá", quote: "Document checker caught a missing signature on my financial docs the day before my appointment. Saved my slot.", tint: "#FFF3D1", interviewMin: 5 },
  { name: "Mei L.", role: "Bachelor's · Taipei", quote: "I'm not a planner. This made me one for three months. Stamped on first try.", tint: "#F1E6FB", interviewMin: 4 },
];

const REVIEWS_ROW_B: Review[] = [
  { name: "Priya K.", role: "Master's · Hyderabad", quote: "The Ask AI is the only thing that didn't gaslight me on the F-1 maintenance rules. Cited the source every time.", tint: "#FFE4D8", interviewMin: 7 },
  { name: "Tomás G.", role: "Bachelor's · Lima", quote: "Walking into the consulate felt almost familiar. The first-person prep is the real trick.", tint: "#E8EEFB", interviewMin: 5 },
  { name: "Sanaa B.", role: "Master's · Casablanca", quote: "I was rejected once before. With GetStamped I went back, answered cleanly, and got approved in three minutes.", tint: "#FFF3D1", interviewMin: 3 },
  { name: "Kwame O.", role: "Bachelor's · Accra", quote: "Parents page was the unlock. My dad still re-reads it before every call.", tint: "#E9F4EA", interviewMin: 6 },
  { name: "Yusuf T.", role: "Master's · Istanbul", quote: "Feels like a calm app, not a course. I never dreaded opening it, which is why I actually finished.", tint: "#F1E6FB", interviewMin: 4 },
];

function ReviewsMarquee() {
  return (
    <section id="reviews" className="mac-section mac-reviews">
      <Reveal>
        <SectionEyebrow label="Reviews.app" />
        <h2 className="mac-h2">What students are saying.</h2>
        <p className="mac-section-sub">Real students. Real interviews. All approved.</p>
      </Reveal>

      <Reveal delay={120}>
        <div className="mac-marquee" aria-label="Student reviews">
          <div className="mac-marquee-row">
            <div className="mac-marquee-track mac-marquee-track--ltr">
              {[...REVIEWS_ROW_A, ...REVIEWS_ROW_A].map((r, i) => (
                <ReviewCard key={`a-${i}`} r={r} />
              ))}
            </div>
          </div>
          <div className="mac-marquee-row">
            <div className="mac-marquee-track mac-marquee-track--rtl">
              {[...REVIEWS_ROW_B, ...REVIEWS_ROW_B].map((r, i) => (
                <ReviewCard key={`b-${i}`} r={r} />
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* Five small persimmon stars, stagger-pop on first card visibility. */
function StarRow({ on }: { on: boolean }) {
  return (
    <span className="mac-review-stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          width="12"
          height="12"
          aria-hidden="true"
          className="mac-review-star"
          style={{
            transform: on ? "scale(1)" : "scale(0.6)",
            opacity: on ? 1 : 0,
            transition: `transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms,
                         opacity 280ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms`,
          }}
        >
          <path
            d="M6 0.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L6 9.2 2.6 11l.7-3.8L.5 4.5l3.8-.5L6 .5z"
            fill="#FF5B2E"
          />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [starsOn, setStarsOn] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStarsOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarsOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.7 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const initials = r.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TiltCard maxTilt={1.5} className="mac-review-tilt">
      <article
        ref={cardRef}
        className="mac-review-card"
        aria-label={`${r.name}, ${r.role}, 5-star review, ${r.interviewMin} minute interview`}
      >
        <div className="mac-review-top">
          <StarRow on={starsOn} />
          <span className="mac-review-chip tabular-nums">
            {r.interviewMin} min interview
          </span>
        </div>

        <p className="mac-review-quote">
          <span className="mac-review-quote-mark" aria-hidden="true">&ldquo;</span>
          {r.quote}
        </p>

        <span className="mac-review-hairline" aria-hidden="true" />

        <div className="mac-review-foot">
          <span className="mac-review-avatar" style={{ background: r.tint }}>
            {initials}
          </span>
          <div className="mac-review-meta">
            <p className="mac-review-name">{r.name}</p>
            <p className="mac-review-role">{r.role}</p>
          </div>
          <span className="mac-review-stamp" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="11" height="11">
              <path d="M2.5 6.5l2.4 2.4L9.5 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Stamped
          </span>
        </div>
      </article>
    </TiltCard>
  );
}

/* ──────────────────────────── Notes wall ──────────────────────────── */

function NotesWall() {
  const notes = [
    {
      q: "I would've never figured out the SEVIS thing without this. Two phone calls saved me a week.",
      who: "Aarav · Bachelor's · Mumbai",
    },
    {
      q: "The voice mock is brutal in a good way. I sounded confident in the actual interview because I'd already heard the question 20 times.",
      who: "Ji-min · Master's · Seoul",
    },
    {
      q: "My parents finally stopped calling me every day. The share link does the explaining for me.",
      who: "Folake · Bachelor's · Lagos",
    },
  ];
  return (
    <section id="notes" className="mac-section">
      <SectionEyebrow label="Notes.app" />
      <h2 className="mac-h2">What students wrote down.</h2>
      <div className="mac-notes-grid">
        {notes.map((n, i) => (
          <article key={i} className="mac-note">
            <p className="mac-note-quote">{n.q}</p>
            <p className="mac-note-who">— {n.who}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────── FAQ ──────────────────────────── */

function FAQWindow() {
  const items = [
    {
      tag: "Pricing",
      q: "Is this a subscription?",
      a: "No. One payment, lifetime access until your visa is stamped. We never auto-charge.",
    },
    {
      tag: "Trust",
      q: "Do you guarantee my visa will be approved?",
      a: "No tool can — the officer decides. What we guarantee: you'll walk in knowing every step, every document, every question.",
    },
    {
      tag: "Pricing",
      q: "What's free?",
      a: "Phase 1 (6 steps), 3 AI questions per day, 1 voice mock per week. Forever. No card required.",
    },
    {
      tag: "Product",
      q: "How is the document AI different from a friend looking at my PDFs?",
      a: "It's trained on the specific failure modes officers cite in 221(g)s — cut-off edges, missing MRZ, DS-160 mismatches. Most of those errors look fine to a human eye.",
    },
    {
      tag: "Parents",
      q: "Can my parents pay for me?",
      a: "Yes. From their Parent View page they can pay directly — we send them a secure payment link within an hour.",
    },
    {
      tag: "Refund",
      q: "What if I don't get approved?",
      a: "14-day full refund. No questions, no exit interview.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mac-section faq2">
      <Reveal>
        <header className="faq2-head">
          <SectionEyebrow label="Q&A.txt" />
          <h2 className="mac-h2 faq2-h2">Questions students ask first.</h2>
          <p className="faq2-sub">
            Short answers. No corporate hedging. If you have a question that
            isn&rsquo;t here, write to{" "}
            <a href="mailto:getstamped.online@gmail.com">
              getstamped.online@gmail.com
            </a>{" "}
            and a human will reply.
          </p>
        </header>
      </Reveal>

      <ol className="faq2-list">
        {items.map((it, i) => {
          const isOpen = open === i;
          const num = String(i + 1).padStart(2, "0");
          return (
            <li
              key={i}
              className={`faq2-item ${isOpen ? "is-open" : ""}`}
              data-tag={it.tag.toLowerCase()}
            >
              <button
                type="button"
                className="faq2-q"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="faq2-num tabular-nums">{num}</span>
                <span className="faq2-q-body">
                  <span className="faq2-tag">{it.tag}</span>
                  <span className="faq2-q-text">{it.q}</span>
                </span>
                <span className="faq2-toggle" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </span>
              </button>
              <div
                className="faq2-wrap"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                aria-hidden={!isOpen}
              >
                <div className="faq2-inner">
                  <p className="faq2-a">{it.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ──────────────────────────── Stamped closer (passport hero) ──────────────────────────── */

function StampedCloser() {
  return (
    <section className="mac-section closer" aria-labelledby="closer-h2">
      {/* Persimmon cursor-following radial — only on this final CTA section. */}
      <CloserGlow />

      <Reveal>
        <p className="closer-eyebrow">Stamped.</p>
        <h2 id="closer-h2" className="closer-h2">
          Take the <i>stamped</i> way.
        </h2>
        <p className="closer-sub">
          Forty-seven steps. Phase 1 free forever. Upgrade only when you hit
          Phase 2.
        </p>
      </Reveal>

      <Reveal delay={140}>
        <div className="closer-stage">
          <picture>
            <source srcSet="/pass.png" type="image/png" />
            <img
              src="/pass.png"
              alt="A navy-blue passport with the GetStamped arrow embossed on the cover, a freshly-inked persimmon F-1 student visa stamp glowing from the open page"
              className="closer-img"
              loading="lazy"
              decoding="async"
              width={1664}
              height={936}
            />
          </picture>
        </div>
      </Reveal>

      <Reveal delay={260}>
        <div className="closer-ctas">
          <Magnetic strength={0.35} maxPx={12}>
            <Link href="/sign-up" className="closer-cta closer-cta-primary">
              Start free
            </Link>
          </Magnetic>
          <Link href="#pricing" className="closer-cta closer-cta-ghost">
            See pricing
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* Cursor-following radial glow, scoped to this section only. Listens on the
   section element (not window) so it adds zero cost on the rest of the page.
   Lerped position for smoothness. */
function CloserGlow() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const section = el.closest("section");
    if (!section) return;

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      targetRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;
      el.style.background = `radial-gradient(600px circle at ${currentRef.current.x}px ${currentRef.current.y}px, rgba(255,91,46,0.06), transparent 65%)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="closer-glow"
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    />
  );
}

/* ──────────────────────────── Launch CTA ──────────────────────────── */

function LaunchWindow() {
  return (
    <section className="mac-section">
      <MacWindow title="Launch.app" subtitle="One last thing">
        <div className="mac-launch">
          <p className="mac-eyebrow">Ready?</p>
          <h2 className="mac-h1 mac-h1-tight">
            Forty-seven steps. One workspace. <span className="mac-h1-italic">Start free.</span>
          </h2>
          <p className="mac-lead">
            No card required. Phase 1 unlocked forever. Upgrade when you hit Phase 2.
          </p>
          <div className="mac-cta-row mac-cta-row-center">
            <Link href="/dashboard" className="mac-cta mac-cta-primary mac-cta-big">
              Start free — no card <ArrowRight />
            </Link>
          </div>
        </div>
      </MacWindow>
    </section>
  );
}

/* ──────────────────────────── Atoms ──────────────────────────── */

function SectionEyebrow({ label }: { label: string }) {
  return <p className="mac-section-eyebrow">{label}</p>;
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 13l7 7 7-7" />
    </svg>
  );
}
function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms ease" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ──────────────────────────── Styles ──────────────────────────── */

function Styles() {
  return (
    <style>{`
      /* ============== root + menubar ============== */
      .mac-root {
        position: relative;
        min-height: 100vh;
        background: var(--color-paper);
        color: var(--color-ink);
        /* overflow-x: clip keeps the marquee + wallpaper from spilling sideways
           without creating a scroll container (which would break the workspace
           sticky scroll-tube against the viewport). */
        overflow-x: clip;
      }
      .mac-menubar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(247, 243, 236, 0.78);
        backdrop-filter: saturate(160%) blur(12px);
        -webkit-backdrop-filter: saturate(160%) blur(12px);
        border-bottom: 1px solid var(--color-border-soft);
      }
      .mac-menubar-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 6px 18px;
        /* 3-column grid: brand left, nav truly centered, right cluster right.
           Side columns are 1fr so the center cell sits at the exact midpoint
           regardless of brand/right widths. */
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 28px;
        font-size: 14px;
      }
      .mac-menubar-inner > .mac-brand { justify-self: start; }
      .mac-menubar-inner > .mac-menus { justify-self: center; }
      .mac-menubar-inner > .mac-menu-right { justify-self: end; }
      .mac-brand {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-display-stack);
        font-size: 15px;
        letter-spacing: -0.01em;
        color: var(--color-ink);
        text-decoration: none;
      }
      .mac-menus {
        display: none;
        gap: 22px;
        color: var(--color-ink);
        font-size: 14.5px;
        font-weight: 500;
      }
      .mac-menus a { color: var(--color-ink); text-decoration: none; opacity: 0.78; }
      .mac-menus a:hover { opacity: 1; }
      @media (min-width: 760px) { .mac-menus { display: flex; } }
      .mac-menu-right {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        color: var(--color-ink-soft);
      }
      .mac-status-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--color-persimmon);
        box-shadow: 0 0 0 2px rgba(255,91,46,0.18);
      }
      .mac-time {
        font-feature-settings: "tnum";
        font-size: 12px;
        color: var(--color-ink-soft);
      }
      .mac-signin {
        font-size: 12px;
        color: var(--color-ink);
        text-decoration: none;
        padding: 4px 10px;
        border-radius: 8px;
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
      }
      .mac-signin:hover { border-color: var(--color-persimmon); color: var(--color-persimmon-deep); }
      .mac-signup {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-paper-soft);
        text-decoration: none;
        padding: 4px 12px;
        border-radius: 8px;
        background: var(--color-persimmon);
        border: 1px solid var(--color-persimmon-deep);
        transition: background 160ms ease, transform 160ms ease;
      }
      .mac-signup:hover { background: var(--color-persimmon-deep); transform: translateY(-1px); }

      /* ============== wallpaper ============== */
      .mac-wallpaper {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background:
          radial-gradient(80% 60% at 50% 8%, rgba(255,91,46,0.06), transparent 70%),
          linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-deep) 100%);
      }
      .mac-wp-glow {
        position: absolute;
        left: 50%; top: -10%;
        width: 80vw; height: 60vh;
        transform: translateX(-50%);
        background: radial-gradient(closest-side, rgba(255,91,46,0.10), transparent 70%);
        filter: blur(10px);
      }
      .mac-wp-grid {
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(circle at 1px 1px, rgba(28,27,26,0.05) 1px, transparent 0);
        background-size: 28px 28px;
        opacity: 0.55;
      }
      .mac-wp-icons {
        position: absolute; inset: 0;
        display: none;
      }
      @media (min-width: 1120px) { .mac-wp-icons { display: block; } }
      .mac-wp-icon {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        width: 86px;
        opacity: 0.55;
        font-size: 11px;
        color: var(--color-ink-soft);
        text-align: center;
        letter-spacing: -0.01em;
      }
      .mac-wp-icon-img {
        width: 44px; height: 54px; border-radius: 7px;
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        box-shadow: 0 6px 18px -8px rgba(28,27,26,0.15);
        position: relative;
        display: block;
      }
      .mac-wp-icon-img::after {
        content: "";
        position: absolute; right: 6px; top: 6px;
        width: 18px; height: 4px; border-radius: 2px; background: var(--color-persimmon-tint);
      }
      .mac-wp-icon-stamp::before {
        content: ""; position: absolute; left: 8px; bottom: 8px;
        width: 28px; height: 28px; border-radius: 50%;
        border: 2px solid var(--color-persimmon);
        background: rgba(255,91,46,0.10);
      }
      .mac-wp-icon-mic::before {
        content: ""; position: absolute; left: 17px; bottom: 10px;
        width: 10px; height: 22px; border-radius: 6px; background: var(--color-ink);
      }
      .mac-wp-icon-share::before {
        content: ""; position: absolute; left: 12px; top: 16px;
        width: 20px; height: 20px; border: 2px solid var(--color-ink); border-radius: 50%;
      }
      .mac-wp-icon-image::before {
        content: ""; position: absolute; inset: 8px;
        background: linear-gradient(180deg, var(--color-persimmon-tint), var(--color-paper-deep));
        border-radius: 4px;
      }
      .mac-wp-icon-form::before {
        content: ""; position: absolute; left: 10px; right: 10px; top: 10px;
        height: 3px; background: var(--color-ink-soft);
        box-shadow: 0 6px 0 var(--color-ink-soft), 0 12px 0 var(--color-ink-soft);
      }
      .mac-wp-icon-doc::before {
        content: ""; position: absolute; left: 10px; right: 10px; top: 12px;
        height: 2px; background: var(--color-ink-soft);
        box-shadow: 0 5px 0 var(--color-ink-soft), 0 10px 0 var(--color-ink-soft), 0 15px 0 var(--color-ink-soft);
      }

      /* ============== stage / sections ============== */
      .mac-stage {
        position: relative;
        z-index: 1;
        max-width: 1180px;
        margin: 0 auto;
        padding: 60px 20px 80px;
        display: flex;
        flex-direction: column;
        gap: 80px;
      }
      .mac-section {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .mac-section-eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--color-persimmon-deep);
      }
      .mac-section-sub {
        margin: 0;
        font-size: 15px;
        color: var(--color-ink-soft);
        max-width: 60ch;
        line-height: 1.6;
      }
      .mac-h2 {
        font-family: var(--font-display-stack);
        font-weight: 400;
        font-size: clamp(28px, 4vw, 42px);
        letter-spacing: -0.02em;
        line-height: 1.1;
        color: var(--color-ink);
        margin: 0;
      }

      /* ============== window primitive ============== */
      .mac-window {
        border-radius: 14px;
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        box-shadow:
          0 30px 60px -30px rgba(28,27,26,0.18),
          0 10px 26px -16px rgba(28,27,26,0.10),
          inset 0 1px 0 rgba(255,255,255,0.7);
        overflow: hidden;
        transform-origin: top center;
        transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .mac-window.is-closed {
        opacity: 0;
        transform: scale(0.96) translateY(14px);
      }
      .mac-window.is-open {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .mac-titlebar {
        height: 36px;
        background: linear-gradient(180deg, #F2EBDC 0%, #EDE6D5 100%);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        padding: 0 12px;
        gap: 8px;
        position: relative;
      }
      .mac-lights { display: inline-flex; gap: 7px; }
      .mac-light {
        width: 12px; height: 12px; border-radius: 50%;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
      }
      .mac-light-r { background: #FF5F57; }
      .mac-light-y { background: #FEBC2E; }
      .mac-light-g { background: #28C840; }
      .mac-title {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        color: var(--color-ink-soft);
        display: inline-flex;
        gap: 6px;
        align-items: baseline;
        white-space: nowrap;
      }
      .mac-title-name { font-weight: 600; color: var(--color-ink); }
      .mac-title-sub { color: var(--color-muted); }
      .mac-window-actions { margin-left: auto; display: inline-flex; gap: 6px; }
      .mac-window-icon {
        width: 14px; height: 14px; border-radius: 4px;
        background: var(--color-paper-deep);
        border: 1px solid var(--color-border);
      }
      .mac-window-body { padding: 28px; }
      @media (min-width: 800px) { .mac-window-body { padding: 36px; } }

      /* ============== hero ============== */
      .mac-hero { margin-top: 36px; }
      .mac-hero .mac-window-body { padding: 0 !important; }

      .mac-hero-video-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        max-height: 78vh;
        min-height: 460px;
        overflow: hidden;
        background: #0A0D11;
      }
      .mac-hero-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
        animation: mac-hero-video-fade 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      @keyframes mac-hero-video-fade {
        from { opacity: 0; transform: scale(1.04); }
        to { opacity: 1; transform: scale(1); }
      }
      .mac-hero-vignette {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background:
          radial-gradient(120% 100% at 50% 50%, transparent 30%, rgba(10,13,17,0.55) 100%),
          linear-gradient(180deg, rgba(10,13,17,0.45) 0%, transparent 28%, transparent 60%, rgba(10,13,17,0.75) 100%);
      }
      /* Apple-style analog clock — floats in the top-right of the hero. */
      .hero-clock {
        position: absolute;
        top: clamp(20px, 3.5vw, 40px);
        right: clamp(20px, 3.5vw, 40px);
        z-index: 3;
        width: clamp(112px, 11vw, 144px);
        height: clamp(112px, 11vw, 144px);
        padding: 8px;
        border-radius: 26px;
        background:
          linear-gradient(180deg, #2a2a2a 0%, #0d0d0d 100%);
        box-shadow:
          0 22px 50px -22px rgba(0, 0, 0, 0.6),
          0 6px 14px -6px rgba(0, 0, 0, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0 0 1px rgba(255, 255, 255, 0.05);
        animation: hero-clock-float 9s ease-in-out infinite;
      }
      .hero-clock-face {
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
      }
      @keyframes hero-clock-float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-4px); }
      }
      @media (max-width: 640px) {
        .hero-clock { top: 14px; right: 14px; width: 96px; height: 96px; border-radius: 22px; padding: 6px; }
        .hero-clock-face { border-radius: 16px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .hero-clock { animation: none; }
      }

      .mac-hero-content {
        position: relative;
        z-index: 2;
        padding: clamp(28px, 6vw, 64px);
        max-width: 760px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 18px;
      }

      .mac-hero-eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: rgba(255, 91, 46, 0.95);
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.6);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms),
                    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
      }
      .mac-hero-content.is-on .mac-hero-eyebrow { opacity: 1; transform: translateY(0); }

      .mac-hero-h1 {
        font-family: var(--font-display-stack);
        font-weight: 400;
        font-size: clamp(38px, 6.5vw, 72px);
        line-height: 1.02;
        letter-spacing: -0.025em;
        color: #FFFFFF;
        text-shadow: 0 2px 24px rgba(0, 0, 0, 0.55), 0 1px 0 rgba(0, 0, 0, 0.35);
        margin: 0;
        max-width: 18ch;
      }
      .mac-hero-h1-italic {
        font-style: italic;
        color: #FFE9A8;
      }
      /* Word-by-word reveal: each <span class="mac-word"> animates with its own
         animation-delay (set inline via style). */
      .mac-word-reveal {
        display: inline;
      }
      .mac-word {
        display: inline-block;
        opacity: 0;
        transform: translateY(0.55em);
        animation: mac-word-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      @keyframes mac-word-rise {
        from { opacity: 0; transform: translateY(0.55em); }
        to { opacity: 1; transform: translateY(0); }
      }

      .mac-hero-lead {
        margin: 0;
        max-width: 56ch;
        font-size: clamp(15px, 1.4vw, 18px);
        line-height: 1.6;
        color: rgba(244, 239, 230, 0.88);
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.55);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms),
                    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
      }
      .mac-hero-content.is-on .mac-hero-lead { opacity: 1; transform: translateY(0); }

      .mac-hero-ctas {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 6px;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms),
                    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
      }
      .mac-hero-content.is-on .mac-hero-ctas { opacity: 1; transform: translateY(0); }

      .mac-cta-on-video {
        background: rgba(255, 255, 255, 0.08);
        color: #FFFFFF;
        border: 1px solid rgba(255, 255, 255, 0.30);
        backdrop-filter: blur(8px);
      }
      .mac-cta-on-video:hover {
        background: rgba(255, 255, 255, 0.16);
        border-color: rgba(255, 255, 255, 0.55);
      }

      .mac-hero-chips {
        margin: 8px 0 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        font-size: 12px;
        color: rgba(244, 239, 230, 0.85);
        text-shadow: 0 1px 8px rgba(0, 0, 0, 0.55);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms),
                    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
      }
      .mac-hero-content.is-on .mac-hero-chips { opacity: 1; transform: translateY(0); }
      .mac-hero-chips li { display: inline-flex; align-items: center; gap: 6px; }
      .mac-hero-chips svg { color: #FFE9A8; }

      /* ============== legacy hero (no longer used; kept tidy) ============== */
      .mac-hero-old { margin-top: 36px; }
      .mac-hero-old .mac-window-body {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
        align-items: center;
      }
      @media (min-width: 920px) {
        .mac-hero-old .mac-window-body { grid-template-columns: 1.05fr 0.95fr; gap: 48px; }
      }
      .mac-hero-inner { display: flex; flex-direction: column; gap: 18px; }
      .mac-eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--color-persimmon-deep);
      }
      .mac-h1 {
        font-family: var(--font-display-stack);
        font-weight: 400;
        font-size: clamp(36px, 6vw, 64px);
        line-height: 1.04;
        letter-spacing: -0.025em;
        color: var(--color-ink);
        margin: 0;
      }
      .mac-h1-tight { font-size: clamp(28px, 4.8vw, 48px); }
      .mac-h1-italic { font-style: italic; color: var(--color-persimmon-deep); }
      .mac-lead {
        margin: 0;
        font-size: 16px;
        line-height: 1.6;
        color: var(--color-ink-soft);
        max-width: 56ch;
      }
      .mac-cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 6px;
      }
      .mac-cta-row-center { justify-content: center; }
      .mac-cta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 11px 18px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: -0.005em;
        text-decoration: none;
        transition: background 200ms ease, transform 120ms ease, color 200ms ease, border 200ms ease;
        border: 1px solid transparent;
      }
      .mac-cta-primary {
        background: var(--color-persimmon);
        color: var(--color-paper-soft);
        box-shadow: 0 6px 16px -6px rgba(217,70,30,0.4);
      }
      .mac-cta-primary:hover { background: var(--color-persimmon-deep); }
      .mac-cta-primary:active { transform: scale(0.98); }
      .mac-cta-ghost {
        background: var(--color-paper-soft);
        color: var(--color-ink);
        border-color: var(--color-border);
      }
      .mac-cta-ghost:hover { border-color: var(--color-persimmon); color: var(--color-persimmon-deep); }
      .mac-cta-big { padding: 14px 22px; font-size: 15px; }
      .mac-hero-meta {
        margin: 8px 0 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        font-size: 12px;
        color: var(--color-ink-soft);
      }
      .mac-hero-meta li { display: inline-flex; align-items: center; gap: 6px; }
      .mac-hero-meta svg { color: var(--color-persimmon); }

      /* hero preview window inside the window */
      .mac-hero-preview { display: flex; justify-content: center; }
      .mac-preview-window {
        width: 100%;
        max-width: 460px;
        border-radius: 12px;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        box-shadow:
          0 24px 40px -22px rgba(28,27,26,0.30),
          inset 0 1px 0 rgba(255,255,255,0.7);
        overflow: hidden;
      }
      .mac-preview-titlebar {
        height: 30px;
        display: flex; align-items: center; gap: 6px;
        padding: 0 10px;
        background: linear-gradient(180deg, #F2EBDC 0%, #EDE6D5 100%);
        border-bottom: 1px solid var(--color-border);
      }
      .mac-preview-title {
        margin-left: 8px;
        font-size: 11px; color: var(--color-ink-soft);
        font-weight: 600;
      }
      .mac-preview-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
      .mac-preview-row {
        display: inline-flex; align-items: center; gap: 10px;
        font-size: 13px; color: var(--color-ink);
      }
      .mac-preview-tick {
        width: 14px; height: 14px; border-radius: 50%;
        background: var(--color-ink); color: var(--color-paper-soft);
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 9px;
      }
      .mac-preview-tick::after { content: "✓"; font-weight: 800; }
      .mac-preview-row-done { color: var(--color-ink-soft); text-decoration: line-through; text-decoration-color: var(--color-border); }
      .mac-preview-row-done .mac-preview-tick { background: var(--color-ink); }
      .mac-preview-row-active { color: var(--color-ink); font-weight: 500; }
      .mac-preview-dot {
        width: 10px; height: 10px; border-radius: 50%;
        background: var(--color-persimmon);
        box-shadow: 0 0 0 4px rgba(255,91,46,0.18);
      }
      .mac-preview-row-pending { color: var(--color-muted); }
      .mac-preview-circle {
        width: 12px; height: 12px; border-radius: 50%;
        border: 1.5px solid var(--color-border);
      }
      .mac-preview-progress {
        height: 4px; border-radius: 99px; background: var(--color-paper-deep);
        overflow: hidden; margin-top: 4px;
      }
      .mac-preview-progress-fill {
        display: block; height: 100%;
        width: 38%;
        background: linear-gradient(90deg, var(--color-persimmon), var(--color-persimmon-deep));
      }
      .mac-preview-foot {
        margin-top: 6px;
        display: flex; justify-content: space-between; align-items: center;
        font-size: 11px;
        color: var(--color-muted);
      }
      .mac-preview-pill {
        background: var(--color-persimmon-tint);
        color: var(--color-persimmon-deep);
        padding: 2px 8px; border-radius: 99px;
        font-weight: 600; font-size: 10px;
        text-transform: uppercase; letter-spacing: 0.06em;
      }

      /* ============== tabs ============== */
      .mac-tabbar {
        display: flex;
        gap: 6px;
        padding: 8px;
        background: var(--color-paper);
        border-bottom: 1px solid var(--color-border);
        margin: -28px -28px 24px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .mac-tabbar::-webkit-scrollbar { display: none; }
      @media (min-width: 800px) { .mac-tabbar { margin: -36px -36px 28px; } }
      .mac-tab {
        flex-shrink: 0;
        background: transparent;
        border: 1px solid transparent;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-ink-soft);
        padding: 7px 14px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 160ms ease, color 160ms ease, border 160ms ease;
      }
      .mac-tab:hover { color: var(--color-ink); background: var(--color-paper-soft); }
      .mac-tab.is-active {
        background: var(--color-paper-soft);
        border-color: var(--color-border);
        color: var(--color-ink);
        box-shadow: 0 1px 0 var(--color-border);
      }
      /* Notebook page-flip — the body is one page; key change remounts it
         and triggers a 3D flip from whichever side the scroll came from. */
      .mac-page-stage {
        position: relative;
        perspective: 1600px;
        perspective-origin: 50% 40%;
      }
      .mac-page {
        transform-origin: left center;
        backface-visibility: hidden;
        will-change: transform, opacity;
        animation: mac-page-flip-fwd 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .mac-page[data-dir="backward"] {
        transform-origin: right center;
        animation-name: mac-page-flip-back;
      }
      @keyframes mac-page-flip-fwd {
        0%   { opacity: 0; transform: rotateY(-78deg) translateZ(0); box-shadow: 0 30px 60px -40px rgba(28,27,26,0.35); }
        55%  { opacity: 1; }
        100% { opacity: 1; transform: rotateY(0deg) translateZ(0); }
      }
      @keyframes mac-page-flip-back {
        0%   { opacity: 0; transform: rotateY(78deg) translateZ(0); }
        55%  { opacity: 1; }
        100% { opacity: 1; transform: rotateY(0deg) translateZ(0); }
      }
      /* Paper grain — subtle ruled-notebook feel inside the page. */
      .mac-page::before {
        content: "";
        position: absolute;
        inset: -8px -8px 0 -8px;
        pointer-events: none;
        background:
          linear-gradient(90deg, rgba(28,27,26,0.04) 0 1px, transparent 1px) left center / 100% 100%,
          repeating-linear-gradient(180deg, transparent 0 31px, rgba(28,27,26,0.025) 31px 32px);
        opacity: 0.55;
        border-radius: 4px;
        z-index: 0;
      }
      .mac-page > * { position: relative; z-index: 1; }
      .mac-tab-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
      }
      @media (min-width: 880px) { .mac-tab-grid { grid-template-columns: 1.1fr 0.9fr; gap: 40px; } }
      .mac-tab-stack { display: flex; flex-direction: column; gap: 22px; }

      .mac-h3 {
        font-family: var(--font-display-stack);
        font-weight: 400;
        font-size: clamp(22px, 3vw, 30px);
        letter-spacing: -0.015em;
        color: var(--color-ink);
        margin: 0 0 10px;
        line-height: 1.15;
      }
      .mac-body {
        margin: 0;
        font-size: 15px;
        line-height: 1.65;
        color: var(--color-ink-soft);
      }
      .mac-bullets {
        margin: 14px 0 0;
        padding: 0;
        list-style: none;
        display: flex; flex-direction: column; gap: 8px;
        font-size: 14px;
        color: var(--color-ink);
      }
      .mac-bullets li {
        position: relative; padding-left: 22px;
      }
      .mac-bullets li::before {
        content: "";
        position: absolute; left: 0; top: 8px;
        width: 12px; height: 2px; background: var(--color-persimmon);
      }

      /* stats grid */
      .mac-stat-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
      }
      .mac-stat {
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 18px 18px 16px;
      }
      .mac-stat-v {
        font-family: var(--font-display-stack);
        margin: 0;
        font-size: 32px; line-height: 1;
        letter-spacing: -0.02em;
        color: var(--color-persimmon-deep);
      }
      .mac-stat-l {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-ink-soft);
        line-height: 1.4;
      }

      /* phases */
      .mac-phase-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
      .mac-phase {
        display: grid;
        grid-template-columns: 38px 1fr 120px;
        gap: 14px;
        align-items: center;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 12px 16px;
      }
      .mac-phase-n {
        width: 32px; height: 32px; border-radius: 8px;
        background: var(--color-ink); color: var(--color-paper-soft);
        display: inline-flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 14px;
      }
      .mac-phase-name { margin: 0; font-weight: 500; color: var(--color-ink); font-size: 14px; }
      .mac-phase-meta { margin: 2px 0 0; font-size: 12px; color: var(--color-muted); }
      .mac-phase-bar {
        height: 6px; border-radius: 99px;
        background: var(--color-paper-deep); overflow: hidden;
      }
      .mac-phase-bar-fill {
        display: block; height: 100%;
        background: linear-gradient(90deg, var(--color-persimmon), var(--color-persimmon-deep));
      }

      /* docs */
      .mac-docvault { display: flex; flex-direction: column; gap: 8px; }
      .mac-doc-row {
        display: grid;
        grid-template-columns: 12px 1fr auto;
        gap: 12px;
        align-items: center;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        padding: 12px 14px;
      }
      .mac-doc-dot { width: 8px; height: 8px; border-radius: 50%; }
      .mac-doc-dot-ok { background: #2F7D5B; box-shadow: 0 0 0 3px rgba(47,125,91,0.16); }
      .mac-doc-dot-check { background: var(--color-persimmon); box-shadow: 0 0 0 3px rgba(255,91,46,0.16); animation: macPulse 1.2s ease-in-out infinite; }
      .mac-doc-dot-warn { background: #B97324; box-shadow: 0 0 0 3px rgba(185,115,36,0.18); }
      .mac-doc-dot-missing { background: var(--color-border); box-shadow: 0 0 0 3px var(--color-border-soft); }
      @keyframes macPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
      .mac-doc-name { margin: 0; font-size: 14px; color: var(--color-ink); font-weight: 500; }
      .mac-doc-sub { margin: 2px 0 0; font-size: 12px; color: var(--color-muted); }
      .mac-doc-pill {
        font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 99px;
        text-transform: uppercase; letter-spacing: 0.06em;
      }
      .mac-doc-pill-ok { background: rgba(47,125,91,0.10); color: #2F7D5B; }
      .mac-doc-pill-check { background: var(--color-persimmon-tint); color: var(--color-persimmon-deep); }
      .mac-doc-pill-warn { background: rgba(185,115,36,0.12); color: #8b5618; }
      .mac-doc-pill-missing { background: var(--color-paper-deep); color: var(--color-muted); }

      /* mock */
      .mac-mock {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .mac-mock-stage {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: 14px;
        overflow: hidden;
        background: #0E0D0C;
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow: 0 24px 60px -36px rgba(0,0,0,0.55);
      }
      .mac-mock-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: saturate(0.92) brightness(0.78);
      }
      .mac-mock-stage-tint {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(60% 90% at 50% 100%, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%),
          linear-gradient(180deg, rgba(20,19,18,0) 30%, rgba(20,19,18,0.55) 100%);
      }
      .mac-mock-stage-rec {
        position: absolute;
        top: 12px;
        left: 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 10px;
        font-size: 10px;
        letter-spacing: 0.18em;
        color: rgba(255,255,255,0.85);
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border-radius: 99px;
        border: 1px solid rgba(255,255,255,0.12);
      }
      .mac-mock-stage-rec-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FF5B2E;
        box-shadow: 0 0 0 4px rgba(255, 91, 46, 0.25);
        animation: macPulse 1500ms ease-in-out infinite;
      }
      .mac-mock-card {
        background: #141312;
        color: #F4EFE6;
        border-radius: 14px;
        padding: 22px;
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);
      }
      .mac-mock-quote {
        margin: 0;
        font-family: var(--font-display-stack);
        font-size: 19px;
        line-height: 1.3;
        font-style: italic;
        color: #FFFFFF;
      }
      .mac-mock-meta {
        margin: 8px 0 0; font-size: 11px;
        text-transform: uppercase; letter-spacing: 0.12em;
        color: rgba(244,239,230,0.55);
      }
      .mac-mock-meter {
        margin-top: 16px;
        display: flex; gap: 4px; align-items: flex-end; height: 40px;
      }
      .mac-mock-meter-bar {
        flex: 1; background: var(--color-persimmon);
        border-radius: 2px;
      }
      .mac-mock-scores {
        margin-top: 16px;
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      }
      .mac-score {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex; justify-content: space-between; align-items: center;
        font-size: 12px;
      }
      .mac-score-label { color: rgba(244,239,230,0.65); }
      .mac-score-value { color: #FFFFFF; font-weight: 600; }

      /* chat */
      .mac-chat { display: flex; flex-direction: column; gap: 8px; }
      .mac-chat-bubble {
        max-width: 100%;
        padding: 12px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.5;
      }
      .mac-chat-user {
        align-self: flex-end;
        background: var(--color-ink);
        color: var(--color-paper-soft);
        border-bottom-right-radius: 6px;
        max-width: 80%;
      }
      .mac-chat-ai {
        align-self: flex-start;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        color: var(--color-ink);
        border-bottom-left-radius: 6px;
      }

      /* parent */
      .mac-parent { display: flex; justify-content: center; }
      .mac-phone {
        position: relative;
        width: min(260px, 80%);
        aspect-ratio: 9 / 19;
        background: #1C1B1A;
        border-radius: 36px;
        padding: 10px;
        box-shadow:
          0 30px 60px -32px rgba(28,27,26,0.45),
          inset 0 0 0 1px rgba(255,255,255,0.04);
      }
      .mac-phone-notch {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 22px;
        background: #0B0A09;
        border-radius: 14px;
        z-index: 2;
      }
      .mac-phone-screen {
        position: relative;
        height: 100%;
        background: var(--color-paper);
        border-radius: 28px;
        padding: 36px 12px 14px;
        overflow: hidden;
      }
      .mac-phone-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 8px 10px;
        font-size: 10px;
        font-weight: 600;
        color: rgba(28,27,26,0.55);
      }
      .mac-phone-bar-right {
        display: inline-flex;
        gap: 3px;
      }
      .mac-phone-bar-pip {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(28,27,26,0.55);
      }
      .mac-parent-card {
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 14px;
        padding: 22px;
      }
      .mac-phone .mac-parent-card {
        background: transparent;
        border: none;
        padding: 4px 6px 0;
      }
      .mac-phone .mac-parent-headline { font-size: 20px; }
      .mac-phone .mac-parent-grid { gap: 14px; }
      .mac-parent-eyebrow {
        margin: 0; font-size: 11px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.14em;
        color: var(--color-persimmon-deep);
      }
      .mac-parent-headline {
        margin: 8px 0 0;
        font-family: var(--font-display-stack);
        font-size: 24px; letter-spacing: -0.015em;
        color: var(--color-ink);
        line-height: 1.2;
      }
      .mac-parent-bar {
        margin-top: 16px;
        height: 6px; background: var(--color-paper-deep);
        border-radius: 99px; overflow: hidden;
      }
      .mac-parent-bar-fill {
        display: block; height: 100%;
        background: linear-gradient(90deg, var(--color-persimmon), var(--color-persimmon-deep));
      }
      .mac-parent-meta { margin: 8px 0 0; font-size: 12px; color: var(--color-ink-soft); }
      .mac-parent-grid {
        margin-top: 16px;
        display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      }
      .mac-parent-sub {
        margin: 0; font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.12em; color: var(--color-muted);
      }
      .mac-parent-stat {
        margin: 4px 0 0;
        font-family: var(--font-display-stack);
        font-size: 20px;
        letter-spacing: -0.01em;
        color: var(--color-ink);
      }

      /* pricing */
      .mac-pricing-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 820px) { .mac-pricing-grid { grid-template-columns: 1fr 1.05fr 1fr; align-items: stretch; } }
      .mac-plan {
        position: relative;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 24px;
        display: flex; flex-direction: column;
      }
      .mac-plan.is-popular {
        border-color: transparent;
        box-shadow: 0 14px 34px -16px rgba(255,91,46,0.30);
        /* Slow persimmon shimmer band moves left-to-right across the card edge.
           Uses background-clip + a moving gradient — pure CSS, GPU-friendly,
           the one decorative animation on this section. */
        background:
          linear-gradient(var(--color-paper), var(--color-paper)) padding-box,
          linear-gradient(
            110deg,
            #FF5B2E 0%,
            #FF5B2E 40%,
            #FFB094 50%,
            #FF5B2E 60%,
            #FF5B2E 100%
          ) border-box;
        background-size: 100% 100%, 220% 100%;
        background-position: 0 0, 0 0;
        animation: mac-plan-shimmer 4.6s linear infinite;
      }
      @keyframes mac-plan-shimmer {
        from { background-position: 0 0, 0 0; }
        to   { background-position: 0 0, -220% 0; }
      }
      .mac-plan-tilt {
        border-radius: 16px;
      }
      @media (prefers-reduced-motion: reduce) {
        .mac-plan.is-popular {
          animation: none;
          background: var(--color-paper);
          border: 1px solid var(--color-persimmon);
        }
      }
      .mac-plan-badge {
        position: absolute; top: -10px; left: 24px;
        background: var(--color-persimmon);
        color: var(--color-paper-soft);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        padding: 4px 10px;
        border-radius: 99px;
      }
      .mac-plan-name {
        margin: 0; font-size: 13px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.1em;
        color: var(--color-ink-soft);
      }
      .mac-plan-price {
        margin-top: 10px;
        display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
      }
      .mac-plan-current {
        font-family: var(--font-display-stack);
        font-size: 40px;
        letter-spacing: -0.02em;
        color: var(--color-ink);
      }
      .mac-plan-original {
        font-size: 18px;
        text-decoration: line-through;
        color: var(--color-muted);
      }
      .mac-plan-discount {
        background: var(--color-persimmon-tint);
        color: var(--color-persimmon-deep);
        font-size: 10px; font-weight: 700; padding: 3px 8px;
        border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em;
      }
      .mac-plan-features {
        margin: 18px 0 0; padding: 0; list-style: none;
        display: flex; flex-direction: column; gap: 8px;
        font-size: 14px; color: var(--color-ink);
        flex: 1;
      }
      .mac-plan-features li {
        display: inline-flex; align-items: flex-start; gap: 8px;
        line-height: 1.45;
      }
      .mac-plan-features svg { color: var(--color-persimmon); margin-top: 4px; flex-shrink: 0; }
      .mac-plan-cta { margin-top: 20px; justify-content: center; }
      .mac-pricing-foot {
        margin: 20px 0 0; font-size: 12px;
        color: var(--color-ink-soft); text-align: center;
      }

      /* notes */
      .mac-notes-grid {
        display: grid; grid-template-columns: 1fr; gap: 14px;
      }
      @media (min-width: 820px) { .mac-notes-grid { grid-template-columns: 1fr 1fr 1fr; } }
      .mac-note {
        background: #FFFBEE;
        border: 1px solid #EFE6CD;
        border-radius: 4px;
        padding: 20px;
        box-shadow:
          0 12px 22px -16px rgba(0,0,0,0.18),
          inset 0 1px 0 rgba(255,255,255,0.7);
        transform: rotate(-0.3deg);
      }
      .mac-note:nth-child(2) { transform: rotate(0.3deg); }
      .mac-note:nth-child(3) { transform: rotate(-0.5deg); }
      .mac-note-quote {
        margin: 0;
        font-family: var(--font-display-stack);
        font-size: 17px;
        line-height: 1.45;
        color: var(--color-ink);
      }
      .mac-note-who {
        margin: 12px 0 0;
        font-size: 12px;
        color: var(--color-ink-soft);
      }

      /* faq */
      .mac-faq { display: flex; flex-direction: column; }
      .mac-faq-row { border-bottom: 1px solid var(--color-border-soft); }
      .mac-faq-row:last-child { border-bottom: none; }
      .mac-faq-q {
        width: 100%;
        display: flex; align-items: center; justify-content: space-between;
        background: none; border: none; cursor: pointer;
        padding: 16px 0;
        text-align: left;
        font-size: 15px; font-weight: 500;
        color: var(--color-ink);
        transition: color 160ms ease;
      }
      .mac-faq-q:hover { color: var(--color-persimmon-deep); }
      .mac-faq-q-text { padding-right: 16px; }
      .mac-faq-row.is-open .mac-faq-q { color: var(--color-ink); }
      .mac-faq-wrap { display: grid; transition: grid-template-rows 320ms cubic-bezier(0.22,1,0.36,1); }
      .mac-faq-inner { overflow: hidden; }
      .mac-faq-a {
        margin: 0 0 16px;
        font-size: 14px; line-height: 1.65;
        color: var(--color-ink-soft);
        max-width: 64ch;
      }

      /* launch */
      .mac-launch {
        text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 14px;
        padding: 32px 0;
      }

      /* ============================================================
         Workspace notebook — sticky-pinned MacWindow flips through six
         pages as the user scrolls. Stage height = 6 × 100vh so each
         viewport-worth of scroll maps to one notebook page.
         ============================================================ */
      .nb-section { padding-top: 60px; }
      .nb-stage {
        position: relative;
        margin-top: 28px;
        height: calc(6 * 100vh);
      }
      .nb-pin {
        position: sticky;
        top: 64px;
        /* Explicit height so the inner flex chain has a base to distribute
           from. With absolute-positioned pages, an unset height collapses
           the whole notebook to 0. */
        height: calc(100vh - 96px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        /* Promote to its own GPU layer so the sticky pin doesn't jitter
           against the page paint behind it. */
        transform: translateZ(0);
        backface-visibility: hidden;
        contain: layout paint;
      }
      .nb-pin > .mac-window {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .nb-pin .mac-window-body {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .nb-tabs {
        display: flex;
        gap: 6px;
        padding: 8px;
        background: var(--color-paper);
        border-bottom: 1px solid var(--color-border);
        margin: -28px -28px 18px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .nb-tabs::-webkit-scrollbar { display: none; }
      .nb-tab {
        flex: 0 0 auto;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-ink-soft);
        border-radius: 8px;
        border: 1px solid transparent;
        transition: background 200ms ease, color 200ms ease, border 200ms ease;
      }
      .nb-tab.is-active {
        background: var(--color-paper-soft);
        color: var(--color-ink);
        border-color: var(--color-border);
        box-shadow: 0 1px 0 var(--color-border);
      }

      /* Spread = the open notebook surface inside the window */
      .nb-spread {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        perspective: 1800px;
        perspective-origin: 0% 50%;
      }
      /* Spiral binding — small repeating circles on the left edge */
      .nb-binding {
        position: absolute;
        top: 0;
        left: -4px;
        width: 18px;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        padding: 6px 0;
        pointer-events: none;
        z-index: 3;
      }
      .nb-binding-hole {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--color-paper-deep);
        box-shadow:
          inset 0 1px 1px rgba(28, 27, 26, 0.18),
          0 1px 0 var(--color-paper-soft);
      }
      .nb-binding::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 1px;
        background: linear-gradient(
          180deg,
          rgba(28, 27, 26, 0) 0,
          rgba(28, 27, 26, 0.06) 20%,
          rgba(28, 27, 26, 0.06) 80%,
          rgba(28, 27, 26, 0) 100%
        );
      }

      /* All pages share the same DOM node; only data-state changes.
         No remount → no animation restart → no shake during scroll. */
      .nb-page {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 28px;
        padding: 8px 12px 8px 32px;
        transform-origin: left center;
        backface-visibility: hidden;
        will-change: transform, opacity;
        transition:
          opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        pointer-events: none;
        opacity: 0;
        z-index: 1;
      }
      .nb-page[data-state="on"] {
        opacity: 1;
        transform: rotateY(0deg);
        pointer-events: auto;
        z-index: 2;
      }
      /* Forward scroll: incoming page comes from the right with origin: left.
         Past pages flip away to the right (origin: right). */
      .nb-spread[data-dir="fwd"] .nb-page[data-state="after"] {
        opacity: 0;
        transform: rotateY(-32deg);
        transform-origin: left center;
      }
      .nb-spread[data-dir="fwd"] .nb-page[data-state="before"] {
        opacity: 0;
        transform: rotateY(32deg);
        transform-origin: right center;
      }
      /* Backward scroll: mirror. */
      .nb-spread[data-dir="back"] .nb-page[data-state="before"] {
        opacity: 0;
        transform: rotateY(-32deg);
        transform-origin: left center;
      }
      .nb-spread[data-dir="back"] .nb-page[data-state="after"] {
        opacity: 0;
        transform: rotateY(32deg);
        transform-origin: right center;
      }
      /* Faint ruled-notebook background */
      .nb-page::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          repeating-linear-gradient(
            180deg,
            transparent 0 31px,
            rgba(28, 27, 26, 0.025) 31px 32px
          );
        pointer-events: none;
        z-index: 0;
      }
      .nb-page > * { position: relative; z-index: 1; min-width: 0; }

      .nb-text {
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: auto;
      }
      .nb-demo {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        overflow: hidden;
      }
      .nb-demo > * { width: 100%; }

      /* Notebook progress dots */
      .nb-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-muted);
      }
      .nb-progress-tick {
        width: 18px;
        height: 2px;
        border-radius: 999px;
        background: rgba(28, 27, 26, 0.18);
        transition: background 260ms ease, width 260ms ease;
      }
      .nb-progress-tick.is-active {
        background: var(--color-persimmon);
        width: 28px;
      }
      .nb-progress-label { margin-left: 4px; }

      /* ============================================================
         Page demos — pure SVG / CSS, no media assets
         ============================================================ */

      /* WhyDemo — counting stats grid */
      .nb-why {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .nb-stat {
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 14px;
        padding: 18px;
        transition: box-shadow 240ms ease, transform 240ms ease;
      }
      .nb-stat:hover {
        box-shadow: 0 6px 20px -8px rgba(28, 27, 26, 0.07);
        transform: translateY(-1px);
      }
      .nb-stat-n {
        margin: 0;
        font-family: var(--font-display-stack);
        font-size: 38px;
        line-height: 1;
        letter-spacing: -0.015em;
        color: var(--color-persimmon-deep);
      }
      .nb-stat-l {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-ink-soft);
        line-height: 1.4;
      }

      /* StepsDemo — vertical timeline with traveling dot */
      .nb-timeline {
        position: relative;
        padding-left: 30px;
        width: 100%;
      }
      .nb-timeline-rail {
        position: absolute;
        left: 8px;
        top: 14px;
        bottom: 14px;
        width: 2px;
        background: var(--color-paper-deep);
        border-radius: 2px;
      }
      .nb-timeline-dot {
        position: absolute;
        left: 1px;
        top: 12px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-persimmon);
        box-shadow: 0 0 0 6px rgba(255, 91, 46, 0.18);
        animation: nb-step-travel 6.5s cubic-bezier(0.7, 0, 0.3, 1) infinite both;
      }
      @keyframes nb-step-travel {
        0%, 12%   { transform: translateY(0); }
        18%, 30%  { transform: translateY(48px); }
        36%, 48%  { transform: translateY(96px); }
        54%, 66%  { transform: translateY(144px); }
        72%, 88%  { transform: translateY(192px); }
        95%, 100% { transform: translateY(0); }
      }
      .nb-timeline-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .nb-timeline-node {
        position: relative;
        padding: 8px 12px;
        border-radius: 10px;
        background: transparent;
        animation: nb-step-pulse 6.5s linear infinite both;
        animation-delay: calc(var(--i) * 1.3s);
      }
      @keyframes nb-step-pulse {
        0%   { background: var(--color-persimmon-tint); }
        15%  { background: var(--color-persimmon-tint); }
        18%  { background: transparent; }
        100% { background: transparent; }
      }
      .nb-timeline-pip {
        position: absolute;
        left: -25px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--color-paper-soft);
        border: 2px solid var(--color-border);
      }
      .nb-timeline-label {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .nb-timeline-idx {
        font-size: 10px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-muted);
      }
      .nb-timeline-name {
        font-size: 14px;
        color: var(--color-ink);
      }

      /* DocumentsDemo */
      .nb-docs {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .nb-doc {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 12px;
      }
      .nb-doc-icon {
        width: 26px;
        height: 30px;
        border-radius: 4px;
        background: var(--color-paper-deep);
        border: 1px solid var(--color-border);
        flex: 0 0 auto;
      }
      .nb-doc-name {
        flex: 1 1 auto;
        font-size: 13px;
        color: var(--color-ink);
        min-width: 0;
      }
      .nb-doc-pill {
        position: relative;
        min-width: 110px;
        height: 24px;
        flex: 0 0 auto;
      }
      .nb-doc-state {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 500;
      }
      .nb-doc-checking {
        background: var(--color-paper-deep);
        color: var(--color-muted);
      }
      .nb-doc-ok {
        background: rgba(47, 125, 91, 0.12);
        color: #2F7D5B;
        transform: scale(0.6);
        opacity: 0;
      }
      .nb-doc .nb-doc-checking {
        animation: nb-doc-checking 5s ease-out infinite;
        animation-delay: calc(var(--i) * 1.4s);
      }
      .nb-doc .nb-doc-ok {
        animation: nb-doc-ok 5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        animation-delay: calc(var(--i) * 1.4s);
      }
      @keyframes nb-doc-checking {
        0%, 17% { opacity: 1; }
        20%, 88% { opacity: 0; }
        92%, 100% { opacity: 1; }
      }
      @keyframes nb-doc-ok {
        0%, 17% { opacity: 0; transform: scale(0.6); }
        22%, 88% { opacity: 1; transform: scale(1); }
        92%, 100% { opacity: 0; transform: scale(0.6); }
      }
      .nb-cursor {
        position: absolute;
        top: 14px;
        right: 26%;
        color: var(--color-ink);
        z-index: 4;
        pointer-events: none;
        animation: nb-cursor-move 5s ease-in-out infinite;
      }
      @keyframes nb-cursor-move {
        0%, 16%   { transform: translateY(0); }
        28%, 44%  { transform: translateY(52px); }
        56%, 72%  { transform: translateY(104px); }
        88%, 100% { transform: translateY(104px); opacity: 0; }
      }
      .nb-doc-bar {
        height: 3px;
        background: var(--color-paper-deep);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 6px;
      }
      .nb-doc-bar-fill {
        display: block;
        height: 100%;
        background: var(--color-persimmon);
        width: 0;
        animation: nb-doc-fill 5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
      }
      @keyframes nb-doc-fill {
        0%   { width: 0; }
        88%  { width: 100%; }
        100% { width: 0; }
      }

      /* MockDemo */
      .nb-mock {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .nb-mock-q {
        margin: 0;
        font-family: var(--font-display-stack);
        font-style: italic;
        font-size: 24px;
        letter-spacing: -0.01em;
        color: var(--color-ink);
        overflow: hidden;
      }
      .nb-mock-q-typewriter {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        border-right: 2px solid var(--color-persimmon);
        width: 0;
        animation:
          nb-type 5s steps(22, end) infinite,
          nb-blink 700ms steps(2) infinite;
      }
      @keyframes nb-type {
        0%   { width: 0; }
        35%  { width: 100%; }
        80%  { width: 100%; }
        100% { width: 0; }
      }
      @keyframes nb-blink {
        50% { border-color: transparent; }
      }
      .nb-mock-scores {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .nb-score {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 10px 12px;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 10px;
      }
      .nb-score-l {
        font-size: 11px;
        color: var(--color-muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .nb-score-v {
        font-family: var(--font-display-stack);
        font-size: 22px;
        color: var(--color-persimmon-deep);
      }
      .nb-mock-bars {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 38px;
        padding: 0 2px;
      }
      .nb-mock-bar {
        flex: 1 1 auto;
        background: var(--color-persimmon);
        border-radius: 2px;
        height: 30%;
        transform-origin: bottom;
        animation: nb-mock-bar 850ms ease-in-out infinite alternate;
        animation-delay: calc(var(--i) * 65ms);
      }
      @keyframes nb-mock-bar {
        0%   { height: 14%; }
        100% { height: 88%; }
      }

      /* AskDemo */
      .nb-ask {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .nb-bubble {
        max-width: 86%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13px;
        line-height: 1.55;
        animation: nb-bubble-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .nb-bubble-user {
        align-self: flex-end;
        background: var(--color-ink);
        color: var(--color-paper);
        border-bottom-right-radius: 4px;
      }
      .nb-bubble-ai {
        align-self: flex-start;
        background: var(--color-paper);
        color: var(--color-ink);
        border: 1px solid var(--color-border);
        border-bottom-left-radius: 4px;
      }
      .nb-bubble-typing {
        align-self: flex-start;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        padding: 12px 16px;
        border-bottom-left-radius: 4px;
        display: inline-flex;
        gap: 4px;
        max-width: max-content;
      }
      .nb-bubble-typing span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--color-muted);
        animation: nb-typing 1200ms ease-in-out infinite;
      }
      .nb-bubble-typing span:nth-child(2) { animation-delay: 180ms; }
      .nb-bubble-typing span:nth-child(3) { animation-delay: 360ms; }
      @keyframes nb-typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
        30%           { transform: translateY(-4px); opacity: 1; }
      }
      @keyframes nb-bubble-in {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .nb-caret {
        display: inline-block;
        width: 2px;
        height: 13px;
        background: var(--color-persimmon);
        margin-left: 2px;
        vertical-align: middle;
        animation: nb-blink 700ms steps(2) infinite;
      }

      /* ParentsDemo */
      .nb-parent {
        display: flex;
        justify-content: center;
        width: 100%;
      }
      .nb-phone {
        position: relative;
        width: min(220px, 78%);
        aspect-ratio: 9 / 18;
        background: var(--color-ink);
        border-radius: 32px;
        padding: 8px;
        box-shadow:
          0 30px 60px -32px rgba(28, 27, 26, 0.45),
          inset 0 0 0 1px rgba(255, 255, 255, 0.04);
      }
      .nb-phone-notch {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: 68px;
        height: 18px;
        background: #0B0A09;
        border-radius: 14px;
        z-index: 2;
      }
      .nb-phone-screen {
        position: relative;
        height: 100%;
        background: var(--color-paper);
        border-radius: 26px;
        padding: 32px 14px 14px;
        overflow: hidden;
      }
      .nb-phone-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px 10px;
        font-size: 9px;
        font-weight: 600;
        color: var(--color-ink-soft);
      }
      .nb-phone-bar-r {
        display: inline-flex;
        gap: 3px;
      }
      .nb-phone-bar-r span {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--color-ink-soft);
      }
      .nb-parent-eyebrow {
        margin: 0;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-persimmon-deep);
      }
      .nb-parent-title {
        margin: 6px 0 0;
        font-family: var(--font-display-stack);
        font-size: 22px;
        letter-spacing: -0.01em;
      }
      .nb-parent-bar {
        margin-top: 10px;
        height: 6px;
        background: var(--color-paper-deep);
        border-radius: 4px;
        overflow: hidden;
      }
      .nb-parent-bar-fill {
        display: block;
        height: 100%;
        background: var(--color-persimmon);
        border-radius: 4px;
        width: 0;
        animation: nb-progress-fill 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
      }
      @keyframes nb-progress-fill {
        0%, 6%    { width: 0; }
        28%, 82%  { width: 63%; }
        92%, 100% { width: 0; }
      }
      .nb-parent-meta {
        margin: 8px 0 0;
        font-size: 10px;
        color: var(--color-ink-soft);
      }
      .nb-parent-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 12px;
      }
      .nb-parent-chip {
        font-size: 10px;
        padding: 4px 9px;
        border-radius: 99px;
        background: var(--color-paper-deep);
        border: 1px solid var(--color-border);
        opacity: 0;
        transform: translateY(6px);
        animation: nb-chip-in 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        animation-delay: calc(0.6s + var(--i) * 0.25s);
      }
      @keyframes nb-chip-in {
        0%, 10%   { opacity: 0; transform: translateY(6px); }
        28%, 82%  { opacity: 1; transform: translateY(0); }
        92%, 100% { opacity: 0; transform: translateY(-3px); }
      }

      /* ============================================================
         Stacked fallback — shown on narrow viewports and reduced-motion
         ============================================================ */
      .nb-stack { display: none; flex-direction: column; gap: 18px; margin-top: 28px; }
      .nb-stack-card {
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        border-radius: 18px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .nb-stack-label {
        margin: 0;
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-persimmon-deep);
        font-weight: 600;
      }
      .nb-stack-card .nb-demo {
        margin-top: 6px;
        padding: 14px;
        border: 1px solid var(--color-border);
        border-radius: 12px;
        background: var(--color-paper);
      }

      /* Mobile: collapse the notebook entirely */
      @media (max-width: 760px) {
        .nb-stage { display: none; }
        .nb-stack { display: flex; }
      }
      /* Reduced motion: same collapse + kill loops */
      @media (prefers-reduced-motion: reduce) {
        .nb-stage { display: none; }
        .nb-stack { display: flex; }
        .nb-timeline-dot,
        .nb-timeline-node,
        .nb-doc .nb-doc-checking,
        .nb-doc .nb-doc-ok,
        .nb-cursor,
        .nb-doc-bar-fill,
        .nb-mock-q-typewriter,
        .nb-mock-bar,
        .nb-bubble-typing span,
        .nb-caret,
        .nb-parent-bar-fill,
        .nb-parent-chip,
        .nb-page { animation: none !important; }
        .nb-mock-q-typewriter { width: auto; border-right: none; }
        .nb-doc-ok { opacity: 1; transform: scale(1); }
        .nb-doc-checking { opacity: 0; }
        .nb-parent-bar-fill { width: 63%; }
        .nb-parent-chip { opacity: 1; transform: translateY(0); }
      }

      /* ============================================================
         Spotlight feature sections — floating product-mock cards
         ============================================================ */
      .spot {
        text-align: center;
        padding-top: 96px;
        padding-bottom: 80px;
      }
      .spot-eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-persimmon-deep);
      }
      .spot-h2 {
        margin: 14px auto 0;
        max-width: 720px;
        font-family: var(--font-display-stack);
        font-size: clamp(32px, 4.2vw, 52px);
        line-height: 1.08;
        letter-spacing: -0.022em;
        color: var(--color-ink);
      }
      .spot-h2 i { font-style: italic; color: var(--color-persimmon-deep); }
      .spot-sub {
        margin: 18px auto 0;
        max-width: 560px;
        font-size: 15px;
        line-height: 1.6;
        color: var(--color-ink-soft);
      }

      .spot-stage {
        position: relative;
        margin: 56px auto 0;
        max-width: 980px;
        height: 320px;
        perspective: 1400px;
      }
      .spot-card {
        position: absolute;
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 18px 18px 20px;
        box-shadow:
          0 26px 60px -32px rgba(28, 27, 26, 0.22),
          0 6px 14px -8px rgba(28, 27, 26, 0.10),
          0 0 0 1px rgba(255, 255, 255, 0.55) inset;
        text-align: left;
        transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 280ms ease;
        will-change: transform;
      }
      .spot-card:hover {
        transform: translateY(-3px) rotate(0deg) !important;
        box-shadow:
          0 32px 72px -32px rgba(28, 27, 26, 0.28),
          0 8px 18px -10px rgba(28, 27, 26, 0.14),
          0 0 0 1px rgba(255, 91, 46, 0.22);
        z-index: 10;
      }

      .spot-card-left {
        top: 28px;
        left: 4%;
        width: 320px;
        transform: rotate(-5deg);
        z-index: 1;
      }
      .spot-card-center {
        top: 0;
        left: 50%;
        margin-left: -180px;
        width: 360px;
        transform: rotate(1deg);
        z-index: 3;
      }
      .spot-card-right {
        top: 36px;
        right: 4%;
        width: 320px;
        transform: rotate(5deg);
        z-index: 2;
      }
      @media (max-width: 880px) {
        .spot-stage { height: auto; padding: 8px 0; }
        .spot-card {
          position: relative;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          margin: 14px auto 0 !important;
          width: min(380px, 92%);
          transform: none !important;
        }
        .spot-card:first-child { margin-top: 0 !important; }
      }

      /* Doc cards */
      .spot-card-doc { display: flex; align-items: center; gap: 14px; }
      .spot-doc-icon {
        width: 34px; height: 40px;
        border-radius: 5px;
        background: var(--color-paper-deep);
        border: 1px solid var(--color-border);
        flex: 0 0 auto;
      }
      .spot-doc-body { flex: 1 1 auto; min-width: 0; }
      .spot-doc-name { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-ink); }
      .spot-doc-sub { margin: 4px 0 0; font-size: 12px; color: var(--color-ink-soft); }
      .spot-pill {
        font-size: 11px;
        font-weight: 600;
        padding: 5px 10px;
        border-radius: 99px;
        white-space: nowrap;
        flex: 0 0 auto;
      }
      .spot-pill-ok { background: rgba(47, 125, 91, 0.14); color: #2F7D5B; }
      .spot-pill-check { background: var(--color-paper-deep); color: var(--color-muted); }
      .spot-pill-warn { background: rgba(185, 115, 36, 0.16); color: #8b5618; }

      .spot-scribble {
        position: absolute;
        top: -28px;
        left: 8%;
        color: var(--color-persimmon);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transform: rotate(-4deg);
      }
      .spot-scribble-label {
        font-family: "Caveat", "Bradley Hand", "Comic Sans MS", cursive;
        font-size: 18px;
        color: var(--color-persimmon-deep);
      }
      @media (max-width: 880px) { .spot-scribble { display: none; } }

      /* Mock cards */
      .spot-card-q { display: flex; flex-direction: column; gap: 10px; }
      .spot-q-meta { margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-muted); }
      .spot-q-text {
        margin: 0;
        font-family: var(--font-display-stack);
        font-style: italic;
        font-size: 19px;
        line-height: 1.3;
        color: var(--color-ink);
      }
      .spot-q-bars {
        display: flex; align-items: flex-end; gap: 3px;
        height: 28px; margin-top: 4px;
      }
      .spot-q-bars span {
        flex: 1;
        background: var(--color-persimmon);
        border-radius: 2px;
        height: 30%;
        animation: spot-bar 900ms ease-in-out infinite alternate;
        animation-delay: calc(var(--i) * 70ms);
      }
      @keyframes spot-bar { 0% { height: 14%; } 100% { height: 86%; } }

      .spot-card-scores { display: flex; flex-direction: column; gap: 10px; }
      .spot-score-title {
        margin: 0;
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-muted);
      }
      .spot-score-list {
        margin: 0; padding: 0; list-style: none;
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px;
      }
      .spot-score-list li {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 8px 10px;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 8px;
      }
      .spot-score-list li span {
        font-size: 11px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-muted);
      }
      .spot-score-list li b {
        font-family: var(--font-display-stack);
        font-weight: 500;
        font-size: 20px;
        color: var(--color-persimmon-deep);
      }

      .spot-card-transcript { display: flex; flex-direction: column; gap: 8px; }
      .spot-trans-eyebrow { margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-muted); }
      .spot-trans-body {
        margin: 0;
        font-size: 13px;
        line-height: 1.55;
        color: var(--color-ink);
      }
      .spot-trans-body u { text-decoration: none; border-bottom: 2px solid rgba(255, 91, 46, 0.45); padding-bottom: 1px; }

      /* Parents cards */
      .spot-card-link { display: flex; flex-direction: column; gap: 10px; }
      .spot-link-eyebrow { margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-muted); }
      .spot-link-url {
        margin: 0;
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        font-size: 13px;
        color: var(--color-ink);
        padding: 8px 10px;
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .spot-link-actions { display: flex; gap: 6px; }
      .spot-link-btn {
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 8px;
        background: var(--color-ink);
        color: var(--color-paper);
      }
      .spot-link-btn-ghost {
        background: transparent;
        color: var(--color-ink-soft);
        border: 1px solid var(--color-border);
      }

      .spot-card-phone { display: flex; flex-direction: column; gap: 8px; }
      .spot-phone-eyebrow { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-persimmon-deep); }
      .spot-phone-title { margin: 4px 0 0; font-family: var(--font-display-stack); font-size: 22px; }
      .spot-phone-bar { height: 6px; background: var(--color-paper-deep); border-radius: 4px; overflow: hidden; }
      .spot-phone-bar span { display: block; height: 100%; width: 63%; background: var(--color-persimmon); border-radius: 4px; }
      .spot-phone-meta { margin: 6px 0 0; font-size: 12px; color: var(--color-ink-soft); }
      .spot-phone-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
      .spot-phone-chips span {
        font-size: 11px;
        padding: 4px 9px;
        border-radius: 99px;
        background: var(--color-paper-deep);
        border: 1px solid var(--color-border);
      }

      .spot-card-pay { display: flex; flex-direction: column; gap: 10px; }
      .spot-pay-eyebrow { margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-muted); }
      .spot-pay-amount {
        margin: 0;
        font-family: var(--font-display-stack);
        font-size: 38px;
        line-height: 1;
        color: var(--color-ink);
      }
      .spot-pay-amount span { font-size: 14px; color: var(--color-ink-soft); margin-left: 4px; }
      .spot-pay-btn {
        margin-top: 4px;
        font-size: 12px;
        font-weight: 600;
        padding: 8px 14px;
        border-radius: 99px;
        background: var(--color-persimmon);
        color: #fff;
        text-align: center;
      }

      /* Pull-quote shared by all spotlights */
      .spot-quote {
        margin: 56px auto 0;
        max-width: 640px;
        padding-left: 16px;
        border-left: 3px solid var(--color-persimmon);
        text-align: left;
      }
      .spot-quote blockquote {
        margin: 0;
        font-size: clamp(18px, 1.8vw, 22px);
        line-height: 1.55;
        color: var(--color-ink-soft);
        font-family: var(--font-display-stack);
        font-style: italic;
      }
      .spot-quote mark {
        background: rgba(255, 91, 46, 0.16);
        color: var(--color-ink);
        padding: 0 4px;
        border-radius: 3px;
        font-style: normal;
        font-family: var(--font-sans-stack, var(--font-display-stack));
      }
      .spot-quote figcaption {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 18px;
        font-size: 13px;
        color: var(--color-ink-soft);
      }
      .spot-quote figcaption b { color: var(--color-ink); font-weight: 600; }
      .spot-quote-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: var(--color-persimmon-tint);
        color: var(--color-persimmon-deep);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        border: 1px solid var(--color-border);
      }

      @media (prefers-reduced-motion: reduce) {
        .spot-q-bars span { animation: none; height: 60%; }
        .spot-card { transition: none; }
      }

      /* ============================================================
         Q&A.txt — editorial FAQ, no window frame
         ============================================================ */
      .faq2 {
        padding-top: 100px;
        padding-bottom: 100px;
      }
      .faq2-head {
        max-width: 720px;
        margin: 0 auto 48px;
        text-align: center;
      }
      .faq2-h2 {
        margin-top: 14px;
      }
      .faq2-sub {
        margin: 18px auto 0;
        max-width: 560px;
        font-size: 15px;
        line-height: 1.6;
        color: var(--color-ink-soft);
      }
      .faq2-sub a {
        color: var(--color-persimmon-deep);
        text-decoration: underline;
        text-decoration-thickness: 1.5px;
        text-underline-offset: 3px;
      }
      .faq2-list {
        list-style: none;
        margin: 0 auto;
        padding: 0;
        max-width: 880px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .faq2-item {
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        overflow: hidden;
        transition: border-color 240ms ease, box-shadow 240ms ease;
      }
      .faq2-item:hover {
        border-color: color-mix(in srgb, var(--color-persimmon) 35%, var(--color-border));
      }
      .faq2-item.is-open {
        border-color: color-mix(in srgb, var(--color-persimmon) 60%, var(--color-border));
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.6) inset,
          0 12px 32px -20px rgba(255, 91, 46, 0.25);
      }

      .faq2-q {
        width: 100%;
        display: grid;
        grid-template-columns: 56px 1fr auto;
        align-items: center;
        gap: 20px;
        padding: 22px 24px;
        background: transparent;
        border: none;
        text-align: left;
        cursor: pointer;
        color: var(--color-ink);
        font: inherit;
      }
      .faq2-num {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-muted);
        letter-spacing: 0.06em;
      }
      .faq2-item.is-open .faq2-num { color: var(--color-persimmon-deep); }

      .faq2-q-body {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .faq2-tag {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        padding: 3px 9px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-persimmon-deep);
        background: var(--color-persimmon-tint);
        border-radius: 99px;
      }
      .faq2-q-text {
        font-family: var(--font-display-stack);
        font-size: clamp(20px, 2.2vw, 24px);
        line-height: 1.2;
        letter-spacing: -0.012em;
        color: var(--color-ink);
      }
      .faq2-toggle {
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 99px;
        background: var(--color-paper);
        color: var(--color-ink-soft);
        border: 1px solid var(--color-border);
        flex: 0 0 auto;
        transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
                    background 240ms ease,
                    color 240ms ease;
      }
      .faq2-item.is-open .faq2-toggle {
        transform: rotate(180deg);
        background: var(--color-persimmon);
        color: #fff;
        border-color: var(--color-persimmon-deep);
      }

      .faq2-wrap {
        display: grid;
        transition: grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .faq2-inner {
        overflow: hidden;
        min-height: 0;
      }
      .faq2-a {
        margin: 0;
        padding: 0 24px 24px 100px;
        font-size: 15.5px;
        line-height: 1.65;
        color: var(--color-ink-soft);
        max-width: 720px;
      }

      @media (max-width: 640px) {
        .faq2-q {
          grid-template-columns: 28px 1fr auto;
          gap: 12px;
          padding: 18px 18px;
        }
        .faq2-a { padding: 0 18px 18px 18px; }
        .faq2-toggle { width: 30px; height: 30px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .faq2-wrap { transition: none; }
        .faq2-toggle { transition: none; }
      }

      /* ============================================================
         Stamped closer — last hero before the launch CTA + footer
         ============================================================ */
      .closer {
        position: relative;
        text-align: center;
        padding-top: 100px;
        padding-bottom: 60px;
        overflow: hidden;
      }
      .closer-glow {
        z-index: 0;
      }
      .closer > *:not(.closer-glow) {
        position: relative;
        z-index: 1;
      }
      .closer-eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--color-persimmon-deep);
      }
      .closer-h2 {
        margin: 16px auto 0;
        max-width: 760px;
        font-family: var(--font-display-stack);
        font-size: clamp(40px, 5.8vw, 72px);
        line-height: 1.02;
        letter-spacing: -0.025em;
        color: var(--color-ink);
      }
      .closer-h2 i {
        font-style: italic;
        color: var(--color-persimmon-deep);
      }
      .closer-sub {
        margin: 18px auto 0;
        max-width: 520px;
        font-size: 16px;
        line-height: 1.6;
        color: var(--color-ink-soft);
      }

      .closer-stage {
        position: relative;
        margin: 48px auto 0;
        max-width: 980px;
        animation: closer-float 8s ease-in-out infinite;
      }
      .closer-img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 24px;
      }
      @keyframes closer-float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-8px); }
      }

      .closer-ctas {
        margin-top: 44px;
        display: inline-flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .closer-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 99px;
        text-decoration: none;
        transition: transform 200ms ease, box-shadow 200ms ease,
                    background 200ms ease, color 200ms ease;
      }
      .closer-cta-primary {
        background: var(--color-persimmon);
        color: #fff;
        border: 1px solid var(--color-persimmon-deep);
        box-shadow: 0 12px 28px -14px rgba(255, 91, 46, 0.55);
      }
      .closer-cta-primary:hover {
        background: var(--color-persimmon-deep);
        transform: translateY(-2px);
        box-shadow: 0 18px 36px -16px rgba(255, 91, 46, 0.6);
      }
      .closer-cta-ghost {
        background: transparent;
        color: var(--color-ink);
        border: 1px solid var(--color-border);
      }
      .closer-cta-ghost:hover {
        border-color: var(--color-ink);
        background: var(--color-paper-soft);
      }

      @media (prefers-reduced-motion: reduce) {
        .closer-stage { animation: none; }
      }

      /* ============================================================
         Question shelf — Raycast-style dark feature cards on cream
         ============================================================ */
      .qs { padding-top: 110px; padding-bottom: 110px; }
      .qs-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 32px;
        margin-bottom: 36px;
      }
      .qs-head-text { max-width: 560px; }
      .qs-eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-persimmon-deep);
      }
      .qs-h2 {
        margin: 12px 0 0;
        font-family: var(--font-display-stack);
        font-size: clamp(32px, 4.2vw, 52px);
        line-height: 1.05;
        letter-spacing: -0.022em;
        color: var(--color-ink);
      }
      .qs-sub {
        margin: 16px 0 0;
        font-size: 15px;
        line-height: 1.55;
        color: var(--color-ink-soft);
      }
      .qs-controls { display: inline-flex; gap: 8px; }
      .qs-ctrl {
        width: 40px;
        height: 40px;
        border-radius: 99px;
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        color: var(--color-ink);
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 160ms ease, transform 160ms ease, border 160ms ease;
      }
      .qs-ctrl:hover {
        border-color: var(--color-ink);
        background: var(--color-paper);
        transform: translateY(-1px);
      }
      /* Arrows hidden on desktop where the 4-col grid shows everything */
      @media (min-width: 961px) {
        .qs-controls { display: none; }
      }

      /* Layout: 4-col grid on desktop, horizontal snap-scroll on mobile */
      .qs-scroller {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 18px;
      }
      @media (max-width: 960px) {
        .qs-scroller {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-padding: 0 24px;
          padding: 8px 24px 28px;
          margin: 0 -24px;
          scrollbar-width: thin;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .qs-scroller::-webkit-scrollbar { height: 6px; }
        .qs-scroller::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 99px; }
        .qs-card { flex: 0 0 300px; scroll-snap-align: start; }
      }

      /* Card frame */
      .qs-card {
        position: relative;
        isolation: isolate;
        height: 460px;
        padding: 20px;
        border-radius: 22px;
        background: var(--bg);
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: hidden;
        box-shadow: 0 6px 24px -8px rgba(0, 0, 0, 0.15);
        transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 260ms ease;
      }
      .qs-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 44px -12px rgba(0, 0, 0, 0.28);
      }
      /* Radial accent glow in the bottom-right of each card */
      .qs-card-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(70% 55% at 100% 100%, var(--glow) 0%, transparent 60%);
        opacity: 0.12;
        pointer-events: none;
        z-index: 0;
      }
      .qs-card > *:not(.qs-card-glow) { position: relative; z-index: 1; }

      .qs-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .qs-card-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        color: var(--accent);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .qs-card-arrow {
        width: 24px;
        height: 24px;
        color: rgba(255, 255, 255, 0.35);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 200ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .qs-card:hover .qs-card-arrow {
        color: rgba(255, 255, 255, 0.7);
        transform: translate(2px, -2px);
      }
      .qs-card-title {
        margin: 6px 0 0;
        font-size: 17px;
        font-weight: 500;
        color: #fff;
        letter-spacing: -0.012em;
      }
      .qs-card-body {
        margin: 4px 0 0;
        font-size: 13px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.55);
      }
      .qs-card-divider {
        display: block;
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
        margin: 14px -20px 0;
      }
      .qs-card-visual {
        flex: 1 1 auto;
        margin-top: 14px;
        padding: 14px;
        background: rgba(0, 0, 0, 0.28);
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow: hidden;
        min-height: 0;
      }

      /* ───── Card 1: Mock Interview visual ───── */
      .qs-v { display: flex; flex-direction: column; gap: 8px; min-height: 0; }
      .qs-v-mock { justify-content: space-between; }
      .qs-v-bubble {
        font-size: 11.5px;
        line-height: 1.45;
        padding: 8px 11px;
        border-radius: 11px;
      }
      .qs-v-bubble-l {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.78);
        align-self: flex-start;
        max-width: 92%;
        border-bottom-left-radius: 4px;
      }
      .qs-v-bubble-r {
        background: linear-gradient(135deg, #FF5B2E 0%, #D9461E 100%);
        color: #fff;
        align-self: flex-end;
        max-width: 95%;
        border-bottom-right-radius: 4px;
        box-shadow: 0 8px 18px -8px rgba(255, 91, 46, 0.5);
      }
      .qs-v-scores {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 4px;
      }
      .qs-v-scores span {
        font-size: 10.5px;
        font-weight: 500;
        padding: 4px 9px;
        border-radius: 99px;
        background: rgba(255, 91, 46, 0.13);
        color: #FFA677;
        border: 1px solid rgba(255, 91, 46, 0.25);
      }
      .qs-v-scores b {
        margin-left: 5px;
        font-weight: 700;
        color: #FFD3BB;
      }

      /* ───── Card 2: 47 Steps visual ───── */
      .qs-v-steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .qs-v-step {
        display: grid;
        grid-template-columns: 22px 1fr auto auto;
        align-items: center;
        gap: 9px;
        padding: 7px 9px;
        border-radius: 8px;
        font-size: 12px;
      }
      .qs-v-step-n {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.38);
      }
      .qs-v-step-name { font-size: 12px; font-weight: 500; }
      .qs-v-step-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
      }
      .qs-v-step-count {
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.5);
      }
      .qs-v-step-done .qs-v-step-name { color: rgba(255, 255, 255, 0.92); }
      .qs-v-step-done .qs-v-step-icon { color: #5EEAD4; }
      .qs-v-step-progress {
        background: rgba(45, 212, 191, 0.08);
      }
      .qs-v-step-progress .qs-v-step-name { color: #5EEAD4; }
      .qs-v-step-progress-bar {
        display: block;
        width: 26px;
        height: 4px;
        background: rgba(45, 212, 191, 0.18);
        border-radius: 99px;
        overflow: hidden;
      }
      .qs-v-step-progress-bar span {
        display: block;
        height: 100%;
        background: #2DD4BF;
      }
      .qs-v-step-locked .qs-v-step-name { color: rgba(255, 255, 255, 0.32); }
      .qs-v-step-locked .qs-v-step-icon { color: rgba(255, 255, 255, 0.28); }
      .qs-v-step-locked .qs-v-step-count { opacity: 0.5; }

      /* ───── Card 3: Documents visual ───── */
      .qs-v-doc-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1 1 auto;
      }
      .qs-v-doc {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 9px;
        border-radius: 7px;
      }
      .qs-v-doc-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex: 0 0 auto;
      }
      .qs-v-doc-done .qs-v-doc-dot {
        background: #4ADE80;
        box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.18);
      }
      .qs-v-doc-todo .qs-v-doc-dot {
        background: #FF8A5C;
        box-shadow: 0 0 0 3px rgba(255, 91, 46, 0.20);
      }
      .qs-v-doc-text {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
        min-width: 0;
      }
      .qs-v-doc-text b {
        font-size: 11.5px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }
      .qs-v-doc-text small {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.42);
        margin-top: 2px;
      }
      .qs-v-doc-todo .qs-v-doc-text small {
        color: #FF8A5C;
        font-weight: 500;
      }
      .qs-v-doc-progress {
        height: 5px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 99px;
        overflow: hidden;
        margin-top: 4px;
      }
      .qs-v-doc-progress span {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #FF8A5C 0%, #FF5B2E 100%);
        border-radius: 99px;
      }
      .qs-v-doc-summary {
        margin: 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
      }

      /* ───── Card 4: Parent View visual ───── */
      .qs-v-parent-title {
        margin: 0;
        font-family: var(--font-display-stack);
        font-style: italic;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.88);
      }
      .qs-v-parent-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 99px;
        overflow: hidden;
      }
      .qs-v-parent-bar span {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #FF8A5C 0%, #FF5B2E 100%);
        border-radius: 99px;
      }
      .qs-v-parent-meta {
        margin: 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
      }
      .qs-v-parent-meta b {
        font-weight: 600;
        color: rgba(255, 255, 255, 0.85);
      }
      .qs-v-parent-act {
        list-style: none;
        margin: 4px 0 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .qs-v-parent-act li {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        padding: 2px 0;
      }
      .qs-v-parent-act li small {
        margin-left: auto;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
      }
      .qs-v-parent-check {
        color: #4ADE80;
        flex: 0 0 auto;
      }
      .qs-v-parent-now {
        color: #FF8A5C !important;
        font-weight: 500;
      }
      .qs-v-parent-now-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FF8A5C;
        box-shadow: 0 0 0 3px rgba(255, 91, 46, 0.22);
        flex: 0 0 auto;
      }
      .qs-v-parent-live {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.45);
        letter-spacing: 0.04em;
      }
      .qs-v-parent-live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ADE80;
        box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.22);
        animation: qs-live-pulse 1.8s ease-in-out infinite;
      }
      @keyframes qs-live-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.45; }
      }

      @media (max-width: 720px) {
        .qs-head { flex-direction: column; align-items: flex-start; }
      }
      @media (prefers-reduced-motion: reduce) {
        .qs-v-parent-live-dot { animation: none; }
        .qs-card { transition: none; }
      }

      /* Reviews.app marquee */
      .mac-reviews { padding-top: 40px; }
      .mac-marquee {
        position: relative;
        margin-top: 28px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        --mask: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
        -webkit-mask-image: var(--mask);
        mask-image: var(--mask);
      }
      .mac-marquee-row {
        overflow: hidden;
        width: 100%;
      }
      .mac-marquee-track {
        display: flex;
        gap: 16px;
        width: max-content;
        will-change: transform;
      }
      .mac-marquee-track--ltr {
        animation: mac-marquee-ltr 64s linear infinite;
      }
      .mac-marquee-track--rtl {
        animation: mac-marquee-rtl 72s linear infinite;
      }
      .mac-marquee:hover .mac-marquee-track { animation-play-state: paused; }
      @keyframes mac-marquee-ltr {
        from { transform: translate3d(0, 0, 0); }
        to   { transform: translate3d(-50%, 0, 0); }
      }
      @keyframes mac-marquee-rtl {
        from { transform: translate3d(-50%, 0, 0); }
        to   { transform: translate3d(0, 0, 0); }
      }
      /* ============================================================
         Reviews — charcoal card, persimmon ring, refined hierarchy.
         Top: stars + interview-duration chip.
         Middle: serif italic quote with persimmon opening glyph.
         Bottom: avatar + name + role + sealed "Stamped" badge.
         ============================================================ */
      .mac-review-tilt {
        flex: 0 0 auto;
        border-radius: 16px;
      }
      .mac-review-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 320px;
        min-height: 230px;
        background: #1A1918;
        color: #F5EFE3;
        border: 1px solid rgba(255, 91, 46, 0.55);
        border-radius: 16px;
        padding: 18px 18px 16px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 0 0 1px rgba(255, 91, 46, 0.12),
          0 8px 24px -12px rgba(255, 91, 46, 0.30),
          0 20px 40px -28px rgba(0, 0, 0, 0.55);
        transition:
          border-color 240ms cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 240ms cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
      .mac-review-card::before {
        /* Subtle persimmon glow that warms on hover — color only, no transform */
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          120% 80% at 50% 0%,
          rgba(255, 91, 46, 0.06) 0%,
          transparent 60%
        );
        pointer-events: none;
        opacity: 0;
        transition: opacity 240ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .mac-review-tilt:hover .mac-review-card {
        border-color: rgba(255, 91, 46, 0.85);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.08) inset,
          0 0 0 1px rgba(255, 91, 46, 0.20),
          0 14px 32px -16px rgba(255, 91, 46, 0.45),
          0 24px 48px -28px rgba(0, 0, 0, 0.65);
      }
      .mac-review-tilt:hover .mac-review-card::before {
        opacity: 1;
      }

      .mac-review-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .mac-review-stars {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .mac-review-star {
        transform-origin: center;
        will-change: transform, opacity;
      }
      .mac-review-chip {
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: #FFC6AE;
        background: rgba(255, 91, 46, 0.14);
        border: 1px solid rgba(255, 91, 46, 0.30);
        border-radius: 99px;
        white-space: nowrap;
      }

      .mac-review-quote {
        position: relative;
        margin: 4px 0 0;
        font-family: var(--font-display-stack);
        font-style: italic;
        font-size: 16px;
        line-height: 1.45;
        letter-spacing: -0.005em;
        color: rgba(245, 239, 227, 0.92);
        flex: 1 1 auto;
      }
      .mac-review-quote-mark {
        position: absolute;
        top: -10px;
        left: -4px;
        font-family: var(--font-display-stack);
        font-style: normal;
        font-size: 28px;
        line-height: 1;
        color: var(--color-persimmon);
        opacity: 0.85;
        pointer-events: none;
        user-select: none;
      }

      .mac-review-hairline {
        display: block;
        height: 1px;
        background: rgba(245, 239, 227, 0.10);
      }

      .mac-review-foot {
        display: grid;
        grid-template-columns: 32px 1fr auto;
        align-items: center;
        gap: 10px;
      }
      .mac-review-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: #1C1B1A;
        border: 1px solid rgba(245, 239, 227, 0.10);
        flex: 0 0 auto;
      }
      .mac-review-meta { min-width: 0; }
      .mac-review-name {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: #F5EFE3;
        line-height: 1.2;
        letter-spacing: -0.005em;
      }
      .mac-review-role {
        margin: 1px 0 0;
        font-size: 11.5px;
        color: rgba(245, 239, 227, 0.50);
        line-height: 1.2;
      }
      .mac-review-stamp {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(255, 198, 174, 0.85);
      }
      .mac-review-stamp svg {
        color: var(--color-persimmon);
      }

      @media (max-width: 640px) {
        .mac-review-card {
          width: 280px;
          min-height: 220px;
          padding: 16px 16px 14px;
        }
        .mac-review-quote { font-size: 14.5px; }
        .mac-marquee-track--ltr { animation-duration: 48s; }
        .mac-marquee-track--rtl { animation-duration: 54s; }
      }

      /* reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .mac-window { transition: none !important; transform: none !important; opacity: 1 !important; }
        .mac-tab-body { animation: none !important; }
        .mac-page { animation: none !important; transform: none !important; }
        .mac-mock-video { display: none; }
        .mac-doc-dot-check { animation: none !important; }
        .mac-marquee-track { animation: none !important; transform: none !important; }
        .mac-marquee-row { overflow-x: auto; }
      }
    `}</style>
  );
}
