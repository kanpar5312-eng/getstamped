import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    // We only ship SVGs we author in /public (e.g. portrait placeholders),
    // never user-uploaded — so the standard SVG-xss risk doesn't apply.
    // CSP below blocks scripts inside any SVG just in case.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
