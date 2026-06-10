/**
 * Supabase client — stubbed for Phase 1.
 *
 * The full client is wired only when SUPABASE_URL + SUPABASE_ANON_KEY are
 * present in the environment. Until you create a project and drop the keys
 * into .env.local, the waitlist server action returns a mock response so
 * the UI keeps working in development.
 *
 * To wire it up later:
 *   npm i @supabase/supabase-js
 *   then uncomment the createClient import and call below.
 */

export type WaitlistRow = {
  id: string;
  email: string;
  position: number;
  is_early_bird: boolean;
};

export function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// Real client (deferred until package install + project setup):
//
// import { createClient } from "@supabase/supabase-js";
// export const supabase = hasSupabase()
//   ? createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     )
//   : null;
