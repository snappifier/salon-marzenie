// src/components/public/cookie-banner.tsx
"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import {AnimatePresence, motion} from "motion/react"
import {Button} from "@/components/ui/button"

const STORAGE_KEY = "cookieConsent_v1"

export function CookieBanner() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined") return
		try {
			const consent = window.localStorage.getItem(STORAGE_KEY)
			if (!consent) setVisible(true)
		} catch {
			// localStorage może być zablokowany (prywatne okno, restrykcyjne ustawienia) —
			// nie pokazujemy bannera bo i tak nie zapamiętamy decyzji
		}
	}, [])

	function handleAccept() {
		try {
			window.localStorage.setItem(STORAGE_KEY, "accepted")
		} catch {
			// ignore — banner zniknie tylko na czas tej sesji
		}
		setVisible(false)
	}

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{y: 24, opacity: 0}}
					animate={{y: 0, opacity: 1}}
					exit={{y: 24, opacity: 0}}
					transition={{
						duration: 0.28,
						ease: [0.22, 1, 0.36, 1],
					}}
					className="fixed bottom-4 left-4 right-4 md:bottom-6 z-50 md:left-auto md:right-6 md:max-w-md"
					role="dialog"
					aria-labelledby="cookie-banner-title"
					aria-describedby="cookie-banner-desc"
				>
					<div className="bg-graphite-900 text-graphite-100 rounded-2xl shadow-xl shadow-graphite-900/15 p-5 md:p-6 flex flex-col gap-4">
						<div>
							<div id="cookie-banner-title" className="font-medium text-sm mb-1.5">
								Pliki cookie
							</div>
							<p id="cookie-banner-desc" className="text-xs text-graphite-200 leading-relaxed">
								Używamy plików cookie niezbędnych do bezpiecznej obsługi rezerwacji i logowania.
								Nie zbieramy danych marketingowych ani statystyk od użytkowników bez konta.{" "}
								<Link
									href="/polityka-prywatnosci"
									className="text-rose-200 underline-offset-2 hover-supported:hover:underline"
								>
									Polityka prywatności
								</Link>
								.
							</p>
						</div>
						<div className="flex">
							<Button
								type="button"
								size="sm"
								onClick={handleAccept}
								className="bg-rose-100 text-graphite-900 hover-supported:hover:bg-white"
							>
								Rozumiem
							</Button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
