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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://visaplanner.app"

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
        url: "/placeholder-logo.svg",
        width: 1200,
        height: 630,
        alt: "Visa Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visa Planner",
    description: "Plan multi-country trips and instantly check visa requirements by passport.",
    images: ["/placeholder-logo.svg"],
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
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/60 bg-background/95">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
              <p>© 2026 Visa Planner. All rights reserved.</p>
              <p>
                Made with ❤️ by{" "}
                <a
                  href="https://egorkabantsov.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Egor Kabantsov
                </a>
              </p>
            </div>
          </footer>
        </div>
        <Toaster position="bottom-left" />
        <Analytics />
      </body>
    </html>
  )
}
