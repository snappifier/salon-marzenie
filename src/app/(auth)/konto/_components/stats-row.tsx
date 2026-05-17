import {differenceInMonths} from "date-fns"
import type {DashboardData} from "@/features/dashboard/queries"

interface Props {
	stats: DashboardData["stats"]
}

function pluralPL(n: number, one: string, few: string, many: string) {
	const mod10 = n % 10
	const mod100 = n % 100
	if (n === 1) return one
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
	return many
}

function membershipLabel(createdAt: Date): string {
	const months = differenceInMonths(new Date(), createdAt)
	if (months < 1) return "mniej niż miesiąc"
	if (months < 12) return `${months} ${pluralPL(months, "miesiąc", "miesiące", "miesięcy")}`
	const years = Math.floor(months / 12)
	const remMonths = months % 12
	const yearsLabel = `${years} ${pluralPL(years, "rok", "lata", "lat")}`
	if (remMonths === 0) return yearsLabel
	return `${yearsLabel} ${remMonths} ${pluralPL(remMonths, "miesiąc", "miesiące", "miesięcy")}`
}

export function StatsRow({stats}: Props) {
	const sinceYear = stats.createdAt.getFullYear()
	const deltaLabel = stats.yearDelta === 0
		? "tyle samo co w zeszłym roku"
		: stats.yearDelta > 0
			? `+${stats.yearDelta} vs. zeszły rok`
			: `${stats.yearDelta} vs. zeszły rok`

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-[18px]">
			<StatTile
				label="Wizyty w tym roku"
				value={String(stats.yearCount)}
				foot={deltaLabel}
				footPositive={stats.yearDelta > 0}
			/>
			<StatTile
				label="Ulubiony zabieg"
				valueNode={
					stats.topServiceName ? (
						<span className="text-[22px]">{stats.topServiceName}</span>
					) : (
						<span className="text-[18px] text-graphite-400 italic">jeszcze brak</span>
					)
				}
			/>
			<StatTile
				label="Klientka od"
				valueNode={
					<>
						{sinceYear}
						<em className="font-serif italic text-rose-500 font-normal text-[18px] ml-0.5">r.</em>
					</>
				}
				foot={membershipLabel(stats.createdAt)}
			/>
		</div>
	)
}

interface StatTileProps {
	label: string
	value?: string
	valueNode?: React.ReactNode
	foot?: string
	footPositive?: boolean
}

function StatTile({label, value, valueNode, foot, footPositive}: StatTileProps) {
	return (
		<div className="bg-white border border-border-soft rounded-[var(--radius-lg)] px-5 py-[18px]">
			<p className="text-[11px] uppercase tracking-[0.14em] text-graphite-400 font-medium mb-2.5">
				{label}
			</p>
			<p className="font-serif font-medium text-[28px] leading-[1.05] text-graphite-900 tracking-[-0.02em]">
				{valueNode ?? value}
			</p>
			{foot && (
				<p className={footPositive ? "text-xs mt-1.5 text-success" : "text-xs mt-1.5 text-graphite-600"}>
					{foot}
				</p>
			)}
		</div>
	)
}
