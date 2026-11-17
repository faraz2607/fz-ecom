import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: BRAND.iconBackground,
        borderRadius: 15,
        color: BRAND.iconAccent,
        display: "flex",
        fontFamily: "Arial",
        fontSize: 20,
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
