import { ImageResponse } from "next/og";

// Ảnh Open Graph 1200x630 (hiện khi share link lên Facebook/Zalo).
export const alt = "ESL Academy — English as a Second Language";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #80b848 0%, #5f8f2e 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: -2 }}>ESL Academy</div>
        <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.92, marginTop: 8 }}>
          English as a Second Language
        </div>
        <div
          style={{
            marginTop: 44,
            background: "#f58220",
            color: "#ffffff",
            fontSize: 34,
            fontWeight: 700,
            padding: "16px 40px",
            borderRadius: 999,
          }}
        >
          Free trial class · Ages 3 to 15
        </div>
      </div>
    ),
    { ...size }
  );
}
