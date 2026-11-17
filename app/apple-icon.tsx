import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: BRAND.iconBackground,
        borderRadius: 48,
        color: BRAND.iconAccent,
        display: "flex",
        fontFamily: "Arial",
        fontSize: 68,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {BRAND.shortName}
    </div>,
    size,
  );
}
