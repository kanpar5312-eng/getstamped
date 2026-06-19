/* ════════════════════════════════════════════════════════════════════════════
   POST /api/agent/confirm

   Executes a single, already-validated AgentAction the user clicked Yes on
   in the AskPanel. The chat endpoint never mutates; this is the only path
   that does. Re-validate the action shape here even though chat already
   built it — the client could replay an old payload.

   Returns:
   - { ok: true, message: "…" } on success — appended to chat as an
     assistant confirmation.
   - { ok: false, error: "…" } if the underlying server action refused
     (e.g. paywall, RLS) — shown verbatim to the user.

   Navigation is NOT executed here — the client handles router.push after
   the user confirms. We include navigate in the type only so the client
   can still record an "Opened …" line for clarity.
   ═════════════════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { markStep } from "@/app/actions/step-progress";
import { updateProfile } from "@/app/actions/profile";
import type { AgentAction } from "@/lib/agent/tools";
import { buildAction } from "@/lib/agent/tools";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: AgentAction;
  };
  const a = body.action;
  if (!a || typeof a !== "object" || !("kind" in a)) {
    return NextResponse.json({ ok: false, error: "Missing action." }, { status: 400 });
  }

  // Re-validate the action by reconstructing it from its public fields.
  // If the shape doesn't survive a round-trip, refuse.
  if (a.kind === "navigate") {
    // Navigation has no server-side effect — client routes after confirm.
    return NextResponse.json({ ok: true, message: a.summary });
  }

  if (a.kind === "mark_step_done") {
    const rebuilt = buildAction("mark_step_done", { stepNumber: a.stepNumber });
    if (!rebuilt || rebuilt.kind !== "mark_step_done") {
      return NextResponse.json({ ok: false, error: "Invalid step." }, { status: 400 });
    }
    const r = await markStep(rebuilt.stepNumber, "complete");
    if (!r.ok) {
      return NextResponse.json({
        ok: false,
        error: r.error,
        paywall: "paywall" in r ? r.paywall : undefined,
      });
    }
    return NextResponse.json({
      ok: true,
      message: `Step ${rebuilt.stepNumber} marked complete. Your readiness score will update in a few seconds.`,
    });
  }

  if (a.kind === "set_interview_date") {
    const rebuilt = buildAction("set_interview_date", { dateISO: a.dateISO });
    if (!rebuilt || rebuilt.kind !== "set_interview_date") {
      return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 400 });
    }
    const r = await updateProfile({ interview_date: rebuilt.dateISO });
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error });
    return NextResponse.json({
      ok: true,
      message: `Interview date saved — ${rebuilt.summary.replace(/^Save your visa interview date: /, "")}.`,
    });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
