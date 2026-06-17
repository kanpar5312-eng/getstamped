import { ImageResponse } from "next/og";

export const alt = "GetStamped — F-1 visa preparation, end to end";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 88px",
          background:
            "linear-gradient(135deg, #F7F3EC 0%, #FFFFFF 60%, #EDE7DA 100%)",
          color: "#1C1B1A",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top row — brand mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: "#FF5B2E",
            }}
          />
          <div
            style={{
              fontSize: 28,
              letterSpacing: "-0.02em",
              fontWeight: 500,
              color: "#FF5B2E",
            }}
          >
            GetStamped
          </div>
          <div
            style={{
              marginLeft: 16,
              padding: "4px 12px",
              fontSize: 14,
              fontFamily: "Helvetica, sans-serif",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              borderRadius: 999,
              background: "#FF5B2E",
              color: "#FFFFFF",
            }}
          >
            F-1 visa
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 64,
            fontSize: 88,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            fontWeight: 500,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>The only F-1 visa prep</div>
          <div>
            tool you&rsquo;ll ever{" "}
            <span style={{ color: "#FF5B2E", fontStyle: "italic" }}>need</span>.
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 36,
            fontSize: 26,
            color: "#55524F",
            fontFamily: "Helvetica, sans-serif",
            lineHeight: 1.4,
            maxWidth: 880,
          }}
        >
          Forty-seven steps. Voice-based mock interviews. A document organizer
          your parents can actually understand.
        </div>

        {/* Bottom row — chips */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: "auto",
            fontFamily: "Helvetica, sans-serif",
            fontSize: 16,
            color: "#55524F",
          }}
        >
          {["47 ordered steps", "Voice mock interviews", "Document vault", "Parent View"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid #E3DDD0",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
