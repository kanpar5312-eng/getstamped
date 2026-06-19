import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://getstamped.app";

/**
 * /sitemap.xml — list of public, crawlable pages. Drop authenticated
 * routes, parent share links (token-gated), and signup flow steps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",            // /
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/support",
    "/contact",
    "/terms",
    "/privacy",
    "/refund",
    "/dpa",
    "/disclaimer",
  ];
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.6,
  }));
}
