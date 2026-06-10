import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Server Supabase client (per-request — never cached).
 * Reads + writes session cookies via Next 16's async cookies() API.
 * Returns null when Supabase env vars are missing.
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const store = await cookies();

  return createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          // setAll is called from a Server Component — cookies are read-only
          // there. The proxy will refresh tokens, so we can safely swallow.
        }
      },
    },
  });
}

/**
 * Convenience: returns the signed-in user (or null) without forcing the
 * caller to instantiate the client just to read auth state.
 */
export async function getSessionUser() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user;
}
