import Link from "next/link"
import {differenceInCalendarDays, subHours} from "date-fns"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {Calendar, Clock} from "lucide-react"
import {SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {ButterflyWatermark} from "@/components/public/butterfly-watermark"
import {buttonStyles} from "@/components/ui/button"
import type {DashboardNextBooking} from "@/features/dashboard/queries"

const CANCEL_DEADLINE_HOURS = 24

function formatDuration(totalMin: number): string {
	const h = Math.floor(totalMin / 60)
	const m = totalMin % 60
	if (h === 0) return `${m} min`
	if (m === 0) return `${h}h`
	return `${h}h ${m} min`
}

function relativeDays(target: Date): string {
	const diff = differenceInCalendarDays(target, new Date())
	if (diff === 0) return "dzisiaj"
	if (diff === 1) return "jutro"
	if (diff < 0) return ""
	return `za ${diff} dni`
}

interface Props {
	booking: DashboardNextBooking
}

export function NextVisitCard({booking}: Props) {
	if (!booking) return <EmptyNextVisit />

	const day = formatInTimeZone(booking.startAt, SALON_TIMEZONE, "d")
	const month = formatInTimeZone(booking.startAt, SALON_TIMEZONE, "LLLL", {locale: pl})
	const weekday = formatInTimeZone(booking.startAt, SALON_TIMEZONE, "EEEE", {locale: pl})
	const year = formatInTimeZone(booking.startAt, SALON_TIMEZONE, "yyyy")
	const time = formatInTimeZone(booking.startAt, SALON_TIMEZONE, "HH:mm")
	const cancelDeadline = subHours(booking.startAt, CANCEL_DEADLINE_HOURS)
	const cancelDeadlineLabel = formatInTimeZone(cancelDeadline, SALON_TIMEZONE, "d LLLL, HH:mm", {locale: pl})
	const rel = relativeDays(booking.startAt)
	const duration = formatDuration(booking.totalDurationMin)

	return (
		<div className="bg-gradient-to-b from-rose-50 to-white border border-rose-100 rounded-[var(--radius-lg)] p-7 relative overflow-hidden">
			<ButterflyWatermark className="absolute -top-10 -right-10 w-[220px] opacity-40" />

			<div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-7 sm:gap-8 relative">
				<div className="flex flex-col">
					<p className="text-[10px] font-medium uppercase tracking-[0.16em] text-rose-600 mb-2">
						Najbliższa wizyta
					</p>
					<p className="font-serif font-medium text-[clamp(36px,4.5vw,48px)] leading-none text-graphite-900 tracking-[-0.025em] mb-1">
						{day} <em className="italic text-rose-600 font-normal">{month}</em>
					</p>
					<p className="text-sm text-graphite-600 mb-3">
						{weekday}, {year}
					</p>
					<p className="font-serif font-medium text-[22px] text-rose-700 mb-1">{time}</p>
					<p className="text-xs text-graphite-400">
						ok. {duration}
						{rel && ` · ${rel}`}
					</p>
				</div>

				<div className="border-t border-border-soft pt-5 sm:border-t-0 sm:pt-0 sm:border-l sm:border-border-soft sm:pl-7">
					<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-graphite-400 mb-3">
						Zaplanowane zabiegi
					</p>

					{booking.items.map((item) => (
						<div
							key={item.id}
							className="flex justify-between items-baseline py-2.5 border-b border-border-soft last:border-b-0"
						>
							<div>
								<p className="font-serif font-medium text-[15px] text-graphite-900 tracking-[-0.01em]">
									{item.serviceName}
									{item.serviceDescription && (
										<span className="block font-sans text-[11px] text-graphite-400 mt-0.5 font-normal tracking-normal">
											{item.serviceDescription}
										</span>
									)}
								</p>
							</div>
							<p className="font-serif font-medium text-sm text-graphite-900 shrink-0">
								{formatMoney(item.priceGr)}
							</p>
						</div>
					))}

					<div className="flex justify-between items-baseline pt-3.5 mt-1.5 border-t border-rose-100">
						<p className="text-xs text-graphite-600 uppercase tracking-[0.14em] font-medium">Razem</p>
						<p className="font-serif font-medium text-[22px] text-graphite-900 tracking-[-0.01em]">
							{formatMoney(booking.totalPriceGr)}
						</p>
					</div>

					<div className="flex items-center gap-2 mt-[18px] px-3.5 py-2.5 bg-white/60 rounded-[var(--radius-md)] text-xs text-graphite-600">
						<span className="text-rose-600 shrink-0">
							<Clock size={14} strokeWidth={1.8} />
						</span>
						Bezpłatne odwołanie do{" "}
						<strong className="text-graphite-900 font-medium">{cancelDeadlineLabel}</strong>
					</div>

					<div className="flex flex-wrap gap-2.5 mt-6 pt-5 border-t border-rose-100">
						<Link
							href={`/moja-wizyta/${booking.manageToken}`}
							className={buttonStyles({size: "sm"})}
						>
							Szczegóły wizyty
						</Link>
						<button
							type="button"
							className={buttonStyles({variant: "secondary", size: "sm"})}
						>
							<Calendar size={13} strokeWidth={2} />
							Dodaj do kalendarza
						</button>
						<Link
							href={`/moja-wizyta/${booking.manageToken}`}
							className={buttonStyles({variant: "ghost", size: "sm"})}
						>
							Przełóż termin
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

function EmptyNextVisit() {
	return (
		<div className="bg-gradient-to-b from-rose-50 to-white border border-rose-100 rounded-[var(--radius-lg)] p-7 relative overflow-hidden">
			<ButterflyWatermark className="absolute -top-10 -right-10 w-[220px] opacity-40" />

			<div className="relative">
				<p className="text-[10px] font-medium uppercase tracking-[0.16em] text-rose-600 mb-2">
					Najbliższa wizyta
				</p>
				<p className="font-serif font-medium text-[clamp(24px,3vw,32px)] leading-tight text-graphite-900 tracking-[-0.02em] mb-2">
					Brak zaplanowanej wizyty.{" "}
					<em className="italic text-rose-600 font-normal">Zarezerwujmy nową.</em>
				</p>
				<p className="text-sm text-graphite-600 max-w-[420px] mb-5">
					Sprawdź dostępne terminy w kalendarzu i zarezerwuj swój ulubiony zabieg w kilka kliknięć.
				</p>
				<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
					Zarezerwuj wizytę
				</Link>
			</div>
		</div>
	)
}
