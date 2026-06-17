import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Returns true when the Feedback nav item should show a red urgency dot:
 *   - any document has failed review (latest review per key), OR
 *   - latest readiness snapshot < 60.
 *
 * Best-effort — never throws. False on any failure.
 */
export async function getFeedbackUrgency(): Promise<boolean> {
  try {
    const sb = await getServerSupabase();
    if (!sb) return false;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;

    // Latest snapshot
    const { data: snap } = await sb
      .from("preparation_snapshots")
      .select("overall_readiness_score")
      .eq("user_id", user.id)
      .order("snapshot_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (typeof snap?.overall_readiness_score === "number"
      && snap.overall_readiness_score < 60) {
      return true;
    }

    // Any failed doc (latest per key)
    const { data: reviews } = await sb
      .from("document_review_results")
      .select("document_key, passed, reviewed_at")
      .eq("user_id", user.id)
      .order("reviewed_at", { ascending: false });
    const seen = new Set<string>();
    for (const r of reviews ?? []) {
      if (seen.has(r.document_key as string)) continue;
      seen.add(r.document_key as string);
      if (r.passed === false) return true;
    }
    return false;
  } catch {
    return false;
  }
}
