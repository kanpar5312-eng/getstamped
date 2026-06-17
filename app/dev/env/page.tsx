import { notFound } from "next/navigation";
import { readEnvStatus } from "@/app/actions/dev-env";
import { EnvForm } from "@/components/dev/EnvForm";

export const dynamic = "force-dynamic";

export default async function DevEnvPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const status = await readEnvStatus();

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-muted)]">
          Dev only · localhost
        </p>
        <h1 className="mt-3 font-display text-[32px] tracking-tight text-[var(--color-ink)] leading-tight">
          API keys
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
          Paste keys here. They write to <code className="font-mono text-[12px]">.env.local</code> at the project root, then the dev server reads them on next restart. Existing values are masked — only the last 4 characters are shown.
        </p>
        <p className="mt-3 text-[12px] text-[var(--color-muted)]">
          This page returns 404 in production builds. Keys never leave your machine.
        </p>
      </header>

      <section className="mt-8 space-y-3">
        {status.map((s) => (
          <EnvForm key={s.key} entry={s} />
        ))}
      </section>

      <section className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-5">
        <p className="text-[13px] font-medium text-[var(--color-ink)]">After saving</p>
        <p className="mt-2 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
          Env vars are read once at process start. Restart your dev server to pick them up:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--color-paper-deep)] p-3 text-[12px] font-mono text-[var(--color-ink)]">
{`lsof -nP -iTCP:3030 -sTCP:LISTEN -t | xargs -r kill -KILL
PORT=3030 npm run dev`}
        </pre>
      </section>
    </main>
  );
}
