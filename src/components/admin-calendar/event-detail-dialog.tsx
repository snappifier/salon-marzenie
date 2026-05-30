// src/components/admin-calendar/event-detail-dialog.tsx
"use client"

import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {Clock, Phone, Scissors, User} from "lucide-react"
import {Modal} from "@/components/ui/modal"
import {StatusBadge} from "@/components/ui/status-badge"
import {buttonStyles} from "@/components/ui/button"
import {SALON_TIMEZONE} from "@/lib/date"
import {cn} from "@/lib/cn"
import type {CalendarEvent} from "@/features/booking/calendar-actions"
import {STATUS_STYLES} from "./status-styles"

interface Props {
	event: CalendarEvent
	onClose: () => void
}

export function EventDetailDialog({event, onClose}: Props) {
	const p = event.extendedProps
	const style = STATUS_STYLES[p.status]
	const start = new Date(p.startAt)
	const end = new Date(p.endAt)
	const dateLabel = capitalize(formatInTimeZone(start, SALON_TIMEZONE, "EEEE, d MMMM", {locale: pl}))
	const timeLabel = `${formatInTimeZone(start, SALON_TIMEZONE, "HH:mm")} - ${formatInTimeZone(end, SALON_TIMEZONE, "HH:mm")}`

	return (
		<Modal
			open
			onClose={onClose}
			title="Szczegóły wizyty"
			footer={
				<div className="flex justify-end gap-2">
					<button type="button" className={buttonStyles({variant: "secondary", size: "sm"})} onClick={onClose}>
						Zamknij
					</button>
					<a className={buttonStyles({size: "sm"})} href={`tel:${p.customerPhone}`}>
						<Phone size={15} strokeWidth={2.25} />
						<span>Zadzwoń</span>
					</a>
				</div>
			}
		>
			<div className="space-y-4">
				<StatusBadge variant={style.badge} />
				<dl className="space-y-3">
					<Row icon={<User size={16} />} label="Klient">
						<div className="font-medium text-graphite-900">{p.customerName}</div>
						<a
							className="text-sm text-rose-600 transition-[color] duration-150 ease-out hover-supported:hover:text-rose-700"
							href={`tel:${p.customerPhone}`}
						>
							{p.customerPhone}
						</a>
					</Row>
					<Row icon={<Scissors size={16} />} label="Zabieg">
						<div className="text-graphite-900">{p.serviceName}</div>
					</Row>
					<Row icon={<User size={16} />} label="Pracownik">
						<div className="text-graphite-900">{p.staffName}</div>
					</Row>
					<Row icon={<Clock size={16} />} label="Termin">
						<div className="text-graphite-900">{dateLabel}</div>
						<div className="text-sm tabular-nums text-graphite-600">
							{timeLabel} · {p.durationMin} min
							{p.bufferAfterMin > 0 ? ` (+${p.bufferAfterMin} min bufor)` : ""}
						</div>
					</Row>
				</dl>
			</div>
		</Modal>
	)
}

function Row({icon, label, children}: {icon: React.ReactNode; label: string; children: React.ReactNode}) {
	return (
		<div className={cn("flex gap-3")}>
			<span className="mt-0.5 shrink-0 text-graphite-400" aria-hidden="true">
				{icon}
			</span>
			<div className="min-w-0">
				<dt className="text-[11px] font-medium uppercase tracking-wide text-graphite-400">{label}</dt>
				<dd className="mt-0.5">{children}</dd>
			</div>
		</div>
	)
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}
