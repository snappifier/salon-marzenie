// src/components/customers/customer-history.tsx
"use client"

import {useMemo, useState} from "react"
import {CalendarX2} from "lucide-react"
import {StatusBadge, type StatusVariant} from "@/components/ui/status-badge"
import {EmptyState} from "@/components/ui/empty-state"
import {formatDate, formatTime} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {cn} from "@/lib/cn"
import type {Booking, BookingItem, BookingStatus, Service, Staff} from "@/generated/prisma/client"

interface BookingWithItems extends Booking {
	items: (BookingItem & {service: Service; staff: Staff})[]
}

const STATUS_TO_VARIANT: Record<BookingStatus, StatusVariant> = {
	CONFIRMED: "confirmed",
	PENDING: "pending",
	CANCELLED: "cancelled",
	COMPLETED: "completed",
	NO_SHOW: "no_show",
}

interface CustomerHistoryProps {
	bookings: BookingWithItems[]
}

export function CustomerHistory({bookings}: CustomerHistoryProps) {
	const [showOnlyCompleted, setShowOnlyCompleted] = useState(false)
	const filtered = useMemo(() => {
		if (!showOnlyCompleted) return bookings
		return bookings.filter((b) => b.status === "COMPLETED")
	}, [bookings, showOnlyCompleted])

	if (bookings.length === 0) {
		return (
			<EmptyState
				icon={<CalendarX2 size={24} />}
				title="Brak wizyt"
				description="Klient jeszcze nie odwiedził salonu."
			/>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<p className="text-sm text-graphite-600">
					{filtered.length === bookings.length ? (
						<>Łącznie <span className="font-medium tabular-nums text-graphite-900">{bookings.length}</span> wizyt</>
					) : (
						<>Pokazano <span className="font-medium tabular-nums text-graphite-900">{filtered.length}</span> z {bookings.length}</>
					)}
				</p>
				<div className="inline-flex items-center gap-1 p-1 rounded-full bg-warm border border-border-soft" role="group">
					{[
						{value: "all", label: "Wszystkie"},
						{value: "completed", label: "Zrealizowane"},
					].map((opt) => {
						const isActive = (opt.value === "completed") === showOnlyCompleted
						return (
							<button
								key={opt.value}
								type="button"
								aria-pressed={isActive}
								onClick={() => setShowOnlyCompleted(opt.value === "completed")}
								className={cn(
									"px-3 h-7 rounded-full text-xs font-medium whitespace-nowrap",
									"transition-[background-color,color,box-shadow] duration-150 ease-out",
									isActive
										? "bg-white text-rose-700 shadow-xs ring-1 ring-rose-200/60"
										: "text-graphite-600 hover-supported:hover:text-graphite-900",
								)}
							>
								{opt.label}
							</button>
						)
					})}
				</div>
			</div>

			{filtered.length === 0 ? (
				<EmptyState
					className="border-0 bg-transparent p-6 md:p-8"
					icon={<CalendarX2 size={20} />}
					title="Brak zrealizowanych wizyt"
					description="W tym filtrze nie ma jeszcze wizyt do pokazania."
				/>
			) : (
				<ol className="relative flex flex-col gap-3">
					{filtered.map((booking) => {
						const first = booking.items[0]
						const last = booking.items[booking.items.length - 1]
						const total = booking.items.reduce((sum, i) => sum + i.priceGr, 0)
						const services = booking.items.map((i) => i.service.name).join(" + ")
						const staffNames = Array.from(
							new Set(booking.items.map((i) => `${i.staff.firstName} ${i.staff.lastName}`)),
						).join(", ")

						return (
							<li
								key={booking.id}
								className="rounded-2xl bg-white border border-border-soft p-4 sm:p-5 hover-supported:hover:border-rose-200/60 transition-[border-color] duration-150 ease-out"
							>
								<div className="flex items-start justify-between gap-3 flex-wrap">
									<div className="min-w-0">
										<p className="font-serif text-[17px] text-graphite-900">
											{first ? formatDate(first.startAt) : "—"}
											{first && (
												<span className="font-sans text-sm text-graphite-600 ml-2 tabular-nums">
													{formatTime(first.startAt)} – {formatTime(last.endAt)}
												</span>
											)}
										</p>
										<p className="text-sm text-graphite-700 mt-1">{services}</p>
										{staffNames && (
											<p className="text-xs text-graphite-500 mt-0.5">{staffNames}</p>
										)}
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<span className="font-medium tabular-nums text-graphite-900">
											{formatMoney(total)}
										</span>
										<StatusBadge variant={STATUS_TO_VARIANT[booking.status]} />
									</div>
								</div>

								{(booking.customerNote || booking.adminNote) && (
									<div className="border-t border-border-soft mt-3 pt-3 flex flex-col gap-1.5 text-xs">
										{booking.customerNote && (
											<p className="text-graphite-600">
												<span className="font-medium text-graphite-500">Klient:</span>{" "}
												{booking.customerNote}
											</p>
										)}
										{booking.adminNote && (
											<p className="text-graphite-600">
												<span className="font-medium text-graphite-500">Notatka admina:</span>{" "}
												{booking.adminNote}
											</p>
										)}
									</div>
								)}
							</li>
						)
					})}
				</ol>
			)}
		</div>
	)
}
