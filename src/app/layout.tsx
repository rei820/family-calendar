import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "家族成長カレンダー",
  description: "日付でつながる、家族の成長カレンダー",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "家族カレンダー" },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
