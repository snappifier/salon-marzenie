// src/components/admin-calendar/use-is-mobile.ts
"use client"

import {useEffect, useState} from "react"

// SSR default = desktop (false); korygujemy po mount. SalonCalendar i tak gate'uje
// body za `mounted`, więc pierwszy render z poprawną wartością nie powoduje migotania.
export function useIsMobile(breakpoint = 768): boolean {
	const [isMobile, setIsMobile] = useState(false)
	useEffect(() => {
		const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
		const update = () => setIsMobile(mq.matches)
		update()
		mq.addEventListener("change", update)
		return () => mq.removeEventListener("change", update)
	}, [breakpoint])
	return isMobile
}
