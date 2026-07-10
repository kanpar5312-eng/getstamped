import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt — tells crawlers what they can and can't index.
 *
 * Public marketing pages: indexed.
 * Authenticated app surface, parent share links, signup verify, API
 * routes, internal devtools: never indexed.
 */
const SITE = SITE_URL;

const DISALLOW = [
  "/api/",
  "/auth/",
  "/dashboard/",
  "/onboarding",
  "/parent/",
  "/family/",
  "/sign-up/verify",
  "/dev/",
  "/celebration",
  // proxy.ts redirects unauthenticated /dashboard hits to
  // /sign-in?next=<path>, auth/callback failures land on
  // /sign-in?error=..., and Pricing.tsx's CTAs link straight to
  // /sign-up?plan=solo|family — all real, legitimate query-string
  // variants of pages that already declare a canonical back to the
  // bare path (see app/sign-in/page.tsx, app/sign-up/page.tsx). The
  // canonical tag handles the ranking signal; this keeps crawlers from
  // fetching (and flagging as duplicate-content) the variant URLs at
  // all.
  "/sign-in?*",
  "/sign-up?*",
  "/forgot-password?*",
];

// Explicit allow rules for major AI answer-engine crawlers — being
// crawlable by these is required to appear in ChatGPT/Perplexity/Google
// AI Overviews answers. Functionally identical to the "*" rule below;
// listed by name so it's unambiguous that we want them here.
const AI_CRAWLERS = ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
