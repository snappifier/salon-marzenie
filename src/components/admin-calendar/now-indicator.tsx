// src/components/admin-calendar/now-indicator.tsx
"use client"

import {SALON_TIMEZONE} from "@/lib/date"
import {EDGE_PAD, minutesOfDayInTz, PX_PER_MINUTE} from "./calendar-math"
import {useNow} from "./use-now"

interface NowIndicatorProps {
	salonOpenMin: number
	salonCloseMin: number
	pxPerMin?: number
}

export function NowIndicator({salonOpenMin, salonCloseMin, pxPerMin = PX_PER_MINUTE}: NowIndicatorProps) {
	const now = useNow()
	const nowMin = minutesOfDayInTz(now, SALON_TIMEZONE)
	if (nowMin < salonOpenMin || nowMin > salonCloseMin) return null
	const top = (nowMin - salonOpenMin) * pxPerMin + EDGE_PAD

	return (
		<div className="pointer-events-none absolute inset-x-0 z-20" style={{top}} aria-hidden="true">
			<span className="absolute -left-[3px] top-1/2 flex h-2 w-2 -translate-y-1/2">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-600 opacity-60" />
				<span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
			</span>
			<span className="block h-[2px] w-full bg-rose-600" />
		</div>
	)
}
