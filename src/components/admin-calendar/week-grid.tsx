// src/components/admin-calendar/week-grid.tsx
"use client"

import {useMemo} from "react"
import {SALON_TIMEZONE} from "@/lib/date"
import {cn} from "@/lib/cn"
import type {CalendarEvent} from "@/features/booking/calendar-actions"
import {isoDay, weekdayMonday0} from "./calendar-math"
import {polishDayShort} from "./calendar-format"
import {DayColumn} from "./day-column"
import {TimeGutter} from "./time-gutter"

interface WeekGridProps {
	days: string[]
	events: CalendarEvent[]
	salonOpenMin: number
	salonCloseMin: number
	todayIso: string
	onEventClick: (event: CalendarEvent) => void
	onSlotClick: (start: Date) => void
}

export function WeekGrid({
	days,
	events,
	salonOpenMin,
	salonCloseMin,
	todayIso,
	onEventClick,
	onSlotClick,
}: WeekGridProps) {
	const byDay = useMemo(() => bucketByDay(events), [events])

	return (
		<div className="overflow-x-auto overflow-y-hidden rounded-xl border border-border-soft bg-white">
			<div className="min-w-[640px]">
				{/* naglowki dni */}
				<div className="flex border-b border-border-soft">
					<div className="w-12 shrink-0 sm:w-14" aria-hidden="true" />
					{days.map((day) => {
						const dayNum = Number(day.slice(8, 10))
						const isToday = day === todayIso
						return (
							<div key={day} className="flex-1 border-l border-border-soft px-1 py-2 text-center">
								<div className="text-[11px] font-medium uppercase tracking-wide text-graphite-400">
									{polishDayShort(weekdayMonday0(day))}
								</div>
								<div
									className={cn(
										"mt-0.5 inline-flex items-center gap-1 text-sm tabular-nums",
										isToday ? "font-semibold text-rose-600" : "text-graphite-700",
									)}
								>
									{dayNum}
									{isToday && <span className="h-1 w-1 rounded-full bg-rose-600" aria-hidden="true" />}
								</div>
							</div>
						)
					})}
				</div>

				{/* siatka godzinowa */}
				<div className="flex">
					<TimeGutter salonOpenMin={salonOpenMin} salonCloseMin={salonCloseMin} />
					{days.map((day) => (
						<DayColumn
							key={day}
							className="flex-1 border-l border-border-soft"
							dayKey={day}
							events={byDay[day] ?? []}
							salonOpenMin={salonOpenMin}
							salonCloseMin={salonCloseMin}
							compact
							showNow={day === todayIso}
							onEventClick={onEventClick}
							onSlotClick={onSlotClick}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

function bucketByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
	const map: Record<string, CalendarEvent[]> = {}
	for (const event of events) {
		const key = isoDay(new Date(event.start), SALON_TIMEZONE)
		;(map[key] ??= []).push(event)
	}
	return map
}
