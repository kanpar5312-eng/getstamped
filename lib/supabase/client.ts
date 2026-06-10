"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

let cached: SupabaseClient | null = null;

/**
 * Browser Supabase client (singleton). Returns null when Supabase is not
 * configured — callers should handle that path gracefully (or guard with
 * isSupabaseConfigured() before calling).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
  return cached;
}
