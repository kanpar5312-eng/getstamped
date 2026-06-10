import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#143a2f",
          color: "#faf6ed",
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ fontSize: 108, fontWeight: 600, lineHeight: 1 }}>G</div>
        <div
          style={{
            fontSize: 14,
            marginTop: 6,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            opacity: 0.7,
          }}
        >
          GetStamped
        </div>
      </div>
    ),
    { ...size },
  );
}
