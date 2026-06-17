"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  initialDate?: Date | null;
  initialLocation?: string | null;
  initialTimeOfDay?: "morning" | "afternoon" | null;
};

const CONSULATES = [
  "Mumbai",
  "New Delhi",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Beijing",
  "Shanghai",
  "Guangzhou",
  "Hanoi",
  "Ho Chi Minh City",
  "Seoul",
  "Tokyo",
  "Manila",
  "Bangkok",
  "Jakarta",
  "Kuala Lumpur",
  "Singapore",
  "Lagos",
  "Abuja",
  "Nairobi",
  "Cairo",
  "Istanbul",
  "Tel Aviv",
  "Dubai",
  "Riyadh",
  "London",
  "Frankfurt",
  "Paris",
  "Mexico City",
  "São Paulo",
];

function toDateValue(d?: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function InterviewDetailsModal({
  open,
  onClose,
  initialDate,
  initialLocation,
  initialTimeOfDay,
}: Props) {
  const [date, setDate] = useState(toDateValue(initialDate));
  const [location, setLocation] = useState(initialLocation ?? "Mumbai");
  const [time, setTime] = useState<"morning" | "afternoon">(
    initialTimeOfDay ?? "morning",
  );
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    // Mock: simulate Supabase update + Realtime broadcast
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={initialDate ? "Edit interview" : "Add interview"}
      title="Your visa interview"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !date}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save details"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-[var(--color-ink-soft)]">
            Interview date
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[var(--color-ink-soft)]">
            Consulate
          </span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
          >
            {CONSULATES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-xs font-medium text-[var(--color-ink-soft)]">
            Time of day
          </legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(["morning", "afternoon"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={[
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors capitalize",
                  time === t
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]/60",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          We&rsquo;ll use this to drive your countdown, prep checklist, and
          interview-imminent dashboard mode.
        </p>
      </div>
    </Modal>
  );
}
