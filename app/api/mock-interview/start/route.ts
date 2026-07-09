import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { checkLimit, logUsage } from "@/lib/checkLimit";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/mock-interview/start
   ──────────────────────────────────────────────────────────────────────
   Session-level rate gate for the mock interview. Free tier gets one
   session per UTC week (Mon–Sun); paid plans pass through. The client
   calls this immediately before showing the cinematic intro; on 429 it
   renders <PaywallOverlay type="limit_reached" />.

   logUsage runs only on the success path so a failed start (network
   blip mid-response) never burns the user's weekly slot.
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const limit = await checkLimit(user.id, "mock_interview");
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message: "You have used your mock interviews for this week.",
        reset_at: limit.reset_at,
      },
      { status: 429 },
    );
  }

  await logUsage(user.id, "mock_interview");
  return NextResponse.json({ ok: true });
}
