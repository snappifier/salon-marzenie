// src/app/(auth)/konto/wizyty/_components/featured-visit.tsx
import Link from "next/link"
import {differenceInCalendarDays} from "date-fns"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {Clock} from "lucide-react"
import {SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {buttonStyles} from "@/components/ui/button"
import type {CustomerVisitDetail} from "@/features/dashboard/visits-queries"

function formatDuration(totalMin: number): string {
	const h = Math.floor(totalMin / 60)
	const m = totalMin % 60
	if (h === 0) return `${m} min`
	if (m === 0) return `${h}h`
	return `${h}h ${m} min`
}

function relativeLabel(target: Date): string {
	const diff = differenceInCalendarDays(target, new Date())
	if (diff <= 0) return "dzisiaj"
	if (diff === 1) return "jutro"
	return `za ${diff} dni`
}

export function FeaturedVisit({visit}: {visit: CustomerVisitDetail}) {
	const day = formatInTimeZone(visit.startAt, SALON_TIMEZONE, "d")
	const month = formatInTimeZone(visit.startAt, SALON_TIMEZONE, "LLLL", {locale: pl})
	const weekday = formatInTimeZone(visit.startAt, SALON_TIMEZONE, "EEEE", {locale: pl})
	const year = formatInTimeZone(visit.startAt, SALON_TIMEZONE, "yyyy")
	const time = formatInTimeZone(visit.startAt, SALON_TIMEZONE, "HH:mm")
	const cancelDeadline = formatInTimeZone(visit.cancelDeadline, SALON_TIMEZONE, "d LLLL, HH:mm", {
		locale: pl,
	})

	return (
		<div className="bg-linear-to-b from-surface-muted to-surface border border-accent-100 rounded-lg p-8 relative overflow-hidden mb-6">

			<div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-7 md:gap-9 md:items-start relative">
				<div>
					<div className="inline-flex items-center gap-1.5 px-3 py-1.25 bg-interactive text-white text-[11px] font-medium uppercase tracking-[0.18em] rounded-full mb-4.5 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-surface">
						Najbliższa · {relativeLabel(visit.startAt)}
					</div>
					<div className="font-display font-medium text-[clamp(40px,5vw,56px)] leading-none tracking-[-0.03em] text-primary mb-1.5">
						{day} <em className="italic text-interactive font-normal">{month}</em>
					</div>
					<div className="text-sm text-secondary mb-4.5">
						{weekday}, {year}
					</div>
					<div className="flex items-baseline gap-3 pt-4 border-t border-accent-100">
						<div className="font-display font-medium text-[28px] text-interactive-hover tracking-[-0.01em]">
							{time}
						</div>
						<div className="text-xs text-secondary">ok. {formatDuration(visit.totalDurationMin)}</div>
					</div>
				</div>

				<div>
					<div className="text-[11px] font-medium uppercase tracking-[0.18em] text-secondary mb-3.5">
						Zaplanowane zabiegi
					</div>

					{visit.items.map((item) => (
						<div
							key={item.id}
							className="flex justify-between items-baseline py-3 border-b border-border-subtle last:border-b-0"
						>
							<div>
								<div className="font-display font-medium text-base text-primary tracking-[-0.01em]">
									{item.serviceName}
									{item.serviceDescription && (
										<span className="block font-body text-[11px] text-secondary mt-0.5 font-normal tracking-normal">
											{item.serviceDescription}
										</span>
									)}
								</div>
							</div>
							<div className="font-display font-medium text-[15px] text-primary shrink-0">
								{formatMoney(item.priceGr)}
							</div>
						</div>
					))}

					<div className="flex justify-between items-baseline pt-4 mt-1.5 border-t border-accent-100">
						<div className="text-xs text-secondary uppercase tracking-[0.18em] font-medium">
							Razem
						</div>
						<div className="font-display font-medium text-2xl text-primary tracking-[-0.01em]">
							{formatMoney(visit.totalPriceGr)}
						</div>
					</div>

					<div className="flex items-center gap-2 mt-4.5 px-3.5 py-2.5 bg-surface/60 rounded-md text-xs text-secondary">
						<span className="text-interactive shrink-0">
							<Clock size={14} strokeWidth={1.8} />
						</span>
						Bezpłatne odwołanie do{" "}
						<strong className="text-primary font-medium">{cancelDeadline}</strong>
					</div>

					<div className="flex flex-wrap gap-2.5 mt-6 pt-5 border-t border-accent-100">
						<Link href={`/moja-wizyta/${visit.manageToken}`} className={buttonStyles({size: "sm"})}>
							Szczegóły wizyty
						</Link>
						<Link
							href={`/moja-wizyta/${visit.manageToken}`}
							className={buttonStyles({variant: "secondary", size: "sm"})}
						>
							Przełóż termin
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
