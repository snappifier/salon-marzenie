// src/app/layout.tsx
import type {Metadata} from "next"
import {Cormorant_Garamond, JetBrains_Mono, Plus_Jakarta_Sans} from "next/font/google"
import {site} from "@/lib/content"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
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
	  <html
		  lang="pl"
		  className={`${cormorant.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
	  >
		<body className="min-h-full flex flex-col overflow-x-hidden">{children}</body>
	  </html>
  )
}
