import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Supabase client wired for proxy.ts (formerly middleware).
 * Refreshes the session cookie on every request so Server Components see
 * the latest user.
 */
export function getProxySupabase(
  req: NextRequest,
  res: NextResponse,
): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });
}
