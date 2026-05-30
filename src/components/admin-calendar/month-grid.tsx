// src/components/admin-calendar/month-grid.tsx
"use client"

import {useMemo} from "react"
import {formatInTimeZone} from "date-fns-tz"
import {SALON_TIMEZONE} from "@/lib/date"
import {cn} from "@/lib/cn"
import type {CalendarEvent} from "@/features/booking/calendar-actions"
import {isoDay} from "./calendar-math"
import {STATUS_STYLES} from "./status-styles"

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"]
const WEEKDAYS_SHORT = ["P", "W", "Ś", "C", "P", "S", "N"]
const MAX_CHIPS = 3

interface MonthGridProps {
	days: string[]
	events: CalendarEvent[]
	monthKey: string
	todayIso: string
	onDayClick: (dayKey: string) => void
}

export function MonthGrid({days, events, monthKey, todayIso, onDayClick}: MonthGridProps) {
	const byDay = useMemo(() => bucketByDay(events), [events])

	return (
		<div className="overflow-hidden rounded-xl border border-border-soft bg-white">
			<div className="grid grid-cols-7 border-b border-border-soft">
				{WEEKDAYS.map((d, i) => (
					<div
						key={i}
						className="px-1 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-graphite-400 sm:px-2"
					>
						<span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
						<span className="hidden sm:inline">{d}</span>
					</div>
				))}
			</div>
			<div className="grid grid-cols-7">
				{days.map((day, i) => {
					const inMonth = day.slice(0, 7) === monthKey
					const isToday = day === todayIso
					const dayNum = Number(day.slice(8, 10))
					const dayEvents = byDay[day] ?? []
					const shown = dayEvents.slice(0, MAX_CHIPS)
					return (
						<button
							key={day}
							type="button"
							onClick={() => onDayClick(day)}
							className={cn(
								"flex min-h-[64px] flex-col gap-1 border-b border-l border-border-soft p-1.5 text-left md:min-h-[92px]",
								"transition-[background-color] duration-150 ease-out hover-supported:hover:bg-rose-50/40",
								i % 7 === 0 && "border-l-0",
								!inMonth && "bg-warm/30",
							)}
						>
							<span
								className={cn(
									"inline-flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums",
									isToday
										? "bg-rose-600 font-semibold text-white"
										: inMonth
											? "text-graphite-700"
											: "text-graphite-400",
								)}
							>
								{dayNum}
							</span>
							<span className="flex min-w-0 flex-col gap-0.5">
								{shown.map((ev, idx) => {
									const st = STATUS_STYLES[ev.extendedProps.status]
									return (
										<span
											key={ev.id}
											className={cn(
												"flex min-w-0 items-center gap-1 text-[10px]",
												idx === 2 && "hidden md:flex",
												st.strike && "line-through",
											)}
										>
											<span
												className={cn("h-1.5 w-1.5 shrink-0 rounded-full", st.dimmed && "opacity-40")}
												style={{backgroundColor: ev.backgroundColor}}
												aria-hidden="true"
											/>
											<span className="shrink-0 tabular-nums text-graphite-500">
												{formatInTimeZone(new Date(ev.extendedProps.startAt), SALON_TIMEZONE, "HH:mm")}
											</span>
											<span className="truncate text-graphite-700">{ev.extendedProps.customerName}</span>
										</span>
									)
								})}
								{dayEvents.length > 2 && (
									<span className="text-[10px] font-medium text-rose-600 md:hidden">
										+{dayEvents.length - 2} więcej
									</span>
								)}
								{dayEvents.length > 3 && (
									<span className="hidden text-[10px] font-medium text-rose-600 md:block">
										+{dayEvents.length - 3} więcej
									</span>
								)}
							</span>
						</button>
					)
				})}
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
	for (const key of Object.keys(map)) {
		map[key].sort((a, b) => a.start.localeCompare(b.start))
	}
	return map
}
