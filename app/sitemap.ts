import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const SITE = SITE_URL;

/**
 * /sitemap.xml — list of public, crawlable pages. Drop authenticated
 * routes, parent share links (token-gated), and signup flow steps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",            // /
    "/pricing",
    "/faq",
    "/about",
    "/blog",
    "/blog/f1-visa-interview-questions-2026",
    "/blog/ds-160-common-mistakes",
    "/blog/sevis-fee-payment-guide",
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
  const HIGH_PRIORITY = new Set(["/pricing", "/faq", "/about"]);
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : HIGH_PRIORITY.has(path) ? 0.8 : 0.6,
  }));
}
