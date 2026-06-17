import { NextResponse } from "next/server";
import { getSessionAnswers } from "@/lib/feedback-data";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/feedback/session/[id]
 *
 * Returns answers for a session. RLS gates the read to the session owner;
 * we double-check ownership here defensively.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ answers: [] });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ answers: [] }, { status: 401 });

  // Ownership check
  const { data: session } = await sb
    .from("interview_sessions")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ answers: [] }, { status: 404 });
  }

  const answers = await getSessionAnswers(id);
  return NextResponse.json({ answers });
}
