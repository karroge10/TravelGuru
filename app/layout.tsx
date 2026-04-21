import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
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
    icon: "/placeholder-logo.svg",
    apple: "/placeholder-logo.svg",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        {children}
        <Toaster position="bottom-left" />
      </body>
    </html>
  )
}
