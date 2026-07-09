import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProxySupabase } from "@/lib/supabase/proxy-client";
import { findLimit, rateLimit } from "@/lib/rate-limit";

/**
 * Per-request middleware (Next 16 calls this `proxy`).
 *
 * Two jobs:
 *   1. Set `gs_currency` cookie from request.geo on first visit.
 *   2. When Supabase is configured: refresh the auth cookie + gate
 *      /dashboard/* routes. Unauthenticated users get bounced to /sign-in.
 *
 * When Supabase env vars are missing, the auth gate is a no-op so dev
 * (and the ?state=A..F demo URLs) keep working without a real account.
 */
function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const method = req.method;

  // ---- Rate limit ----
  // Only POSTs to auth routes (server actions / form posts) and any /api/*
  // request get rate-limited. Static GETs to /sign-in or /sign-up bypass.
  const shouldLimit =
    path.startsWith("/api") ||
    (method !== "GET" && (path === "/sign-up" || path === "/sign-in" || path === "/forgot-password"));

  if (shouldLimit) {
    const limit = findLimit(path);
    if (limit) {
      const key = `${clientIp(req)}:${limit.windowMs}:${limit.max}:${path.split("/").slice(0, 4).join("/")}`;
      const result = rateLimit(key, limit);
      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({ ok: false, error: "Too many requests. Slow down." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(result.resetSeconds),
              "X-RateLimit-Limit": String(limit.max),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(result.resetSeconds),
            },
          },
        );
      }
      res.headers.set("X-RateLimit-Limit", String(limit.max));
      res.headers.set("X-RateLimit-Remaining", String(result.remaining));
    }
  }

  // ---- Currency cookie ----
  // Detect country from whatever geo header the host platform provides:
  //   • Vercel:     `x-vercel-ip-country` header (e.g. "IN", "US", "GB") —
  //     `request.geo`/`request.ip` were removed from NextRequest in
  //     Next.js 15+; reading `req.geo.country` (the old approach) is
  //     always undefined on this Next version, which silently forced
  //     every visitor to INR regardless of where they actually were.
  //   • Cloudflare: `cf-ipcountry` header
  //   • Fastly:     `x-country-code` header
  // Default is INR for every first-time visitor; geo only flips it to USD
  // when we positively detect a non-India IP. Unknown geo → INR. This is
  // now the sole source of truth for currency — there is no manual
  // switcher in the UI anymore, so getting this right matters.
  const existing = req.cookies.get("gs_currency")?.value;
  if (existing !== "INR" && existing !== "USD") {
    const vercelCountry = req.headers.get("x-vercel-ip-country");
    const cfCountry = req.headers.get("cf-ipcountry");
    const fastlyCountry = req.headers.get("x-country-code");
    const country = (vercelCountry ?? cfCountry ?? fastlyCountry ?? "").toUpperCase();
    // Default INR; only confirmed non-India geos get USD.
    const isNonIndia = country !== "" && country !== "IN";
    res.cookies.set("gs_currency", isNonIndia ? "USD" : "INR", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // ---- Auth gate (only if Supabase is configured) ----
  // Only /dashboard/*, /onboarding, and the auth routes actually need the
  // session checked. Every other page (the marketing homepage, /pricing,
  // /faq, /blog/*, etc.) was previously paying for a Supabase network
  // round-trip (auth.getUser()) in middleware on *every* request, since
  // the matcher below runs on effectively every route. Checking the path
  // first and skipping the Supabase call entirely for public pages
  // removes that latency from the vast majority of page loads.
  const isProtected = path.startsWith("/dashboard") || path === "/onboarding";
  // /sign-up/terms is intentionally accessible to signed-in users
  // — the dashboard layout redirects them HERE when their stored
  // tos_consent_version is stale. Excluding it from the
  // "auth-route → /dashboard" bounce kills the infinite redirect
  // loop the gate would otherwise create.
  const isAuthRoute =
    path === "/sign-in" ||
    path === "/sign-up" ||
    (path.startsWith("/sign-up/") && path !== "/sign-up/terms") ||
    path === "/forgot-password";

  // The landing page itself was deliberately left out of the auth check
  // above (see the comment on isProtected) to spare every anonymous
  // marketing visitor a Supabase round-trip — that's the vast majority of
  // traffic to "/". But it meant an already-signed-in user reopening the
  // site in a new tab (or after closing Chrome) always landed back on the
  // marketing page instead of their dashboard, since "/" never looked at
  // their session at all.
  //
  // Fix without reintroducing that cost for anonymous visitors: only pay
  // for the Supabase round-trip on "/" when a Supabase auth cookie is
  // actually present. supabase-js/ssr's cookie names all start with
  // "sb-" and contain "auth-token" (chunked as "-auth-token.0" etc. for
  // large sessions) — checking for that is a synchronous cookie-jar scan,
  // no network call, so anonymous visitors (no such cookie) still skip
  // the auth gate entirely, exactly as before.
  const isLandingWithPossibleSession =
    path === "/" &&
    req.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  if ((isProtected || isAuthRoute || isLandingWithPossibleSession) && isSupabaseConfigured()) {
    const sb = getProxySupabase(req, res);
    if (sb) {
      // Refresh session token if expiring; this writes new cookies into `res`.
      const { data } = await sb.auth.getUser();
      const user = data.user;

      if (isProtected && !user) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
      }

      if ((isAuthRoute || isLandingWithPossibleSession) && user) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  // Include /api/* now so the rate limiter can run there. Still exclude static
  // assets and Next internals to avoid wasted middleware invocations.
  matcher: ["/((?!_next/|favicon|.*\\..*).*)"],
};
