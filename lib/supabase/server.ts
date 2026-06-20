import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Server Supabase client — memoized per request via React.cache so that
 * multiple callers in the same render (layout + page + helpers) share one
 * client instance and one cookie read. Without this, a single dashboard
 * render was instantiating 3–4 clients and hitting auth.getUser() that
 * many times.
 */
export const getServerSupabase = cache(async function getServerSupabase(): Promise<SupabaseClient | null> {
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
});

/**
 * Convenience: returns the signed-in user (or null). Also memoized so the
 * layout, page, and helpers all share one auth.getUser() network round-trip.
 */
export const getSessionUser = cache(async function getSessionUser() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user;
});
