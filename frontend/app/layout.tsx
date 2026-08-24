import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Aurora";

export const metadata: Metadata = {
  title: `${appName} — think alongside you`,
  description:
    "A calm space to talk things through, backed by your own FastAPI service.",
  applicationName: appName,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0B0F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}