import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "랩플",
  description:
    "회의 녹음부터 AI 요약과 액션 아이템까지, 모아에서 한 번에 정리하세요.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/raple_pas.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/raple_pas.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/raple_pas.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/raple_pas.png",
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
    <html lang="ko" className="bg-background" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("raple-theme")==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          {process.env.NODE_ENV === "production" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  );
}
