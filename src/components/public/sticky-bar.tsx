// src/components/public/sticky-bar.tsx
"use client"

import {useEffect, useState} from "react"
import Link from "next/link"

interface Props {
	/** Gotowy tekst najbliższego wolnego terminu, np. "w czwartek o 15:00". */
	nextSlotLabel: string | null
}

export function StickyBar({nextSlotLabel}: Props) {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const onScroll = () => {
			const nearBottom =
				window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 260
			setVisible(window.scrollY > 560 && !nearBottom)
		}
		onScroll()
		window.addEventListener("scroll", onScroll, {passive: true})
		window.addEventListener("resize", onScroll)
		return () => {
			window.removeEventListener("scroll", onScroll)
			window.removeEventListener("resize", onScroll)
		}
	}, [])

	if (!visible) return null

	return (
		<div className="fixed left-0 right-0 bottom-0 z-40 bg-surface border-t border-border-subtle shadow-lg animate-mz-fade-only">
			<div className="max-w-[1120px] mx-auto px-[7%] py-7 flex items-center justify-between gap-8 flex-wrap">
				<p className="text-sm text-secondary">
					{nextSlotLabel
						? <>Najbliższa wolna wizyta — <strong className="font-medium text-primary">{nextSlotLabel}</strong></>
						: "Zarezerwuj wizytę online, o dowolnej porze."}
				</p>
				<Link
					href="/rezerwacja"
					className="w-full sm:w-auto text-center bg-interactive text-white rounded-full px-14 py-4 text-sm font-medium transition-[background-color] duration-[240ms] ease-out hover-supported:hover:bg-interactive-hover"
				>
					Zarezerwuj wizytę
				</Link>
			</div>
		</div>
	)
}
