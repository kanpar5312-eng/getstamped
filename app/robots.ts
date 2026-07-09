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
