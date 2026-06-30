import { NextResponse } from "next/server";
import { BUCKET, getAdminSupabase } from "@/lib/documents/admin";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/cron/storage-cleanup
   ──────────────────────────────────────────────────────────────────────
   Two-phase sweep of the user-documents bucket:

   1. RETRY — drain public.pending_deletions, re-attempt the delete for
      each row. Successful deletes drop the row; failures bump attempts.
   2. TTL  — walk the bucket, delete any file older than 5 minutes. This
      is the safety net for files orphaned because the user closed the
      tab BEFORE /api/documents/check ever ran, or because both the
      delete AND the enqueue failed.

   Together: every file in the bucket disappears within ≤5 minutes of
   landing, scanned or not.

   DPDP Act compliance — data minimization. Do not change the TTL
   without revisiting the compliance posture. Do not introduce any
   path that reads the file bytes here; this route only removes them.

   Auth: bearer token in `Authorization` must equal env CRON_SECRET.
   Set up Vercel Cron (preferred) or Supabase pg_cron to POST here
   every 5 minutes.
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const TTL_SECONDS = 5 * 60;
const MAX_RETRY_ATTEMPTS = 5;
const PENDING_PAGE_SIZE = 200;
const LIST_PAGE_SIZE = 1000;

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization") ?? "";
  if (!secret || header !== `Bearer ${secret}`) return unauthorized();

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "storage not configured" }, { status: 500 });
  }

  // ────────────── Phase 1: retry pending_deletions ──────────────
  let retried = 0;
  let retrySucceeded = 0;
  let retryStillFailing = 0;
  {
    const { data: pending } = await admin
      .from("pending_deletions")
      .select("id, bucket, file_path, attempts")
      .eq("bucket", BUCKET)
      .lt("attempts", MAX_RETRY_ATTEMPTS)
      .order("created_at", { ascending: true })
      .limit(PENDING_PAGE_SIZE);

    for (const row of pending ?? []) {
      retried += 1;
      const { error } = await admin.storage.from(row.bucket).remove([row.file_path]);
      if (!error) {
        await admin.from("pending_deletions").delete().eq("id", row.id);
        retrySucceeded += 1;
      } else {
        retryStillFailing += 1;
        await admin
          .from("pending_deletions")
          .update({
            attempts: (row.attempts ?? 0) + 1,
            last_attempt_at: new Date().toISOString(),
            reason: `retry: ${error.message}`,
          })
          .eq("id", row.id);
      }
    }
  }

  // ────────────── Phase 2: TTL sweep of the bucket ──────────────
  // Walk a flat list of every object in the bucket and delete anything
  // older than TTL_SECONDS. Supabase Storage list() only returns the
  // immediate children of a prefix, so we recurse one level per user.
  const ttlCutoff = Date.now() - TTL_SECONDS * 1000;
  let ttlDeleted = 0;
  let ttlFailed = 0;
  const toDelete: string[] = [];

  const sb = admin;
  async function collectFromPrefix(prefix: string): Promise<void> {
    const { data, error } = await sb.storage
      .from(BUCKET)
      .list(prefix, { limit: LIST_PAGE_SIZE, sortBy: { column: "created_at", order: "asc" } });
    if (error || !data) return;
    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Supabase storage represents "folders" as entries with id === null.
      const isFolder = !entry.id;
      if (isFolder) {
        await collectFromPrefix(full);
        continue;
      }
      const created = entry.created_at ? new Date(entry.created_at).getTime() : 0;
      if (created > 0 && created < ttlCutoff) {
        toDelete.push(full);
      }
    }
  }

  try {
    await collectFromPrefix("");
  } catch (err) {
    console.error("[storage-cleanup] list failed:", err);
  }

  if (toDelete.length > 0) {
    // Supabase storage remove() takes an array; chunk to be safe.
    const chunkSize = 100;
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      const { error, data } = await admin.storage.from(BUCKET).remove(chunk);
      if (error) {
        ttlFailed += chunk.length;
        console.warn("[storage-cleanup] TTL batch delete failed:", error.message);
      } else {
        ttlDeleted += data?.length ?? chunk.length;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    retry: { attempted: retried, succeeded: retrySucceeded, stillFailing: retryStillFailing },
    ttl: { candidates: toDelete.length, deleted: ttlDeleted, failed: ttlFailed },
    ttlSeconds: TTL_SECONDS,
  });
}
