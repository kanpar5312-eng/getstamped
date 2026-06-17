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
  //   • Vercel:     `request.geo.country`   (e.g. "IN", "US", "GB")
  //   • Cloudflare: `cf-ipcountry` header
  //   • Fastly:     `x-country-code` header
  // Fallback chain → defaults to USD if nothing resolves.
  const existing = req.cookies.get("gs_currency")?.value;
  if (existing !== "INR" && existing !== "USD") {
    const vercelGeo = (req as unknown as { geo?: { country?: string } }).geo?.country;
    const cfCountry = req.headers.get("cf-ipcountry");
    const fastlyCountry = req.headers.get("x-country-code");
    const country = (vercelGeo ?? cfCountry ?? fastlyCountry ?? "US").toUpperCase();
    // Only India gets rupees; everywhere else (US/UK/CA/AU/EU/SG/…) pays in USD.
    res.cookies.set("gs_currency", country === "IN" ? "INR" : "USD", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // ---- Auth gate (only if Supabase is configured) ----
  if (isSupabaseConfigured()) {
    const sb = getProxySupabase(req, res);
    if (sb) {
      // Refresh session token if expiring; this writes new cookies into `res`.
      const { data } = await sb.auth.getUser();
      const user = data.user;
      const path = req.nextUrl.pathname;
      const isProtected = path.startsWith("/dashboard") || path === "/onboarding";
      const isAuthRoute =
        path === "/sign-in" ||
        path === "/sign-up" ||
        path.startsWith("/sign-up/") ||
        path === "/forgot-password";

      if (isProtected && !user) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
      }

      if (isAuthRoute && user) {
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
