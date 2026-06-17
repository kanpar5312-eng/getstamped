"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveEnvKey, clearEnvKey } from "@/app/actions/dev-env";
import type { EnvStatus } from "@/lib/dev-env-config";

type Props = { entry: EnvStatus };

export function EnvForm({ entry }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (form: FormData) => {
    setError(null);
    setSaved(false);
    form.set("key", entry.key);
    form.set("value", value);
    start(async () => {
      const res = await saveEnvKey(form);
      if (!res.ok) setError(res.error ?? "Failed to save");
      else {
        setSaved(true);
        setValue("");
        router.refresh();
      }
    });
  };

  const onClear = () => {
    const form = new FormData();
    form.set("key", entry.key);
    start(async () => {
      const res = await clearEnvKey(form);
      if (!res.ok) setError(res.error ?? "Failed to clear");
      else router.refresh();
    });
  };

  return (
    <form
      action={onSubmit}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-4 sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <label htmlFor={entry.key} className="text-[14px] font-medium text-[var(--color-ink)]">
          {entry.label}
        </label>
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em]",
            entry.present
              ? "bg-[var(--color-persimmon-tint)] text-[var(--color-persimmon-deep)]"
              : "bg-[var(--color-paper-deep)] text-[var(--color-muted)]",
          ].join(" ")}
        >
          {entry.present ? "Set" : "Missing"}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-[var(--color-muted)]">{entry.hint}</p>

      {entry.present && (
        <p className="mt-3 text-[12px] text-[var(--color-ink-soft)]">
          Current:{" "}
          <span className="font-mono text-[11px] text-[var(--color-ink)]">
            {entry.secret ? entry.masked || "(set)" : entry.masked || "(set)"}
          </span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          id={entry.key}
          type={entry.secret && !reveal ? "password" : "text"}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={entry.present ? "Replace with new value…" : "Paste here…"}
          className="flex-1 min-w-[200px] rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-[8px] text-[13px] font-mono text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-persimmon)]"
        />
        {entry.secret && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="text-[12px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] px-2 py-[8px]"
          >
            {reveal ? "Hide" : "Show"}
          </button>
        )}
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] px-4 py-[8px] text-[13px] font-semibold hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {entry.present && (
          <button
            type="button"
            onClick={onClear}
            disabled={pending}
            className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-persimmon-deep)] px-2 py-[8px]"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-[var(--color-persimmon-deep)]">{error}</p>
      )}
      {saved && !error && (
        <p className="mt-3 text-[12px] text-[var(--color-ink-soft)]">
          Saved. Restart the dev server for the new value to take effect.
        </p>
      )}
    </form>
  );
}
