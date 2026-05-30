// src/components/admin-calendar/event-block.tsx
"use client"

import {formatInTimeZone} from "date-fns-tz"
import {AlertCircle, Check, Clock} from "lucide-react"
import {SALON_TIMEZONE} from "@/lib/date"
import {STATUS_STYLES} from "./status-styles"
import {cn} from "@/lib/cn"
import type {CalendarEvent} from "@/features/booking/calendar-actions"

interface EventBlockProps {
	className?: string
	event: CalendarEvent
	onClick: () => void
	compact?: boolean
	heightPx?: number
}

const STATUS_ICON = {clock: Clock, check: Check, alert: AlertCircle}

export function EventBlock({className, event, onClick, compact, heightPx = 999}: EventBlockProps) {
	const p = event.extendedProps
	const s = STATUS_STYLES[p.status]
	const color = event.backgroundColor
	const Icon = s.icon ? STATUS_ICON[s.icon] : null

	const startTime = formatInTimeZone(new Date(p.startAt), SALON_TIMEZONE, "HH:mm")
	const endTime = formatInTimeZone(new Date(p.endAt), SALON_TIMEZONE, "HH:mm")

	const tiny = heightPx < 30
	const showService = !tiny && heightPx >= 46
	const showRange = !compact || heightPx >= 64

	return (
		<button
			className={cn(
				"relative h-full w-full overflow-hidden rounded-md py-1 pl-2.5 pr-1.5 text-left",
				"transition-[filter,transform] duration-150 ease-out",
				"hover-supported:hover:brightness-[0.97] active:scale-[0.99]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40",
				s.dimmed ? "bg-graphite-100 text-graphite-500" : "text-graphite-900",
				className,
			)}
			type="button"
			onClick={onClick}
			style={s.dimmed ? undefined : {backgroundColor: tint(color, 0.16)}}
		>
			{/* pasek pracownika po lewej (kolor = kto wykonuje) */}
			<span
				className={cn(
					"absolute left-0 top-0 bottom-0 w-[3px]",
					s.pending && "opacity-50",
					s.dimmed && "bg-graphite-300",
				)}
				style={s.dimmed ? undefined : {backgroundColor: color}}
				aria-hidden="true"
			/>

			{/* prawy górny róg: inicjały pracownika + wskaźnik statusu */}
			<span className="absolute right-1 top-1 flex items-center gap-1">
				{Icon && <Icon className={cn("size-3", s.iconClass)} strokeWidth={2} aria-hidden="true" />}
				{!s.dimmed && (
					<span className="text-[10px] font-semibold uppercase leading-none" style={{color}}>
						{initials(p.staffName)}
					</span>
				)}
			</span>

			{tiny ? (
				<span className={cn("flex min-w-0 items-baseline gap-1 pr-6", s.strike && "line-through")}>
					<span className="shrink-0 text-[11px] font-medium tabular-nums">{startTime}</span>
					<span className="truncate text-[11px]">{p.customerName}</span>
				</span>
			) : (
				<span className={cn("flex min-w-0 flex-col gap-0.5 pr-7", s.strike && "line-through")}>
					<span className="text-[11px] font-medium tabular-nums leading-tight">
						{showRange ? `${startTime} - ${endTime}` : startTime}
					</span>
					<span className="truncate text-[12px] font-medium leading-tight">{p.customerName}</span>
					{showService && (
						<span className="truncate text-[11px] leading-tight opacity-75">{p.serviceName}</span>
					)}
				</span>
			)}
		</button>
	)
}

// Kolor pracownika (dowolny hex z bazy) jako delikatne tło — niski alpha trzyma
// tekst czytelnym na jasnym tincie, a pełny kolor zostaje na pasku po lewej.
function tint(hex: string, alpha: number): string {
	const h = hex.replace("#", "")
	if (h.length < 6) return `rgba(203, 213, 225, ${alpha})`
	const r = parseInt(h.slice(0, 2), 16)
	const g = parseInt(h.slice(2, 4), 16)
	const b = parseInt(h.slice(4, 6), 16)
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function initials(fullName: string): string {
	const parts = fullName.trim().split(/\s+/)
	const first = parts[0]?.[0] ?? ""
	const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
	return (first + last).toUpperCase()
}
