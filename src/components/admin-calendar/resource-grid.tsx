// src/components/admin-calendar/resource-grid.tsx
"use client"

import {useMemo} from "react"
import {getDayOfWeekInSalonTz, SALON_TIMEZONE} from "@/lib/date"
import {Avatar} from "@/components/ui/avatar"
import type {CalendarEvent} from "@/features/booking/calendar-actions"
import type {StaffResource} from "./calendar-types"
import {addIsoDays, isoDayStart, minutesOfDayInTz} from "./calendar-math"
import {DayColumn, type BlockedRange, type ShadedRange} from "./day-column"
import {TimeGutter} from "./time-gutter"

interface ResourceGridProps {
	dayKey: string
	staff: StaffResource[]
	events: CalendarEvent[]
	salonOpenMin: number
	salonCloseMin: number
	todayIso: string
	onEventClick: (event: CalendarEvent) => void
	onSlotClick: (start: Date, staffId: string) => void
}

export function ResourceGrid({
	dayKey,
	staff,
	events,
	salonOpenMin,
	salonCloseMin,
	todayIso,
	onEventClick,
	onSlotClick,
}: ResourceGridProps) {
	const dayStart = useMemo(() => isoDayStart(dayKey, SALON_TIMEZONE), [dayKey])
	const dayEnd = useMemo(() => isoDayStart(addIsoDays(dayKey, 1), SALON_TIMEZONE), [dayKey])
	const dow = useMemo(() => getDayOfWeekInSalonTz(dayStart), [dayStart])

	const columns = useMemo(
		() =>
			staff.map((s) => {
				const staffEvents = events.filter((e) => e.extendedProps.staffId === s.id)
				const wh = s.workingHours.find((w) => w.dayOfWeek === dow)
				const shaded: ShadedRange[] = wh
					? [
							{startMin: salonOpenMin, endMin: wh.startMin},
							{startMin: wh.endMin, endMin: salonCloseMin},
						].filter((r) => r.endMin > r.startMin)
					: [{startMin: salonOpenMin, endMin: salonCloseMin}]

				const blocked: BlockedRange[] = s.timeOffs
					.filter((to) => to.startAt < dayEnd && to.endAt > dayStart)
					.map((to) => ({
						startMin: to.startAt <= dayStart ? salonOpenMin : minutesOfDayInTz(to.startAt, SALON_TIMEZONE),
						endMin: to.endAt >= dayEnd ? salonCloseMin : minutesOfDayInTz(to.endAt, SALON_TIMEZONE),
						label: to.reason ?? "Urlop",
					}))
					.filter((r) => r.endMin > r.startMin)

				return {staff: s, staffEvents, shaded, blocked}
			}),
		[staff, events, dow, dayStart, dayEnd, salonOpenMin, salonCloseMin],
	)

	return (
		<div className="overflow-x-auto overflow-y-hidden rounded-xl border border-border-soft bg-white">
			<div className="flex" style={{minWidth: 56 + columns.length * 150}}>
				<div className="w-12 shrink-0 sm:w-14" aria-hidden="true">
					<div className="h-[57px] border-b border-border-soft" />
				</div>
				<div className="flex flex-1">
					{columns.map(({staff: s, staffEvents, shaded, blocked}) => (
						<div key={s.id} className="min-w-[150px] flex-1 border-l border-border-soft">
							<div className="flex h-[57px] items-center gap-2 border-b border-border-soft px-2">
								<Avatar name={`${s.firstName} ${s.lastName}`} size="sm" accentColor={s.color} />
								<span className="truncate text-sm font-medium text-graphite-900">{s.firstName}</span>
							</div>
							<DayColumn
								dayKey={dayKey}
								events={staffEvents}
								salonOpenMin={salonOpenMin}
								salonCloseMin={salonCloseMin}
								showNow={dayKey === todayIso}
								shadedRanges={shaded}
								blockedRanges={blocked}
								onEventClick={onEventClick}
								onSlotClick={(start) => onSlotClick(start, s.id)}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
