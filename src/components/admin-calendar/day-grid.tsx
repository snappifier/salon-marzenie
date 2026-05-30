// src/components/admin-calendar/day-grid.tsx
"use client"

import type {CalendarEvent} from "@/features/booking/calendar-actions"
import {DayColumn} from "./day-column"
import {TimeGutter} from "./time-gutter"

interface DayGridProps {
	dayKey: string
	events: CalendarEvent[]
	salonOpenMin: number
	salonCloseMin: number
	todayIso: string
	onEventClick: (event: CalendarEvent) => void
	onSlotClick: (start: Date) => void
}

export function DayGrid({
	dayKey,
	events,
	salonOpenMin,
	salonCloseMin,
	todayIso,
	onEventClick,
	onSlotClick,
}: DayGridProps) {
	return (
		<div className="rounded-xl border border-border-soft bg-white">
			<div className="flex">
				<TimeGutter salonOpenMin={salonOpenMin} salonCloseMin={salonCloseMin} />
				<DayColumn
					className="flex-1 border-l border-border-soft"
					dayKey={dayKey}
					events={events}
					salonOpenMin={salonOpenMin}
					salonCloseMin={salonCloseMin}
					showNow={dayKey === todayIso}
					onEventClick={onEventClick}
					onSlotClick={onSlotClick}
				/>
			</div>
		</div>
	)
}
