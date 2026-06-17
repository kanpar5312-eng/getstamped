type StripItem = {
  day: string;
  title: string;
  icon: "user" | "doc" | "money" | "mic";
  locked?: boolean;
};

function Icon({ kind }: { kind: StripItem["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 20,
    height: 20,
    "aria-hidden": true,
  };
  switch (kind) {
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M8 13h7M8 17h5" />
        </svg>
      );
    case "money":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 9v6M18 9v6" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0" />
          <path d="M12 17v4" />
        </svg>
      );
  }
}

function LockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={11}
      height={11}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function WeekOneStrip({
  items,
  staggerIndex = 4,
}: {
  items?: StripItem[];
  staggerIndex?: number;
}) {
  const data: StripItem[] = items ?? [
    { day: "Day 1", title: "Profile", icon: "user" },
    { day: "Day 2", title: "University docs", icon: "doc", locked: true },
    { day: "Day 3", title: "Financial docs", icon: "money", locked: true },
    { day: "Day 4", title: "First mock", icon: "mic", locked: true },
  ];
  return (
    <section
      data-stagger=""
      style={{ "--stagger-index": staggerIndex } as React.CSSProperties}
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
    >
      <p data-eyebrow="">Your week one</p>
      <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((it) => (
          <li
            key={it.day}
            className="relative rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4"
            style={{ opacity: it.locked ? 0.6 : 1 }}
          >
            {it.locked && (
              <span className="absolute right-3 top-3 text-[var(--stone)]">
                <LockGlyph />
              </span>
            )}
            <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--stone)]">
              {it.day}
            </span>
            <div className="mt-3 text-[var(--ink)]">
              <Icon kind={it.icon} />
            </div>
            <div className="mt-2 text-[13px] font-medium leading-snug text-[var(--ink)]">
              {it.title}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
