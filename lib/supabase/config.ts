/**
 * Centralized Supabase config check.
 *
 * Without env keys set, the whole app falls back to mock mode — dashboard
 * renders the seeded user, no auth gate, no real writes. Drop the keys into
 * .env.local and the app flips to real auth automatically.
 */

export function getSupabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

export function getSupabaseAnonKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
