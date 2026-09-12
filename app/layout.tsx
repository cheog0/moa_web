import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "랩플 | AI 회의록",
  description:
    "회의 녹음부터 AI 요약과 액션 아이템까지, 모아에서 한 번에 정리하세요.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/raple_icon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/raple_icon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/raple_icon.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/raple_icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
