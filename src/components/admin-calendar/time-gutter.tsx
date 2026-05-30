// src/components/admin-calendar/time-gutter.tsx
import {EDGE_PAD, PX_PER_MINUTE} from "./calendar-math"

interface TimeGutterProps {
	salonOpenMin: number
	salonCloseMin: number
	pxPerMin?: number
}

export function TimeGutter({salonOpenMin, salonCloseMin, pxPerMin = PX_PER_MINUTE}: TimeGutterProps) {
	const firstHour = Math.ceil(salonOpenMin / 60)
	const lastHour = Math.floor(salonCloseMin / 60)
	const hours: number[] = []
	for (let h = firstHour; h <= lastHour; h++) hours.push(h)
	const height = (salonCloseMin - salonOpenMin) * pxPerMin + EDGE_PAD * 2

	return (
		<div className="relative w-12 shrink-0 sm:w-14" style={{height}} aria-hidden="true">
			{hours.map((h) => (
				<div
					key={h}
					className="absolute right-1.5 -translate-y-1/2 text-[11px] tabular-nums text-graphite-400 sm:right-2"
					style={{top: (h * 60 - salonOpenMin) * pxPerMin + EDGE_PAD}}
				>
					{h}:00
				</div>
			))}
		</div>
	)
}
