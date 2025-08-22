import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Rubik } from "next/font/google"
import "./globals.css"

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
})

export const metadata: Metadata = {
  title: "Atlanta Tech Community - Meetups, Conferences & Resources",
  description: "Discover Atlanta's thriving tech community through local meetups, conferences, and online resources.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-rubik: ${rubik.variable};
}
        `}</style>
      </head>
      <body className={`${rubik.variable} antialiased`}>{children}</body>
    </html>
  )
}
