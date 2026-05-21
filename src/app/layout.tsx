import type { Metadata } from "next";
import "./globals.css";
import { SHOP } from "@/config/shop";

export const metadata: Metadata = {
  title: `${SHOP.name} — Book Your Cut`,
  description: `${SHOP.tagline} Book online at ${SHOP.name}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
