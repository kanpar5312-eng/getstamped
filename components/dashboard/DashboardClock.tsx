"use client";

/* ════════════════════════════════════════════════════════════════════════════
   DashboardClock — Apple-Clock-style analog watch face that sits next to the
   CountryPill in the top-right of every dashboard page. Hidden on
   /dashboard/support to keep that page calm.

   Rendered SSR-safely: returns null until first mount so the server and
   client agree on the initial DOM, then a setInterval re-renders every
   second. The second hand ticks discretely (iOS small-icon behaviour);
   hour + minute hands interpolate so they don't jump.

   No CSS animation — drawing with SVG transforms means perfect rotation
   accuracy and no reflow.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const HOUR_LABELS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function DashboardClock() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (pathname === "/dashboard/support") return null;
  if (!now) {
    // Reserve the layout slot so the row doesn't reflow on hydration.
    return <div aria-hidden style={{ width: 40, height: 40 }} />;
  }

  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourDeg = (h + m / 60) * 30;
  const minDeg = (m + s / 60) * 6;
  const secDeg = s * 6;

  const label = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      role="img"
      aria-label={`Current time: ${label}`}
      title={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#0A0A0B",
        padding: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)",
        flexShrink: 0,
      }}
    >
      <svg viewBox="-50 -50 100 100" width="100%" height="100%" aria-hidden>
        {/* Face */}
        <circle cx="0" cy="0" r="48" fill="#FAFAFA" />

        {/* Minute ticks (every minute; bolder every 5) */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isHour = i % 5 === 0;
          return (
            <line
              key={i}
              x1="0"
              y1="-46"
              x2="0"
              y2={isHour ? "-42" : "-44.5"}
              stroke="#0A0A0B"
              strokeWidth={isHour ? 1.2 : 0.5}
              transform={`rotate(${i * 6})`}
            />
          );
        })}

        {/* Hour numerals */}
        {HOUR_LABELS.map((n, i) => {
          const angle = ((i * 30 - 90) * Math.PI) / 180;
          const r = 36;
          return (
            <text
              key={n}
              x={Math.cos(angle) * r}
              y={Math.sin(angle) * r}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="11"
              fontFamily="-apple-system, system-ui, sans-serif"
              fontWeight="600"
              fill="#0A0A0B"
            >
              {n}
            </text>
          );
        })}

        {/* Hour hand */}
        <line
          x1="0"
          y1="3"
          x2="0"
          y2="-22"
          stroke="#0A0A0B"
          strokeWidth="3.2"
          strokeLinecap="round"
          transform={`rotate(${hourDeg})`}
        />

        {/* Minute hand */}
        <line
          x1="0"
          y1="4"
          x2="0"
          y2="-32"
          stroke="#0A0A0B"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${minDeg})`}
        />

        {/* Second hand (persimmon, matches brand) */}
        <line
          x1="0"
          y1="8"
          x2="0"
          y2="-36"
          stroke="#FF5B2E"
          strokeWidth="1.2"
          strokeLinecap="round"
          transform={`rotate(${secDeg})`}
        />

        {/* Center pin */}
        <circle cx="0" cy="0" r="1.8" fill="#FF5B2E" />
        <circle cx="0" cy="0" r="0.8" fill="#0A0A0B" />
      </svg>
    </div>
  );
}
