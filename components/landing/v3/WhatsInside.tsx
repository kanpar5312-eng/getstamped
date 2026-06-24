"use client";

import FlowingMenu from "@/components/ui/FlowingMenu";

/* ════════════════════════════════════════════════════════════════════════
   WhatsInside — typographic preview of the four pillars that follow
   on the landing. Sits between <Hero/> and <StackedFeatureCards/> so
   the marquee bands grab attention as the user transitions from the
   hero film into the deeper product sections.
   ═════════════════════════════════════════════════════════════════════════ */

// TODO: replace with GetStamped branded images before launch
const menuItems = [
  {
    link: "#playbook",
    text: "Playbook",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80",
  },
  {
    link: "#vault",
    text: "Document Vault",
    image: "https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=600&q=80",
  },
  {
    link: "#interview",
    text: "Mock Interview",
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&q=80",
  },
  {
    link: "#parent",
    text: "Parent Share",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
];

export function WhatsInside() {
  return (
    <section style={{ position: "relative" }}>
      <p
        style={{
          textAlign: "center",
          paddingTop: 80,
          paddingBottom: 32,
          fontSize: 10,
          color: "#E8622A",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          fontFamily: "var(--font-sans-stack)",
          fontWeight: 600,
          margin: 0,
        }}
      >
        What&rsquo;s Inside
      </p>
      <div
        className="gs-whats-inside-frame"
        style={{ height: 500, position: "relative" }}
      >
        <FlowingMenu
          items={menuItems}
          speed={15}
          textColor="#FAF8F4"
          bgColor="#1C1917"
          marqueeBgColor="#E8622A"
          marqueeTextColor="#FAF8F4"
          borderColor="rgba(250,248,244,0.10)"
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .gs-whats-inside-frame { height: 400px !important; }
        }
      `}</style>
    </section>
  );
}
