import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Aurora — AI Assistant",
  description:
    "A premium, enterprise-grade AI chat experience. Elegant, minimal and futuristic.",
  applicationName: "Aurora",
  keywords: ["AI", "chat", "assistant", "GPT", "productivity"],
  authors: [{ name: "Aurora" }],
  openGraph: {
    title: "Aurora — AI Assistant",
    description:
      "A premium, enterprise-grade AI chat experience. Elegant, minimal and futuristic.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0b0d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
