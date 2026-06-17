import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/feedback/recompute
 *
 * Invokes the `compute_readiness` Supabase Edge Function and returns its
 * payload. Call from:
 *   - step toggle handler (after status flips to 'complete')
 *   - document review write (after document_review_results insert)
 *   - mock interview finish (after interview_sessions insert)
 *
 * Failure is non-fatal — the UI re-renders from the stale snapshot if
 * the recompute fails.
 */
export async function POST() {
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "auth not configured" }, { status: 503 });
  try {
    const { data, error } = await sb.functions.invoke("compute_readiness");
    if (error) {
      console.error("[recompute] edge function error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ...(data as object) });
  } catch (e) {
    console.error("[recompute] threw:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
