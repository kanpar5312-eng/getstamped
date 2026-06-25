"use client";

import { useEffect, useRef, useState } from "react";
import Carousel, { type CarouselItem } from "@/components/ui/Carousel";

/* ════════════════════════════════════════════════════════════════════════
   Testimonials — paper-on-ink editorial section that wraps the React Bits
   Carousel. Six grounded F-1 student testimonials, each with name,
   program, consulate, and a persimmon-tinted initial avatar.

   Carousel timings are untouched. Brand colors override its default
   dark-purple palette via scoped CSS at the bottom of the file.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#1C1917";
const PAPER = "#FAF8F4";
const PERSIMMON = "#E8622A";
const NOCTURNAL = "#114C5A";
const FORSYTHA = "#FFC801";
// Kept for any consumer that imports the constants; not all are used.
void INK;

type Testimonial = {
  name: string;
  initials: string;
  program: string;
  university: string;
  consulate: string;
  quote: string;
  stamped: string;
  tint: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ananya Iyer",
    initials: "AI",
    program: "MS Computer Science",
    university: "Carnegie Mellon",
    consulate: "Mumbai",
    quote:
      "The 47-step list felt overwhelming on day one. By week three it was just a checklist. My DS-160 cleared first time and the officer asked exactly the funding question the mock interview had drilled.",
    stamped: "Stamped · Aug 2025",
    tint: "#E8622A",
  },
  {
    name: "Rohit Sharma",
    initials: "RS",
    program: "MS Data Science",
    university: "Northeastern",
    consulate: "Hyderabad",
    quote:
      "The vault caught a missing signature on my I-20 the day before my appointment. I would have walked into Hyderabad with a 221(g) on the table. Worth it for that one catch alone.",
    stamped: "Stamped · Jul 2025",
    tint: "#1C1917",
  },
  {
    name: "Folake Adeyemi",
    initials: "FA",
    program: "MS Mechanical Eng.",
    university: "Purdue",
    consulate: "Lagos",
    quote:
      "Most prep advice online is American students guessing what officers want. GetStamped breaks down the four things they actually score, and the mock interview voice doesn't let you get away with vague answers.",
    stamped: "Stamped · Jun 2025",
    tint: "#E8622A",
  },
  {
    name: "Diego Ramírez",
    initials: "DR",
    program: "MBA",
    university: "UT Austin",
    consulate: "Bogotá",
    quote:
      "My parents stopped asking me for updates the day I shared the read-only link. They could see exactly where I was — phase, mocks, documents. Replaced three phone calls a week.",
    stamped: "Stamped · Sep 2025",
    tint: "#1C1917",
  },
  {
    name: "Ji-Min Park",
    initials: "JP",
    program: "MS Industrial Eng.",
    university: "Purdue",
    consulate: "Seoul",
    quote:
      "Brutal in the best way. I did six mock interviews. By the real one I'd already heard every variant of 'why this school' the system could think to ask. The officer's question felt familiar.",
    stamped: "Stamped · May 2025",
    tint: "#E8622A",
  },
  {
    name: "Priya Nair",
    initials: "PN",
    program: "MS Bioinformatics",
    university: "UC San Diego",
    consulate: "Chennai",
    quote:
      "Phase 1 was free, so I tried it. Then I paid because there was nowhere else to get this stuff in order. The financial story rubric saved me — my answer was way too vague before.",
    stamped: "Stamped · Jul 2025",
    tint: "#1C1917",
  },
];

function Avatar({ t }: { t: Testimonial }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: 999,
        background: t.tint === PERSIMMON ? "rgba(232,98,42,0.14)" : "rgba(250,248,244,0.10)",
        border: `1px solid ${t.tint === PERSIMMON ? "rgba(232,98,42,0.45)" : "rgba(250,248,244,0.18)"}`,
        color: t.tint === PERSIMMON ? PERSIMMON : PAPER,
        fontFamily: "var(--font-display-stack)",
        fontSize: 22,
        letterSpacing: "-0.02em",
      }}
    >
      {t.initials}
    </span>
  );
}

function QuoteMark() {
  return (
    <span
      aria-hidden
      style={{
        fontFamily: "var(--font-display-stack)",
        fontSize: 64,
        lineHeight: 0.7,
        color: PERSIMMON,
        opacity: 0.85,
        display: "inline-block",
      }}
    >
      &ldquo;
    </span>
  );
}

function Stars() {
  return (
    <span aria-hidden style={{ display: "inline-flex", gap: 3, color: FORSYTHA }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

const Title = ({ t }: { t: Testimonial }) => (
  <span style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <QuoteMark />
      <span
        style={{
          fontFamily: "var(--font-display-stack)",
          fontWeight: 400,
          fontSize: 18,
          lineHeight: 1.45,
          color: PAPER,
          letterSpacing: "-0.005em",
        }}
      >
        {t.quote}
      </span>
    </span>
  </span>
);

const Description = ({ t }: { t: Testimonial }) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 18,
      paddingTop: 16,
      borderTop: "1px solid rgba(250,248,244,0.08)",
    }}
  >
    <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      <Avatar t={t} />
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontWeight: 600,
            fontSize: 14,
            color: PAPER,
            letterSpacing: "-0.005em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t.name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 12,
            color: "rgba(250,248,244,0.55)",
            lineHeight: 1.4,
          }}
        >
          {t.program} · {t.university}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(250,248,244,0.4)",
            marginTop: 2,
          }}
        >
          {t.consulate} · {t.stamped}
        </span>
      </span>
    </span>
    <Stars />
  </span>
);

export function Testimonials() {
  const [baseWidth, setBaseWidth] = useState(520);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      if (w < 480) setBaseWidth(Math.min(w - 32, 360));
      else if (w < 900) setBaseWidth(440);
      else setBaseWidth(560);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const items: CarouselItem[] = TESTIMONIALS.map((t, i) => ({
    id: i,
    title: <Title t={t} />,
    description: <Description t={t} />,
  }));

  return (
    <section
      id="testimonials"
      aria-label="Student testimonials"
      style={{
        position: "relative",
        background: NOCTURNAL,
        color: PAPER,
        padding: "clamp(80px, 12vw, 160px) 24px",
        overflow: "hidden",
      }}
    >
      {/* Persimmon glow */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 900,
          background:
            "radial-gradient(closest-side, rgba(232,98,42,0.20), rgba(232,98,42,0) 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1080,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 11,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: PERSIMMON,
            margin: 0,
          }}
        >
          What students say
        </p>

        <h2
          className="gs-testi-h2"
          style={{
            fontFamily: "var(--font-display-stack)",
            fontWeight: 400,
            fontSize: "clamp(40px, 5.5vw, 72px)",
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
            margin: "20px auto 0",
            color: PAPER,
            maxWidth: 720,
            textWrap: "balance" as "balance",
          }}
        >
          Real students.{" "}
          <em style={{ color: PERSIMMON, fontStyle: "italic" }}>Real stamps.</em>
        </h2>

        <p
          style={{
            margin: "22px auto 0",
            maxWidth: 580,
            fontSize: 17,
            lineHeight: 1.65,
            color: "rgba(250,248,244,0.65)",
          }}
        >
          Six students. Six consulates. Six approvals. They used GetStamped to walk in
          knowing exactly what an officer was about to ask — and what counted as a good
          answer.
        </p>

        {/* Trust band */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "36px 0 0 0",
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(250,248,244,0.45)",
          }}
        >
          <li style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Stars /> 4.9 average score
          </li>
          <li aria-hidden style={{ color: "rgba(250,248,244,0.15)" }}>·</li>
          <li>1,200+ Phase 1 students</li>
          <li aria-hidden style={{ color: "rgba(250,248,244,0.15)" }}>·</li>
          <li>92% report officer asked a question they rehearsed</li>
        </ul>
      </div>

      <div
        ref={ref}
        className="gs-testi-carousel"
        style={{
          marginTop: 56,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Carousel
          items={items}
          baseWidth={baseWidth}
          autoplay
          autoplayDelay={5000}
          pauseOnHover
          loop
        />
      </div>

      {/* Brand override for the carousel internals (scoped to this section) */}
      <style>{`
        .gs-testi-carousel .carousel-container {
          border: 1px solid rgba(250,248,244,0.10);
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(250,248,244,0.025), rgba(250,248,244,0.0));
          box-shadow: 0 30px 80px -30px rgba(0,0,0,0.55);
        }
        .gs-testi-carousel .carousel-item {
          background: rgba(250,248,244,0.04);
          border: 1px solid rgba(250,248,244,0.10);
          padding: 28px 26px 24px 26px;
          min-height: 320px;
        }
        .gs-testi-carousel .carousel-item:hover {
          border-color: rgba(232,98,42,0.35);
        }
        .gs-testi-carousel .carousel-item-header { display: none; }
        .gs-testi-carousel .carousel-item-content {
          padding: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .gs-testi-carousel .carousel-item-title {
          font-weight: 400;
          font-size: inherit;
          color: ${PAPER};
          margin: 0;
        }
        .gs-testi-carousel .carousel-item-description {
          font-size: inherit;
          color: inherit;
          margin: 0;
        }
        .gs-testi-carousel .carousel-indicator.active {
          background-color: ${PERSIMMON};
          box-shadow: 0 0 0 4px rgba(232,98,42,0.15);
        }
        .gs-testi-carousel .carousel-indicator.inactive {
          background-color: rgba(250,248,244,0.18);
        }
        .gs-testi-carousel .carousel-indicator:focus-visible {
          outline-color: ${PERSIMMON};
        }
        @media (max-width: 640px) {
          .gs-testi-carousel .carousel-item { padding: 22px 20px; min-height: 360px; }
          .gs-testi-h2 { font-size: 36px !important; }
        }
      `}</style>
    </section>
  );
}
