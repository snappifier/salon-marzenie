import Link from "next/link"
import {ChevronRight, Heart} from "lucide-react"
import {cn} from "@/lib/cn"
import {formatMoney} from "@/lib/money"
import type {DashboardFavorite} from "@/features/dashboard/queries"

interface Props {
	favorites: DashboardFavorite[]
}

function formatDuration(min: number): string {
	const h = Math.floor(min / 60)
	const m = min % 60
	if (h === 0) return `${m} min`
	if (m === 0) return `${h}h`
	return `${h}h ${m} min`
}

function pluralPL(n: number, one: string, few: string, many: string): string {
	const mod10 = n % 10
	const mod100 = n % 100
	if (n === 1) return one
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
	return many
}

export function FavoritesCard({favorites}: Props) {
	return (
		<div className="bg-white border border-border-soft rounded-[var(--radius-lg)] overflow-hidden">
			<div className="px-[22px] pt-[18px] pb-3.5 flex items-center justify-between">
				<h3 className="font-serif font-medium text-lg text-graphite-900 tracking-[-0.01em]">
					Twoje <em className="italic text-rose-600 font-normal">ulubione</em>
				</h3>
			</div>

			<div className="px-[22px] pb-[22px] pt-1 grid gap-2">
				{favorites.length === 0 ? (
					<p className="py-6 text-sm text-graphite-400 italic">
						Po pierwszej wizycie pojawią się tu Twoje ulubione zabiegi.
					</p>
				) : (
					favorites.map((fav) => {
						const countLabel = `${fav.count} ${pluralPL(fav.count, "raz", "razy", "razy")}`
						return (
							<Link
								key={fav.id}
								href={`/rezerwacja?service=${fav.id}`}
								className={cn(
									"flex items-center gap-3 p-3 px-3.5 border border-border-soft rounded-[var(--radius-md)] bg-white group",
									"transition-[border-color,background-color] duration-150 ease-out",
									"hover-supported:hover:border-rose-300 hover-supported:hover:bg-rose-50",
								)}
							>
								<span className="text-rose-500 shrink-0">
									<Heart size={16} fill="currentColor" stroke="currentColor" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="font-serif font-medium text-sm text-graphite-900 tracking-[-0.01em]">
										{fav.name}
									</p>
									<p className="text-[11px] text-graphite-400 mt-0.5">
										{formatMoney(fav.priceGr)} · {formatDuration(fav.durationMin)} · {countLabel}
									</p>
								</div>
								<span
									className={cn(
										"text-graphite-400 shrink-0",
										"transition-[color] duration-150 ease-out",
										"group-hover:text-rose-600",
									)}
								>
									<ChevronRight size={16} strokeWidth={2} />
								</span>
							</Link>
						)
					})
				)}
			</div>
		</div>
	)
}
