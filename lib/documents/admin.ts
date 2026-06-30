import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";

/**
 * Service-role Supabase client. Server routes only.
 * Used for: signed URL generation, ai_check_usage inserts, server-side
 * storage uploads. NEVER export this to client bundles.
 */
let cached: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const BUCKET = "user-documents";

/** Sanitize a filename: strip path separators and trim length. */
export function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]+/g, "_").replace(/\s+/g, "_");
  const safe = base.replace(/[^A-Za-z0-9._-]/g, "");
  return safe.slice(0, 80) || "file";
}

/** Build the object key: {user_id}/{slug}/{timestamp}-{filename} */
export function buildObjectKey(userId: string, slug: string, filename: string): string {
  const ts = Date.now();
  return `${userId}/${slug}/${ts}-${sanitizeFilename(filename)}`;
}

/* ════════════════════════════════════════════════════════════════════════
   DPDP Act compliance — data minimization.

   The user-documents bucket is INTENDED to be transient: a file lives
   there only long enough for the Groq vision model to read it (via a
   short-lived signed URL), and is then deleted. The persisted database
   row keeps only structured pass/fail metadata — no extracted PII, no
   file blob, no signed URL.

   If you change anything about the upload / scan / delete sequence,
   PRESERVE this property. Do NOT remove the deleteFileOrQueue() call,
   do NOT extend the ai_feedback payload with extracted personal data,
   and do NOT add columns to public.documents that would keep the raw
   file path indefinitely.

   See also:
   • app/api/documents/check/route.ts          — calls deleteFileOrQueue
   • supabase/migrations-pending-deletions.sql — retry queue
   • app/api/cron/storage-cleanup/route.ts     — TTL sweep + retry
   ════════════════════════════════════════════════════════════════════════ */
export async function deleteFileOrQueue(
  filePath: string,
  reason: string = "post_scan",
): Promise<{ deleted: boolean; queued: boolean }> {
  const admin = getAdminSupabase();
  if (!admin) return { deleted: false, queued: false };

  const { error } = await admin.storage.from(BUCKET).remove([filePath]);
  if (!error) return { deleted: true, queued: false };

  // Best-effort enqueue. If even the enqueue fails (table missing /
  // service role lapsed), the TTL sweep in the cron job is the final
  // safety net so the file still gets removed within ~5 minutes.
  console.warn("[storage] delete failed, queueing for retry:", filePath, error.message);
  const { error: insertErr } = await admin
    .from("pending_deletions")
    .upsert(
      {
        bucket: BUCKET,
        file_path: filePath,
        reason: `${reason}: ${error.message}`,
        attempts: 1,
        last_attempt_at: new Date().toISOString(),
      },
      { onConflict: "bucket,file_path" },
    );
  if (insertErr) {
    console.error("[storage] could not enqueue pending deletion:", insertErr.message);
    return { deleted: false, queued: false };
  }
  return { deleted: false, queued: true };
}
