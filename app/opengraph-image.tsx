import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: `linear-gradient(135deg, ${BRAND.iconBackground}, ${BRAND.foreground})`,
        color: "#ffffff",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "76px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: BRAND.iconAccent,
          borderRadius: 54,
          color: BRAND.iconBackground,
          display: "flex",
          fontSize: 56,
          fontWeight: 700,
          height: 128,
          justifyContent: "center",
          width: 128,
        }}
      >
        {BRAND.shortName}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 40,
          maxWidth: 820,
        }}
      >
        <div
          style={{
            color: BRAND.iconAccent,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 5,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          {BRAND.name}
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          {BRAND.tagline}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 24,
            lineHeight: 1.35,
            marginTop: 28,
            maxWidth: 760,
          }}
        >
          {BRAND.description}
        </div>
      </div>
    </div>,
    size,
  );
}
