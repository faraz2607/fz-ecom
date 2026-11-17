import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/dm-serif-display/latin.css";
import { BRAND } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  applicationName: BRAND.name,
};

export const viewport: Viewport = {
  themeColor: BRAND.iconBackground,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
