"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { CTA } from "./primitives/CTA";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`v3-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="v3-header-inner">
        <Link href="/" className="v3-brand" aria-label="GetStamped home">
          <BrandMark size={22} />
          <span className="v3-wordmark">GetStamped</span>
        </Link>
        <nav className="v3-nav" aria-label="Primary">
          <a href="#playbook" className="v3-nav-link"><span>Workspace</span></a>
          <a href="#pricing" className="v3-nav-link"><span>Pricing</span></a>
          <a href="#faq" className="v3-nav-link"><span>FAQ</span></a>
        </nav>
        <div className="v3-header-cta">
          <Link
            href="/sign-in"
            className="v3-signin"
          >
            Sign in
          </Link>
          <CTA href="/sign-up" tone="primary" size="md">Start free</CTA>
        </div>
      </div>
    </header>
  );
}
