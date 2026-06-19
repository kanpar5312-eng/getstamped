import type { MetadataRoute } from "next";

/**
 * /robots.txt — tells crawlers what they can and can't index.
 *
 * Public marketing pages: indexed.
 * Authenticated app surface, parent share links, signup verify, API
 * routes, internal devtools: never indexed.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://getstamped.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard/",
        "/onboarding",
        "/parent/",
        "/sign-up/verify",
        "/dev/",
        "/celebration",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
