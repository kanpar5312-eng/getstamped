"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions/profile";
import { BrandMark } from "@/components/ui/BrandMark";
import { useCountry } from "@/lib/countryContext";
import {
  SUPPORTED_COUNTRIES,
  type CountryCode,
} from "@/lib/visa-countries";
import { PersonalizationCurtain } from "@/components/onboarding/PersonalizationCurtain";
import { US_UNIVERSITIES } from "@/lib/university-list";

type Props = {
  firstName: string;
  initialCountry?: string;
};

/* ---------- data ---------- */
const COUNTRIES = [
  "India", "China", "Vietnam", "South Korea", "Nigeria", "Brazil", "Bangladesh",
  "Mexico", "Nepal", "Pakistan", "Indonesia", "Taiwan", "Japan", "Colombia",
  "Ghana", "Kenya", "Philippines", "Turkey", "Saudi Arabia", "Canada", "Other",
];
const INTAKES = ["Fall 2026", "Spring 2027", "Fall 2027", "Not sure yet"];
const PROGRAMS = ["Bachelor's", "Master's", "PhD", "Other"];
const FUNDING = [
  { v: "parents", label: "Parents / family" },
  { v: "self", label: "Self-funded" },
  { v: "loan", label: "Education loan" },
  { v: "scholarship", label: "Scholarship" },
  { v: "mix", label: "A mix of these" },
];
const CONSULATES = [
  "Mumbai", "New Delhi", "Chennai", "Hyderabad", "Kolkata", "Beijing", "Shanghai",
  "Guangzhou", "Ho Chi Minh City", "Hanoi", "Seoul", "Lagos", "Abuja", "São Paulo",
  "Rio de Janeiro", "Dhaka", "Mexico City", "Kathmandu", "Islamabad", "Other",
];

type Form = {
  firstName: string;
  lastName: string;
  country: string;
  university: string;
  program: string;
  intake: string;
  interviewBooked: "yes" | "no" | "";
  interviewDate: string;
  consulate: string;
  funding: string;
  destination: CountryCode | "";
};

const STEPS = ["name", "country", "study", "intake", "interview", "funding", "destination"] as const;
type Step = typeof STEPS[number];

export function OnboardingClient({ firstName: initialFirstName, initialCountry }: Props) {
  const router = useRouter();
  const { setCountry } = useCountry();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [err, setErr] = useState("");
  const [saving, startSaving] = useTransition();
  const [curtain, setCurtain] = useState<
    null | { destination: CountryCode; applyingFrom: string | null; firstName: string }
  >(null);
  const [f, setF] = useState<Form>({
    firstName: initialFirstName ?? "",
    lastName: "",
    country: initialCountry ?? "",
    university: "",
    program: "",
    intake: "",
    interviewBooked: "",
    interviewDate: "",
    consulate: "",
    funding: "",
    destination: "",
  });
  const set = (k: keyof Form, v: string) => setF((p) => ({ ...p, [k]: v }));
  const setDestination = (code: CountryCode) =>
    setF((p) => ({ ...p, destination: code }));

  const valid = useMemo(() => {
    const step: Step = STEPS[i];
    switch (step) {
      case "name": return f.firstName.trim().length > 1;
      case "country": return Boolean(f.country);
      case "study": return f.university.trim().length > 2 && Boolean(f.program);
      case "intake": return Boolean(f.intake);
      case "interview":
        if (f.interviewBooked === "no") return true;
        if (f.interviewBooked === "yes") return Boolean(f.interviewDate) && Boolean(f.consulate);
        return false;
      case "funding": return Boolean(f.funding);
      case "destination": return Boolean(f.destination);
    }
  }, [i, f]);

  // Lookup table mapping the verbose home-country names from the existing
  // onboarding chips to APPLICANT_COUNTRIES codes used by the curtain.
  const homeCodeFromName = (name: string): string | null => {
    const k = name.toLowerCase();
    const map: Record<string, string> = {
      "india":"IN","china":"CN","vietnam":"VN","south korea":"KR","nigeria":"NG",
      "brazil":"BR","bangladesh":"BD","mexico":"MX","nepal":"NP","pakistan":"PK",
      "indonesia":"ID","taiwan":"TW","japan":"JP","colombia":"CO","ghana":"GH",
      "kenya":"KE","philippines":"PH","turkey":"TR","saudi arabia":"SA",
    };
    return map[k] ?? null;
  };

  const next = () => {
    if (!valid || saving) return;
    setErr("");
    if (i < STEPS.length - 1) {
      setDir(1);
      setI(i + 1);
      return;
    }
    startSaving(async () => {
      const res = await completeOnboarding({
        first_name: f.firstName.trim(),
        last_name: f.lastName.trim() || undefined,
        country: f.country,
        university: f.university.trim(),
        program_type: f.program,
        intake_term: f.intake,
        consulate: f.interviewBooked === "yes" ? f.consulate : undefined,
        interview_date: f.interviewBooked === "yes" ? f.interviewDate : undefined,
        funding_source: f.funding,
      });
      if (!res.ok) {
        setErr(res.error ?? "Couldn't save. Check your connection and try again.");
        return;
      }

      // Save destination country selection — applying-from is the home-country
      // chip the user already picked, translated to a 2-letter code where we
      // recognise it (otherwise null — curtain falls back to a generic line).
      if (f.destination) {
        const applyingFrom = homeCodeFromName(f.country);
        try {
          await setCountry(f.destination, applyingFrom);
        } catch {
          // Non-fatal — the dashboard's gate will catch missing selection.
        }

        // Show the personalization curtain, then navigate to the dashboard.
        // The curtain itself flips a sessionStorage flag so DashboardWake.tsx
        // can trigger the dashboard's wake animation right on mount.
        setCurtain({
          destination: f.destination,
          applyingFrom,
          firstName: f.firstName.trim() || "you",
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  const back = () => {
    if (i > 0 && !saving) {
      setDir(-1);
      setI(i - 1);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Don't submit if a multi-line text isn't focused — keep simple, just trigger next
      next();
    }
  };

  const pct = ((i + 1) / STEPS.length) * 100;
  const step: Step = STEPS[i];

  // Once destination is picked + saved, the curtain takes over the whole
  // viewport. It fires the dashboard wake at fade-start, then navigates.
  if (curtain) {
    return (
      <PersonalizationCurtain
        destination={curtain.destination}
        applyingFrom={curtain.applyingFrom}
        firstName={curtain.firstName}
        onDone={() => {
          // Persist the wake intent so DashboardWake.tsx can stagger the
          // dashboard's children on first mount after the route change.
          try { sessionStorage.setItem("gs.systemWake", "1"); } catch {}
          router.push("/dashboard");
          router.refresh();
        }}
      />
    );
  }

  return (
    <main className="ob" onKeyDown={onKey}>
      <header className="ob-head">
        <span className="ob-logo inline-flex items-center gap-2 text-[var(--color-ink)]">
          <BrandMark size={22} />
          <span className="font-display">GetStamped</span>
        </span>
        <span className="ob-count">{i + 1} / {STEPS.length}</span>
      </header>

      <div className="ob-track" aria-hidden>
        <div className="ob-fill" style={{ width: `${pct}%` }} />
      </div>

      <section key={i} className={`ob-card ${dir === 1 ? "in-r" : "in-l"}`}>
        {step === "name" && (
          <>
            <p className="ob-eyebrow">FIRST THINGS FIRST</p>
            <h1 className="ob-title">What should we call you?</h1>
            <div className="ob-grid2">
              <Field label="First name" value={f.firstName} autoFocus
                onChange={(v) => set("firstName", v)} placeholder="Aarav" />
              <Field label="Last name (optional)" value={f.lastName}
                onChange={(v) => set("lastName", v)} placeholder="Sharma" />
            </div>
          </>
        )}

        {step === "country" && (
          <>
            <p className="ob-eyebrow">WHERE YOU&rsquo;RE APPLYING FROM</p>
            <h1 className="ob-title">
              Which country are you in{f.firstName ? `, ${f.firstName}` : ""}?
            </h1>
            <p className="ob-sub">Sets your consulate options and pricing currency.</p>
            <div className="ob-chips">
              {COUNTRIES.map((c) => (
                <Chip key={c} active={f.country === c} onClick={() => set("country", c)}>{c}</Chip>
              ))}
            </div>
          </>
        )}

        {step === "study" && (
          <>
            <p className="ob-eyebrow">YOUR ADMISSION</p>
            <h1 className="ob-title">Where are you headed?</h1>
            <UniversityField
              value={f.university}
              onChange={(v) => set("university", v)}
            />
            <p className="ob-label">Program type</p>
            <div className="ob-chips">
              {PROGRAMS.map((p) => (
                <Chip key={p} active={f.program === p} onClick={() => set("program", p)}>{p}</Chip>
              ))}
            </div>
          </>
        )}

        {step === "intake" && (
          <>
            <p className="ob-eyebrow">YOUR TIMELINE</p>
            <h1 className="ob-title">Which intake are you targeting?</h1>
            <p className="ob-sub">We build your 47-step timeline around this date.</p>
            <div className="ob-stack">
              {INTAKES.map((t) => (
                <RowOption key={t} active={f.intake === t} onClick={() => set("intake", t)}
                  title={t}
                  sub={t === "Not sure yet"
                    ? "We'll assume the nearest intake — you can change it later."
                    : undefined}
                />
              ))}
            </div>
          </>
        )}

        {step === "interview" && (
          <>
            <p className="ob-eyebrow">THE BIG DAY</p>
            <h1 className="ob-title">Have you booked your visa interview?</h1>
            <div className="ob-chips">
              <Chip active={f.interviewBooked === "yes"} onClick={() => set("interviewBooked", "yes")}>
                Yes, it&rsquo;s booked
              </Chip>
              <Chip active={f.interviewBooked === "no"} onClick={() => set("interviewBooked", "no")}>
                Not yet
              </Chip>
            </div>
            {f.interviewBooked === "yes" && (
              <div className="ob-grid2 ob-mt">
                <div className="ob-field">
                  <label className="ob-label" htmlFor="ob-int-date">Interview date</label>
                  <input id="ob-int-date" type="date" className="ob-input" value={f.interviewDate}
                    onChange={(e) => set("interviewDate", e.target.value)} />
                </div>
                <div className="ob-field">
                  <label className="ob-label" htmlFor="ob-int-consulate">Consulate</label>
                  <select id="ob-int-consulate" className="ob-input" value={f.consulate}
                    onChange={(e) => set("consulate", e.target.value)}>
                    <option value="">Select…</option>
                    {CONSULATES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}
            {f.interviewBooked === "no" && (
              <p className="ob-hint">
                No problem — we&rsquo;ll remind you when it&rsquo;s time to book (around step 26).
              </p>
            )}
          </>
        )}

        {step === "funding" && (
          <>
            <p className="ob-eyebrow">ALMOST DONE</p>
            <h1 className="ob-title">How is your education funded?</h1>
            <p className="ob-sub">The officer will ask. We&rsquo;ll prep your answer with you.</p>
            <div className="ob-stack">
              {FUNDING.map((o) => (
                <RowOption key={o.v} active={f.funding === o.v}
                  onClick={() => set("funding", o.v)} title={o.label} />
              ))}
            </div>
          </>
        )}

        {step === "destination" && (
          <>
            <p className="ob-eyebrow">LAST ONE — WHERE TO?</p>
            <h1 className="ob-title">
              Where are you going to study{f.firstName ? `, ${f.firstName}` : ""}?
            </h1>
            <p className="ob-sub">
              This sets your visa playbook, document checks, and interview bank.
              You can switch later — your progress carries over.
            </p>
            <div className="ob-dest-grid">
              {SUPPORTED_COUNTRIES.map((c) => {
                const active = f.destination === c.code;
                const locked = Boolean(c.comingSoon);
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-disabled={locked}
                    disabled={locked}
                    onClick={() => !locked && setDestination(c.code)}
                    className={`ob-dest-card${active ? " is-active" : ""}${locked ? " is-locked" : ""}`}
                  >
                    <span className="ob-dest-flag" aria-hidden>{c.flag_emoji}</span>
                    <span className="ob-dest-name">{c.name}</span>
                    <span className="ob-dest-visa">{c.visa_type}</span>
                    <span className="ob-dest-pt">
                      {locked ? "Coming soon" : `~${c.processing_time_weeks} weeks processing`}
                    </span>
                    {active && !locked ? (
                      <span className="ob-dest-tick" aria-hidden>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                          <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <div className="ob-dest-card ob-dest-soon" aria-disabled>
                <span className="ob-dest-flag" aria-hidden>+</span>
                <span className="ob-dest-name">More countries</span>
                <span className="ob-dest-visa">Coming soon</span>
                <span className="ob-dest-pt">Schengen, NZ, Ireland…</span>
              </div>
            </div>
          </>
        )}

        {err && <p className="ob-err">{err}</p>}

        <div className="ob-actions">
          {i > 0 ? (
            <button className="ob-back" onClick={back} type="button">← Back</button>
          ) : <span />}
          <button className="ob-next" disabled={!valid || saving} onClick={next} type="button">
            {saving
              ? "Building your timeline…"
              : i === STEPS.length - 1 ? "Finish →" : "Continue →"}
          </button>
        </div>
      </section>

      <style jsx>{`
        .ob {
          min-height: 100dvh;
          background: var(--color-paper);
          display: flex; flex-direction: column; align-items: center;
          padding: 0 20px 48px;
        }
        .ob-head {
          width: 100%; max-width: 640px;
          display: flex; justify-content: space-between; align-items: center;
          padding: 28px 0 16px;
        }
        .ob-logo {
          font-family: var(--font-display-stack);
          font-size: 19px;
          color: var(--color-ink);
        }
        .ob-count {
          font-size: 12px;
          color: var(--color-muted);
          font-variant-numeric: tabular-nums;
        }
        .ob-track {
          width: 100%; max-width: 640px;
          height: 3px; border-radius: 99px;
          background: var(--color-border-soft);
          overflow: hidden;
        }
        .ob-fill {
          height: 100%;
          background: var(--color-persimmon);
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .ob-card { width: 100%; max-width: 640px; margin-top: 56px; }
        .in-r { animation: inR 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .in-l { animation: inL 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes inR { from { opacity: 0; transform: translateX(26px); } }
        @keyframes inL { from { opacity: 0; transform: translateX(-26px); } }

        .ob-eyebrow {
          font-size: 10px; letter-spacing: 0.18em; font-weight: 600;
          color: var(--color-persimmon-deep);
          margin: 0;
          text-transform: uppercase;
        }
        .ob-title {
          font-family: var(--font-display-stack);
          font-weight: 400;
          font-size: clamp(26px, 4.5vw, 36px);
          letter-spacing: -0.02em;
          color: var(--color-ink);
          margin: 10px 0 0;
          line-height: 1.15;
        }
        .ob-sub {
          font-size: 14px; color: var(--color-ink-soft);
          margin: 10px 0 0; max-width: 460px; line-height: 1.6;
        }
        .ob-label {
          font-size: 12px; font-weight: 500;
          color: var(--color-ink-soft);
          margin: 22px 0 8px;
          display: block;
        }
        .ob-hint {
          font-size: 13px; color: var(--color-muted);
          margin-top: 16px;
        }
        .ob-mt { margin-top: 22px; }
        .ob-err {
          font-size: 13px;
          color: var(--color-persimmon-deep);
          margin-top: 16px;
        }

        .ob-grid2 {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px; margin-top: 26px;
        }
        @media (max-width: 540px) {
          .ob-grid2 { grid-template-columns: 1fr; }
        }

        .ob-chips {
          display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px;
        }
        .ob-stack {
          display: flex; flex-direction: column; gap: 8px; margin-top: 24px;
        }

        .ob-field { display: flex; flex-direction: column; }
        .ob-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: var(--color-paper-soft);
          padding: 11px 14px;
          font-size: 14px;
          color: var(--color-ink);
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .ob-input:focus {
          border-color: var(--color-persimmon);
          box-shadow: 0 0 0 4px rgba(255, 91, 46, 0.10);
        }

        .ob-actions {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 40px;
        }
        .ob-back {
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: var(--color-muted);
          padding: 8px 4px;
        }
        .ob-back:hover { color: var(--color-ink); }
        .ob-next {
          border: none; cursor: pointer; border-radius: 10px;
          background: var(--color-persimmon);
          color: var(--color-paper-soft);
          font-size: 14px; font-weight: 500;
          padding: 12px 26px;
          transition: background 0.2s, transform 0.15s;
        }
        .ob-next:hover:not(:disabled) { background: var(--color-persimmon-deep); }
        .ob-next:active:not(:disabled) { transform: scale(0.98); }
        .ob-next:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Destination step grid ─────────────────────────────────── */
        .ob-dest-grid {
          margin-top: 24px;
          display: grid; gap: 12px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 540px) { .ob-dest-grid { grid-template-columns: 1fr; } }
        .ob-dest-card {
          position: relative; cursor: pointer;
          all: unset;
          display: flex; flex-direction: column; gap: 4px;
          padding: 18px 20px;
          background: var(--color-paper-soft);
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          transition: border-color 200ms var(--ease-soft),
            background-color 200ms var(--ease-soft),
            transform 160ms var(--ease-soft);
        }
        @media (hover: hover) and (pointer: fine) {
          .ob-dest-card:not(.ob-dest-soon):hover {
            border-color: var(--color-persimmon);
            background: color-mix(in srgb, var(--color-persimmon) 4%, var(--color-paper-soft));
          }
        }
        .ob-dest-card:not(.ob-dest-soon):active { transform: scale(0.98); }
        .ob-dest-card.is-active {
          border-width: 2px; padding: 17px 19px;
          border-color: var(--color-persimmon);
          background: color-mix(in srgb, var(--color-persimmon) 6%, var(--color-paper-soft));
        }
        .ob-dest-soon {
          border-style: dashed; cursor: default; background: transparent;
        }
        .ob-dest-soon .ob-dest-name,
        .ob-dest-soon .ob-dest-visa,
        .ob-dest-soon .ob-dest-pt { color: var(--color-muted); }
        .ob-dest-card.is-locked {
          opacity: 0.55;
          cursor: not-allowed;
          border-style: dashed;
        }
        .ob-dest-card.is-locked .ob-dest-pt {
          color: var(--color-persimmon-deep);
          font-weight: 600;
        }
        .ob-dest-flag { font-size: 28px; line-height: 1; }
        .ob-dest-name {
          margin-top: 8px;
          font-size: 15px; font-weight: 600; color: var(--color-ink);
        }
        .ob-dest-visa {
          font-family: var(--font-mono-stack);
          font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--color-ink-soft);
        }
        .ob-dest-pt {
          font-size: 11px; color: var(--color-ink-soft);
        }
        .ob-dest-tick {
          position: absolute; top: 12px; right: 12px;
          color: var(--color-persimmon);
        }
      `}</style>
    </main>
  );
}

/* ---------- atoms ---------- */
function Field({ label, value, onChange, placeholder, autoFocus }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: 12, fontWeight: 500,
          color: "var(--color-ink-soft)",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        style={{
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          background: "var(--color-paper-soft)",
          padding: "11px 14px",
          fontSize: 14,
          color: "var(--color-ink)",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-persimmon)";
          e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,91,46,0.10)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

/**
 * UniversityField — search-as-you-type picker, same interaction shape
 * as a Google Places Autocomplete box: type a few letters, a ranked
 * list of matches drops below, click (or arrow+Enter) to select.
 * Backed by a curated list (lib/university-list.ts) rather than a
 * live Places API — no Google Maps billing/API key required. Typing
 * a name that isn't in the list is still accepted as free text so
 * students at schools we haven't listed aren't blocked.
 */
function UniversityField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return US_UNIVERSITIES.slice(0, 8);
    return US_UNIVERSITIES.filter((u) => u.toLowerCase().includes(q)).slice(0, 8);
  }, [value]);

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "flex", flexDirection: "column" }}
      onBlur={(e) => {
        // Close only when focus leaves the whole widget (input + list).
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <label
        style={{
          fontSize: 12, fontWeight: 500,
          color: "var(--color-ink-soft)",
          marginBottom: 8,
        }}
      >
        University
      </label>

      <div style={{ position: "relative" }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-ink-soft)",
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>

        <input
          value={value}
          placeholder="Search for your university"
          autoFocus
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="university-listbox"
          aria-autocomplete="list"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIdx(0);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.style.borderColor = "var(--color-persimmon)";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,91,46,0.10)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onKeyDown={(e) => {
            if (!open || matches.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              select(matches[activeIdx]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-paper-soft)",
            padding: "11px 14px 11px 38px",
            fontSize: 14,
            color: "var(--color-ink)",
            outline: "none",
          }}
        />

        {open && matches.length > 0 && (
          <ul
            id="university-listbox"
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 20,
              margin: 0,
              padding: 6,
              listStyle: "none",
              background: "var(--color-paper)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              boxShadow: "0 16px 40px -12px rgba(11,30,63,0.25)",
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {matches.map((name, idx) => (
              <li key={name} role="option" aria-selected={idx === activeIdx}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(name)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: idx === activeIdx ? "var(--color-paper-soft)" : "transparent",
                    color: "var(--color-ink)",
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="var(--color-persimmon)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p
        style={{
          marginTop: 8,
          fontSize: 11.5,
          color: "var(--color-muted, var(--color-ink-soft))",
        }}
      >
        Don&rsquo;t see it listed? Keep typing — your entry is still saved.
      </p>
    </div>
  );
}

function Chip({ children, active, onClick }: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: "8px 16px",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: active ? 500 : 400,
        border: active
          ? "1px solid var(--color-persimmon)"
          : "1px solid var(--color-border)",
        background: active
          ? "var(--color-persimmon-tint)"
          : "var(--color-paper-soft)",
        color: active
          ? "var(--color-persimmon-deep)"
          : "var(--color-ink)",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}

function RowOption({ title, sub, active, onClick }: {
  title: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        borderRadius: 14,
        padding: "16px 18px",
        cursor: "pointer",
        border: active
          ? "1.5px solid var(--color-persimmon)"
          : "1px solid var(--color-border-soft)",
        background: active
          ? "var(--color-persimmon-tint)"
          : "var(--color-paper-soft)",
        transition: "all 0.18s ease",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          flexShrink: 0,
          border: active
            ? "5px solid var(--color-persimmon)"
            : "1.5px solid var(--color-border)",
          background: "var(--color-paper-soft)",
          transition: "all 0.18s ease",
        }}
      />
      <span>
        <span
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
        >
          {title}
        </span>
        {sub && (
          <span
            style={{
              display: "block",
              fontSize: 12,
              color: "var(--color-muted)",
              marginTop: 3,
            }}
          >
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}
