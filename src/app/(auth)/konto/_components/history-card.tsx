import Link from "next/link"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {cn} from "@/lib/cn"
import {SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import type {DashboardRecentBooking} from "@/features/dashboard/queries"

interface Props {
	bookings: DashboardRecentBooking[]
}

export function HistoryCard({bookings}: Props) {
	return (
		<div className="bg-white border border-border-soft rounded-[var(--radius-lg)] overflow-hidden">
			<div className="px-[22px] pt-[18px] pb-3.5 flex items-center justify-between gap-3">
				<h3 className="font-serif font-medium text-lg text-graphite-900 tracking-[-0.01em]">
					Ostatnie <em className="italic text-rose-600 font-normal">wizyty</em>
				</h3>
				<Link
					href="/konto/historia"
					className={cn(
						"text-xs text-rose-600 font-medium",
						"transition-[color] duration-150 ease-out",
						"hover-supported:hover:underline",
					)}
				>
					Zobacz wszystkie →
				</Link>
			</div>

			<div className="px-[22px] pb-[22px] pt-1">
				{bookings.length === 0 ? (
					<p className="py-6 text-sm text-graphite-400 italic">Brak zakończonych wizyt.</p>
				) : (
					bookings.map((b) => {
						const day = formatInTimeZone(b.startAt, SALON_TIMEZONE, "dd")
						const month = formatInTimeZone(b.startAt, SALON_TIMEZONE, "LLL", {locale: pl})

						return (
							<div
								key={b.id}
								className="grid grid-cols-[56px_1fr_auto] gap-4 py-3.5 border-b border-border-soft last:border-b-0 items-center"
							>
								<div className="text-center px-1 py-2 bg-warm rounded-[var(--radius-md)]">
									<p className="font-serif font-medium text-lg text-graphite-900 leading-none tracking-[-0.01em]">
										{day}
									</p>
									<p className="text-[10px] uppercase text-rose-600 tracking-[0.12em] mt-1 font-medium">
										{month}
									</p>
								</div>

								<div className="min-w-0">
									<p className="font-serif font-medium text-[15px] text-graphite-900 tracking-[-0.01em] leading-[1.3] mb-0.5">
										{b.services}
									</p>
									<div className="text-xs text-graphite-400 flex items-center gap-2 flex-wrap">
										<span>{formatMoney(b.priceGr)}</span>
										{b.staffName && (
											<>
												<span className="text-border-default">·</span>
												<span>{b.staffName}</span>
											</>
										)}
									</div>
								</div>

								<Link
									href="/rezerwacja"
									className={cn(
										"inline-flex items-center text-xs font-medium text-rose-600 px-3 py-[7px] border border-border-default rounded-full shrink-0",
										"transition-[border-color,background-color] duration-150 ease-out",
										"hover-supported:hover:border-rose-500 hover-supported:hover:bg-rose-50",
										"active:scale-[0.97]",
									)}
								>
									Powtórz
								</Link>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
