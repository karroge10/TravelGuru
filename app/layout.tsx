import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "https://visaplanner.app"
}

const siteUrl = getSiteUrl()

const ogImage = "/og.png"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Visa Planner",
    template: "%s | Visa Planner",
  },
  description: "Plan multi-country trips and instantly check visa requirements by passport.",
  applicationName: "Visa Planner",
  category: "travel",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "visa planner",
    "visa requirements",
    "travel planning",
    "passport visa checker",
    "multi-country trip",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Visa Planner",
    description: "Plan multi-country trips and instantly check visa requirements by passport.",
    type: "website",
    url: "/",
    siteName: "Visa Planner",
    images: [
      {
        url: ogImage,
        width: 1920,
        height: 981,
        alt: "Visa Planner — world map and trip planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visa Planner",
    description: "Plan multi-country trips and instantly check visa requirements by passport.",
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "tKBAxsYIlUo3tWvRQYSRT8xbareHcX4yvsUoMxUkMp0",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark min-h-screen bg-background text-foreground`}>
        {children}
        <Toaster position="bottom-left" />
        <Analytics />
      </body>
    </html>
  )
}
