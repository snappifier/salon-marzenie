import type {Metadata} from "next"
import {Fraunces, Inter} from "next/font/google"
import {site} from "@/lib/content"
import "./globals.css"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${site.salonName} - ${site.tagline}`,
    template: `%s | ${site.salonName}`,
  },
  description: "Profesjonalna pielęgnacja w kameralnej atmosferze. Zarezerwuj wizytę online.",
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
      <html lang="pl" className={`${fraunces.variable} ${inter.variable} h-full`}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
  )
}