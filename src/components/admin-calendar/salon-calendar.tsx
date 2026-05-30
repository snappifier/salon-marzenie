// src/components/admin-calendar/salon-calendar.tsx
"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {minutesToUtcDate, SALON_TIMEZONE} from "@/lib/date"
import {cn} from "@/lib/cn"
import {fetchCalendarEvents, type CalendarEvent} from "@/features/booking/calendar-actions"
import {AddBookingDialog} from "./add-booking-dialog"
import {EventDetailDialog} from "./event-detail-dialog"
import {CalendarToolbar} from "./calendar-toolbar"
import {WeekGrid} from "./week-grid"
import {DayGrid} from "./day-grid"
import {MonthGrid} from "./month-grid"
import {ResourceGrid} from "./resource-grid"
import {StaffLegend} from "./staff-legend"
import {AgendaView} from "./agenda-view"
import {CalendarFab} from "./calendar-fab"
import {
	addIsoDays,
	dayRange,
	isoDay,
	isoDayStart,
	minutesOfDayInTz,
	monthRange,
	snapToSlot,
	weekRange,
} from "./calendar-math"
import {
	formatDayTitle,
	formatDayTitleShort,
	formatMonthTitle,
	formatWeekTitle,
	formatWeekTitleShort,
} from "./calendar-format"
import {useNow} from "./use-now"
import {useIsMobile} from "./use-is-mobile"
import type {CalendarService, ResourceMode, StaffByService, StaffResource, ViewMode} from "./calendar-types"

interface SalonCalendarProps {
	staff: StaffResource[]
	services: CalendarService[]
	staffByService: StaffByService
	salonOpenMin: number
	salonCloseMin: number
	initialDate?: string
	initialView?: ViewMode
}

interface AddContext {
	start: Date
	staffId: string | null
}

export function SalonCalendar({
	staff,
	services,
	staffByService,
	salonOpenMin,
	salonCloseMin,
	initialDate,
	initialView,
}: SalonCalendarProps) {
	const [mounted, setMounted] = useState(false)
	const [view, setView] = useState<ViewMode>(initialView ?? "week")
	const [resourceMode, setResourceMode] = useState<ResourceMode>("combined")
	const [currentDate, setCurrentDate] = useState<Date>(() =>
		initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)
			? isoDayStart(initialDate, SALON_TIMEZONE)
			: new Date(),
	)
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [loading, setLoading] = useState(true)
	const [addContext, setAddContext] = useState<AddContext | null>(null)
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

	const now = useNow()
	const todayIso = isoDay(now, SALON_TIMEZONE)
	const isMobile = useIsMobile()
	const useAgenda = isMobile && view !== "month"

	useEffect(() => {
		setMounted(true)
		if (!initialView && typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
			setView("day")
		}
	}, [initialView])

	const range = useMemo(() => {
		if (view === "week") return weekRange(currentDate, SALON_TIMEZONE)
		if (view === "month") return monthRange(currentDate, SALON_TIMEZONE)
		return dayRange(currentDate, SALON_TIMEZONE)
	}, [view, currentDate])

	const reqId = useRef(0)
	const reload = useCallback(() => {
		const id = ++reqId.current
		setLoading(true)
		fetchCalendarEvents(range.start.toISOString(), range.end.toISOString())
			.then((evts) => {
				if (id === reqId.current) {
					setEvents(evts)
					setLoading(false)
				}
			})
			.catch(() => {
				if (id === reqId.current) {
					setEvents([])
					setLoading(false)
				}
			})
	}, [range])

	useEffect(() => {
		if (mounted) reload()
	}, [mounted, reload])

	const dayKey = isoDay(currentDate, SALON_TIMEZONE)

	const title = useMemo(() => {
		if (view === "week") {
			return formatWeekTitle(
				isoDayStart(range.days[0], SALON_TIMEZONE),
				isoDayStart(range.days[range.days.length - 1], SALON_TIMEZONE),
				SALON_TIMEZONE,
			)
		}
		if (view === "month") return formatMonthTitle(currentDate, SALON_TIMEZONE)
		return formatDayTitle(currentDate, SALON_TIMEZONE)
	}, [view, currentDate, range])

	const titleShort = useMemo(() => {
		if (view === "week") {
			return formatWeekTitleShort(
				isoDayStart(range.days[0], SALON_TIMEZONE),
				isoDayStart(range.days[range.days.length - 1], SALON_TIMEZONE),
				SALON_TIMEZONE,
			)
		}
		if (view === "month") return formatMonthTitle(currentDate, SALON_TIMEZONE)
		return formatDayTitleShort(currentDate, SALON_TIMEZONE)
	}, [view, currentDate, range])

	function navigate(delta: number) {
		setCurrentDate((prev) => {
			const key = isoDay(prev, SALON_TIMEZONE)
			if (view === "day") return isoDayStart(addIsoDays(key, delta), SALON_TIMEZONE)
			if (view === "week") return isoDayStart(addIsoDays(key, delta * 7), SALON_TIMEZONE)
			let [y, m] = key.split("-").map(Number)
			m += delta
			while (m < 1) {
				m += 12
				y--
			}
			while (m > 12) {
				m -= 12
				y++
			}
			return isoDayStart(`${y}-${String(m).padStart(2, "0")}-01`, SALON_TIMEZONE)
		})
	}

	function handleDayClick(clicked: string) {
		setCurrentDate(isoDayStart(clicked, SALON_TIMEZONE))
		setView("day")
	}

	function handleAddSuccess() {
		setAddContext(null)
		reload()
	}

	function handleAddClick() {
		const baseMin =
			dayKey === todayIso
				? Math.min(Math.max(snapToSlot(minutesOfDayInTz(now, SALON_TIMEZONE), 15), salonOpenMin), salonCloseMin - 15)
				: salonOpenMin
		setAddContext({start: minutesToUtcDate(currentDate, baseMin), staffId: null})
	}

	const touchX = useRef<number | null>(null)
	const swipeEnabled = view !== "month"
	function onTouchStart(e: React.TouchEvent) {
		touchX.current = e.touches[0].clientX
	}
	function onTouchEnd(e: React.TouchEvent) {
		if (touchX.current === null) return
		const dx = e.changedTouches[0].clientX - touchX.current
		touchX.current = null
		if (Math.abs(dx) > 60) navigate(dx < 0 ? 1 : -1)
	}

	if (!mounted) return <CalendarSkeleton />

	return (
		<div className="flex flex-col gap-4">
			<CalendarToolbar
				title={title}
				titleShort={titleShort}
				view={view}
				resourceMode={resourceMode}
				eventCount={events.length}
				loading={loading}
				onPrev={() => navigate(-1)}
				onNext={() => navigate(1)}
				onToday={() => setCurrentDate(new Date())}
				onViewChange={setView}
				onResourceModeChange={setResourceMode}
				onAdd={handleAddClick}
			/>

			{view !== "month" && <StaffLegend staff={staff} />}

			<div
				onTouchStart={swipeEnabled ? onTouchStart : undefined}
				onTouchEnd={swipeEnabled ? onTouchEnd : undefined}
			>
				{loading ? (
					<GridSkeleton />
				) : useAgenda ? (
					<AgendaView
						events={events}
						groupBy={view === "week" ? "day" : resourceMode === "perStaff" ? "staff" : "none"}
						days={range.days}
						staff={staff}
						todayIso={todayIso}
						onEventClick={setSelectedEvent}
					/>
				) : view === "month" ? (
					<MonthGrid
						days={range.days}
						events={events}
						monthKey={dayKey.slice(0, 7)}
						todayIso={todayIso}
						onDayClick={handleDayClick}
					/>
				) : view === "week" ? (
					<WeekGrid
						days={range.days}
						events={events}
						salonOpenMin={salonOpenMin}
						salonCloseMin={salonCloseMin}
						todayIso={todayIso}
						onEventClick={setSelectedEvent}
						onSlotClick={(start) => setAddContext({start, staffId: null})}
					/>
				) : resourceMode === "perStaff" ? (
					<ResourceGrid
						dayKey={dayKey}
						staff={staff}
						events={events}
						salonOpenMin={salonOpenMin}
						salonCloseMin={salonCloseMin}
						todayIso={todayIso}
						onEventClick={setSelectedEvent}
						onSlotClick={(start, staffId) => setAddContext({start, staffId})}
					/>
				) : (
					<DayGrid
						dayKey={dayKey}
						events={events}
						salonOpenMin={salonOpenMin}
						salonCloseMin={salonCloseMin}
						todayIso={todayIso}
						onEventClick={setSelectedEvent}
						onSlotClick={(start) => setAddContext({start, staffId: null})}
					/>
				)}

				{!loading && !useAgenda && events.length === 0 && (
					<p className="py-3 text-center text-sm text-graphite-400">Brak wizyt w tym okresie</p>
				)}
			</div>

			<CalendarFab onClick={handleAddClick} />

			{addContext && (
				<AddBookingDialog
					prefilledStart={addContext.start}
					prefilledStaffId={addContext.staffId}
					services={services}
					staffByService={staffByService}
					onClose={() => setAddContext(null)}
					onSuccess={handleAddSuccess}
				/>
			)}

			{selectedEvent && (
				<EventDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
			)}
		</div>
	)
}

function CalendarSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="h-9 w-48 animate-pulse rounded-full bg-warm" />
				<div className="h-9 w-40 animate-pulse rounded-full bg-warm" />
			</div>
			<GridSkeleton />
		</div>
	)
}

function GridSkeleton() {
	return (
		<div className={cn("h-[520px] animate-pulse rounded-xl border border-border-soft bg-warm/60")} aria-hidden="true" />
	)
}
