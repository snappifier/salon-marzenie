// src/components/admin-calendar/agenda-view.tsx
"use client"

import {useMemo} from "react"
import {AlertCircle, CalendarDays, Check, Clock} from "lucide-react"
import {SALON_TIMEZONE} from "@/lib/date"
import {cn} from "@/lib/cn"
import {Avatar} from "@/components/ui/avatar"
import {EmptyState} from "@/components/ui/empty-state"
import type {CalendarEvent} from "@/features/booking/calendar-actions"
import type {StaffResource} from "./calendar-types"
import {isoDay} from "./calendar-math"
import {formatAgendaDayHeading, formatTimeRange} from "./calendar-format"
import {STATUS_STYLES} from "./status-styles"

const STATUS_ICON = {clock: Clock, check: Check, alert: AlertCircle}

// Nagłówki dni/pracowników są sticky tuż pod paskiem admina (h-16 = 64px)
const STICKY_TOP = "top-16"

interface AgendaViewProps {
	events: CalendarEvent[]
	groupBy: "none" | "day" | "staff"
	days?: string[]
	staff?: StaffResource[]
	todayIso: string
	onEventClick: (event: CalendarEvent) => void
}

export function AgendaView({events, groupBy, days, staff, todayIso, onEventClick}: AgendaViewProps) {
	const sorted = useMemo(
		() => [...events].sort((a, b) => a.extendedProps.startAt.localeCompare(b.extendedProps.startAt)),
		[events],
	)

	const groups = useMemo(() => {
		if (groupBy === "day") {
			const map = bucketBy(sorted, (e) => isoDay(new Date(e.extendedProps.startAt), SALON_TIMEZONE))
			const order = days ?? Object.keys(map).sort()
			return order.filter((key) => (map[key]?.length ?? 0) > 0).map((key) => ({key, events: map[key]}))
		}
		if (groupBy === "staff") {
			const map = bucketBy(sorted, (e) => e.extendedProps.staffId)
			return (staff ?? []).map((s) => ({key: s.id, events: map[s.id] ?? []}))
		}
		return []
	}, [sorted, groupBy, days, staff])

	if (events.length === 0) {
		return (
			<EmptyState
				icon={<CalendarDays size={26} strokeWidth={1.75} />}
				title="Brak wizyt"
				description="W wybranym okresie nie ma zaplanowanych wizyt."
			/>
		)
	}

	if (groupBy === "none") {
		return (
			<div className="overflow-hidden rounded-2xl border border-border-soft bg-white">
				<ul className="divide-y divide-border-soft">
					{sorted.map((event) => (
						<AgendaRow key={event.id} event={event} onClick={() => onEventClick(event)} />
					))}
				</ul>
			</div>
		)
	}

	if (groupBy === "day") {
		return (
			<div className="flex flex-col gap-3">
				{groups.map(({key, events: dayEvents}) => (
					<section key={key}>
						<DayHeading isoDayStr={key} isToday={key === todayIso} />
						<div className="overflow-hidden rounded-2xl border border-border-soft bg-white">
							<ul className="divide-y divide-border-soft">
								{dayEvents.map((event) => (
									<AgendaRow key={event.id} event={event} onClick={() => onEventClick(event)} />
								))}
							</ul>
						</div>
					</section>
				))}
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			{groups.map(({key, events: staffEvents}) => {
				const person = staff?.find((s) => s.id === key)
				if (!person) return null
				return (
					<section key={key}>
						<StaffHeading staff={person} />
						<div className="overflow-hidden rounded-2xl border border-border-soft bg-white">
							{staffEvents.length > 0 ? (
								<ul className="divide-y divide-border-soft">
									{staffEvents.map((event) => (
										<AgendaRow key={event.id} event={event} onClick={() => onEventClick(event)} />
									))}
								</ul>
							) : (
								<p className="px-4 py-3.5 text-sm text-graphite-400">Brak wizyt</p>
							)}
						</div>
					</section>
				)
			})}
		</div>
	)
}

function DayHeading({isoDayStr, isToday}: {isoDayStr: string; isToday: boolean}) {
	return (
		<h3
			className={cn(
				"sticky z-10 flex items-center gap-2 bg-cream px-1 pb-2 pt-1 text-sm font-medium",
				STICKY_TOP,
				isToday ? "text-rose-600" : "text-graphite-900",
			)}
		>
			{formatAgendaDayHeading(isoDayStr, SALON_TIMEZONE)}
			{isToday && <span className="h-1.5 w-1.5 rounded-full bg-rose-600" aria-hidden="true" />}
		</h3>
	)
}

function StaffHeading({staff}: {staff: StaffResource}) {
	return (
		<h3 className={cn("sticky z-10 flex items-center gap-2 bg-cream px-1 pb-2 pt-1", STICKY_TOP)}>
			<Avatar name={`${staff.firstName} ${staff.lastName}`} size="sm" accentColor={staff.color} />
			<span className="text-sm font-medium text-graphite-900">
				{staff.firstName} {staff.lastName}
			</span>
		</h3>
	)
}

function AgendaRow({event, onClick}: {event: CalendarEvent; onClick: () => void}) {
	const p = event.extendedProps
	const style = STATUS_STYLES[p.status]
	const Icon = style.icon ? STATUS_ICON[style.icon] : null
	const timeRange = formatTimeRange(p.startAt, p.endAt, SALON_TIMEZONE)
	const staffFirst = p.staffName.split(" ")[0]

	return (
		<li>
			<button
				className={cn(
					"flex w-full items-start gap-3 px-4 py-3 text-left",
					"transition-[background-color,transform] duration-150 ease-out",
					"hover-supported:hover:bg-rose-50/30 active:scale-[0.99]",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500/30",
				)}
				type="button"
				onClick={onClick}
			>
				<span
					className={cn(
						"mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
						style.dimmed && "bg-graphite-300 opacity-50",
					)}
					style={style.dimmed ? undefined : {backgroundColor: event.backgroundColor}}
					aria-hidden="true"
				/>
				<span className={cn("min-w-0 flex-1", style.dimmed && "opacity-60")}>
					<span className="flex items-center gap-2">
						<span
							className={cn(
								"shrink-0 text-sm tabular-nums text-graphite-600",
								style.strike && "line-through",
							)}
						>
							{timeRange}
						</span>
						<span
							className={cn(
								"min-w-0 flex-1 truncate font-medium text-graphite-900",
								style.strike && "line-through",
							)}
						>
							{p.customerName}
						</span>
						{Icon && <Icon className={cn("size-4 shrink-0", style.iconClass)} strokeWidth={2} aria-hidden="true" />}
					</span>
					<span className={cn("mt-0.5 block truncate text-sm text-graphite-600", style.strike && "line-through")}>
						{p.serviceName} · u {staffFirst}
					</span>
				</span>
			</button>
		</li>
	)
}

function bucketBy(events: CalendarEvent[], keyOf: (e: CalendarEvent) => string): Record<string, CalendarEvent[]> {
	const map: Record<string, CalendarEvent[]> = {}
	for (const event of events) {
		;(map[keyOf(event)] ??= []).push(event)
	}
	return map
}
