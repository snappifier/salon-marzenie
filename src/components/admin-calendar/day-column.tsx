// src/components/admin-calendar/day-column.tsx
"use client"

import {useRef} from "react"
import {minutesToUtcDate, SALON_TIMEZONE} from "@/lib/date"
import {cn} from "@/lib/cn"
import type {CalendarEvent} from "@/features/booking/calendar-actions"
import {
	EDGE_PAD,
	eventPosition,
	groupOverlapping,
	isoDayStart,
	minutesOfDayInTz,
	PX_PER_MINUTE,
	snapToSlot,
} from "./calendar-math"
import {EventBlock} from "./event-block"
import {NowIndicator} from "./now-indicator"

const MIN_EVENT_PX = 18
const SNAP_MIN = 15

export interface ShadedRange {
	startMin: number
	endMin: number
}

export interface BlockedRange {
	startMin: number
	endMin: number
	label: string
}

interface DayColumnProps {
	className?: string
	dayKey: string
	events: CalendarEvent[]
	salonOpenMin: number
	salonCloseMin: number
	pxPerMin?: number
	compact?: boolean
	showNow?: boolean
	shadedRanges?: ShadedRange[]
	blockedRanges?: BlockedRange[]
	onEventClick: (event: CalendarEvent) => void
	onSlotClick: (start: Date) => void
}

const HATCH = "repeating-linear-gradient(45deg, rgba(46,42,42,0.06) 0, rgba(46,42,42,0.06) 4px, transparent 4px, transparent 8px)"

export function DayColumn({
	className,
	dayKey,
	events,
	salonOpenMin,
	salonCloseMin,
	pxPerMin = PX_PER_MINUTE,
	compact,
	showNow,
	shadedRanges,
	blockedRanges,
	onEventClick,
	onSlotClick,
}: DayColumnProps) {
	const ref = useRef<HTMLDivElement>(null)
	const innerHeight = (salonCloseMin - salonOpenMin) * pxPerMin
	const height = innerHeight + EDGE_PAD * 2
	const dayDate = isoDayStart(dayKey, SALON_TIMEZONE)

	function startMinOf(event: CalendarEvent): number {
		return minutesOfDayInTz(new Date(event.extendedProps.startAt), SALON_TIMEZONE)
	}

	function endMinOf(event: CalendarEvent): number {
		const s = startMinOf(event)
		const e = minutesOfDayInTz(new Date(event.extendedProps.endAt), SALON_TIMEZONE)
		return e <= s ? e + 1440 : e
	}

	const positioned = groupOverlapping(events, startMinOf, endMinOf)

	function handleBackgroundClick(e: React.MouseEvent<HTMLButtonElement>) {
		const el = ref.current
		if (!el) return
		const y = e.clientY - el.getBoundingClientRect().top
		const rawMin = salonOpenMin + (y - EDGE_PAD) / pxPerMin
		const snapped = snapToSlot(rawMin, SNAP_MIN)
		const clamped = Math.max(salonOpenMin, Math.min(snapped, salonCloseMin - SNAP_MIN))
		onSlotClick(minutesToUtcDate(dayDate, clamped))
	}

	function rangeBox(startMin: number, endMin: number) {
		const top = Math.max((startMin - salonOpenMin) * pxPerMin, 0) + EDGE_PAD
		const bottom = Math.min((endMin - salonOpenMin) * pxPerMin, innerHeight) + EDGE_PAD
		return {top, h: Math.max(bottom - top, 0)}
	}

	return (
		<div ref={ref} className={cn("relative", className)} style={{height}}>
			{/* linie siatki */}
			{gridLines(salonOpenMin, salonCloseMin, pxPerMin)}

			{/* poza godzinami pracy */}
			{shadedRanges?.map((r, i) => {
				const {top, h} = rangeBox(r.startMin, r.endMin)
				if (h <= 0) return null
				return (
					<div
						key={`shade-${i}`}
						className="pointer-events-none absolute inset-x-0 bg-warm/70"
						style={{top, height: h}}
						aria-hidden="true"
					/>
				)
			})}

			{/* urlop / nieobecnosc */}
			{blockedRanges?.map((r, i) => {
				const {top, h} = rangeBox(r.startMin, r.endMin)
				if (h <= 0) return null
				return (
					<div
						key={`block-${i}`}
						className="pointer-events-none absolute inset-x-0 flex items-start justify-center overflow-hidden bg-graphite-100/80 px-1 pt-1"
						style={{top, height: h, backgroundImage: HATCH}}
					>
						<span className="rounded bg-graphite-200/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-graphite-700">
							{r.label}
						</span>
					</div>
				)
			})}

			{/* warstwa klikalna do dodawania wizyt */}
			<button
				type="button"
				className="absolute inset-0 z-0 cursor-pointer"
				aria-label="Dodaj wizytę w tym miejscu"
				onClick={handleBackgroundClick}
			/>

			{/* wizyty */}
			{positioned.map(({item: event, lane, lanes}) => {
				const box = eventPosition(
					event.extendedProps.startAt,
					event.extendedProps.endAt,
					salonOpenMin,
					salonCloseMin,
					pxPerMin,
					SALON_TIMEZONE,
				)
				if (box.height <= 0) return null
				const widthPct = 100 / lanes
				const left = `${lane * widthPct}%`
				const width = `${widthPct}%`
				const bufferH = Math.min(
					event.extendedProps.bufferAfterMin * pxPerMin,
					Math.max(innerHeight - (box.top + box.height), 0),
				)
				return (
					<div key={event.id} className="contents">
						{bufferH > 0 && (
							<div
								className="pointer-events-none absolute z-0 rounded-b-md opacity-70"
								style={{top: box.top + box.height + EDGE_PAD, height: bufferH, left, width, backgroundImage: HATCH}}
								aria-hidden="true"
							/>
						)}
						<div
							className="absolute z-10 px-px"
							style={{top: box.top + EDGE_PAD, height: Math.max(box.height, MIN_EVENT_PX), left, width}}
						>
							<EventBlock
								event={event}
								compact={compact}
								heightPx={Math.max(box.height, MIN_EVENT_PX)}
								onClick={() => onEventClick(event)}
							/>
						</div>
					</div>
				)
			})}

			{showNow && <NowIndicator salonOpenMin={salonOpenMin} salonCloseMin={salonCloseMin} pxPerMin={pxPerMin} />}
		</div>
	)
}

function gridLines(salonOpenMin: number, salonCloseMin: number, pxPerMin: number) {
	const lines: React.ReactNode[] = []
	const start = Math.ceil(salonOpenMin / 30) * 30
	for (let m = start; m <= salonCloseMin; m += 30) {
		const isHour = m % 60 === 0
		lines.push(
			<div
				key={m}
				className={cn(
					"pointer-events-none absolute inset-x-0 border-t",
					isHour ? "border-border-soft" : "border-border-soft/50",
				)}
				style={{top: (m - salonOpenMin) * pxPerMin + EDGE_PAD}}
				aria-hidden="true"
			/>,
		)
	}
	return lines
}
