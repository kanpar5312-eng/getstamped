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
