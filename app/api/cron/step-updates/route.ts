import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";
import { renderStepUpdateEmail } from "@/lib/email-templates/step-updates";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/cron/step-updates
   ──────────────────────────────────────────────────────────────────────
   Daily sweep. Finds steps whose `last_content_update` changed in the
   last 26h (24h schedule + 2h safety overlap), groups by user, and
   emails only the users who already marked the step complete AND who
   haven't muted "Step content updates" in Settings. A per
   (user, step, content_version) row in step_update_notifications
   guarantees we never spam the same revision twice.
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StepRow = {
  id: string;
  step_number: number;
  title: string;
  last_content_update: string;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  notif_prefs: { step_updates?: boolean } | null;
};

function adminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function appOrigin(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    new URL(req.url).origin
  );
}

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not set" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (presented !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = adminClient();
  if (!sb) {
    return NextResponse.json({ ok: false, error: "Supabase admin unavailable" }, { status: 500 });
  }

  // ---- Recently-updated steps (last 26h). ----
  const cutoff = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
  const { data: stepsRaw, error: stepErr } = await sb
    .from("visa_steps")
    .select("id, step_number, title, last_content_update")
    .gte("last_content_update", cutoff);

  if (stepErr) {
    return NextResponse.json({ ok: false, error: stepErr.message }, { status: 500 });
  }
  const steps = (stepsRaw ?? []) as StepRow[];
  if (steps.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, sent: 0 });
  }

  // ---- Find users who completed any of those steps. ----
  const stepNumbers = Array.from(new Set(steps.map((s) => s.step_number)));
  const { data: completions } = await sb
    .from("step_progress")
    .select("user_id, step_number")
    .eq("status", "complete")
    .in("step_number", stepNumbers);

  // user_id → list of completed step_numbers
  const completedByUser = new Map<string, Set<number>>();
  for (const row of (completions ?? []) as { user_id: string; step_number: number }[]) {
    const s = completedByUser.get(row.user_id) ?? new Set<number>();
    s.add(row.step_number);
    completedByUser.set(row.user_id, s);
  }

  const userIds = Array.from(completedByUser.keys());
  if (userIds.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, sent: 0 });
  }

  // ---- Pull those profiles + their notif_prefs. ----
  const { data: rawProfiles, error: profErr } = await sb
    .from("profiles")
    .select("id, first_name, notif_prefs")
    .in("id", userIds);
  if (profErr) {
    return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
  }
  const profiles = ((rawProfiles ?? []) as ProfileRow[]).filter(
    (p) => p.notif_prefs?.step_updates !== false,
  );

  // ---- Email lookup. ----
  const emailById = new Map<string, string>();
  {
    const { data: list, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    for (const u of list?.users ?? []) {
      if (u.email) emailById.set(u.id, u.email);
    }
  }

  // ---- Dedupe: drop (user, step, content_version) we've already sent. ----
  const stepIds = steps.map((s) => s.id);
  const { data: already } = await sb
    .from("step_update_notifications")
    .select("user_id, step_id, content_version")
    .in("step_id", stepIds);

  const alreadyKey = new Set<string>();
  for (const r of (already ?? []) as { user_id: string; step_id: string; content_version: string }[]) {
    alreadyKey.add(`${r.user_id}|${r.step_id}|${r.content_version}`);
  }

  const stepByNumber = new Map<number, StepRow>();
  for (const s of steps) stepByNumber.set(s.step_number, s);

  const origin = appOrigin(req);
  let sent = 0;
  let failed = 0;

  for (const profile of profiles) {
    const to = emailById.get(profile.id);
    if (!to) continue;

    const completedNumbers = completedByUser.get(profile.id) ?? new Set<number>();
    const stepsForThisUser: { step: StepRow; key: string }[] = [];
    for (const n of completedNumbers) {
      const step = stepByNumber.get(n);
      if (!step) continue;
      const key = `${profile.id}|${step.id}|${step.last_content_update}`;
      if (alreadyKey.has(key)) continue;
      stepsForThisUser.push({ step, key });
    }
    if (stepsForThisUser.length === 0) continue;

    const { subject, html, text } = renderStepUpdateEmail({
      firstName: profile.first_name ?? "",
      updatedSteps: stepsForThisUser.map(({ step }) => ({
        number: step.step_number,
        title: step.title,
      })),
      ctaUrl: `${origin}/dashboard/timeline`,
    });

    try {
      await sendMail({ to, subject, html, text });
      // Log so we never re-send the same content version.
      await sb.from("step_update_notifications").insert(
        stepsForThisUser.map(({ step }) => ({
          user_id: profile.id,
          step_id: step.id,
          content_version: step.last_content_update,
        })),
      );
      sent++;
    } catch (err) {
      console.error("[cron/step-updates] send failed for", profile.id, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, scanned: profiles.length, sent, failed });
}
