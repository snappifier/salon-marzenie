import Link from "next/link"
import {redirect} from "next/navigation"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {CalendarX} from "lucide-react"
import {auth} from "@/lib/auth"
import {cn} from "@/lib/cn"
import {SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {buttonStyles} from "@/components/ui/button"
import {Eyebrow} from "@/components/ui/eyebrow"
import {getCustomerHistory} from "@/features/dashboard/history-queries"
import type {HistoryVisit} from "@/features/dashboard/history-queries"
import {Sidebar} from "@/app/(auth)/konto/_components/sidebar"
import {HistoryTimeline, type HistoryRow} from "@/app/(auth)/konto/historia/_components/history-timeline"

const ISO_DOW = ["Pon", "Wt", "Śr", "Czw", "Pią", "Sob", "Nd"]

function fmtDuration(totalMin: number): string {
	const h = Math.floor(totalMin / 60)
	const m = totalMin % 60
	if (h === 0) return `${m} min`
	if (m === 0) return `${h}h`
	return `${h}h ${m} min`
}

function dowLabel(d: Date): string {
	const iso = Number(formatInTimeZone(d, SALON_TIMEZONE, "i"))
	return ISO_DOW[iso - 1]
}

function toRow(v: HistoryVisit): HistoryRow {
	const monthLabel = formatInTimeZone(v.startAt, SALON_TIMEZONE, "LLLL", {locale: pl})
	const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
	const year = formatInTimeZone(v.startAt, SALON_TIMEZONE, "yyyy")
	const dateText = formatInTimeZone(v.startAt, SALON_TIMEZONE, "dd.MM.yyyy")

	return {
		id: v.id,
		manageToken: v.manageToken,
		monthKey: formatInTimeZone(v.startAt, SALON_TIMEZONE, "yyyy-MM"),
		monthTitle,
		year,
		day: formatInTimeZone(v.startAt, SALON_TIMEZONE, "dd"),
		dow: dowLabel(v.startAt),
		time: formatInTimeZone(v.startAt, SALON_TIMEZONE, "HH:mm"),
		duration: fmtDuration(v.durationMin),
		title: v.title,
		priceGr: v.priceGr,
		priceLabel: formatMoney(v.priceGr),
		staffName: v.staffName,
		serviceNames: v.serviceNames,
		haystack: `${v.title} ${v.staffName} ${monthTitle} ${year} ${dateText}`.toLowerCase(),
	}
}

interface StatTileData {
	label: string
	value: React.ReactNode
	foot: React.ReactNode
	footUp?: boolean
	featured?: boolean
	valueSmall?: boolean
}

function StatTile({label, value, foot, footUp, featured, valueSmall}: StatTileData) {
	return (
		<div
			className={cn(
				"border rounded-lg px-5 py-4.5 relative overflow-hidden",
				featured ? "bg-graphite-900 border-graphite-900" : "bg-white border-border-soft",
			)}
		>
			{featured && (
				<span
					className="pointer-events-none absolute -bottom-10 -right-7.5 w-35 h-35 rounded-full"
					style={{background: "radial-gradient(circle, rgba(212,160,172,0.3) 0%, transparent 70%)"}}
				/>
			)}
			<div
				className={cn(
					"text-[11px] uppercase tracking-[0.14em] font-medium mb-2.5 relative",
					featured ? "text-rose-200" : "text-graphite-400",
				)}
			>
				{label}
			</div>
			<div
				className={cn(
					"font-serif font-medium leading-[1.05] tracking-tight relative",
					valueSmall ? "text-[22px]" : "text-[30px]",
					featured ? "text-white" : "text-graphite-900",
				)}
			>
				{value}
			</div>
			<div
				className={cn(
					"text-xs mt-1.5 relative",
					footUp ? "text-success" : featured ? "text-graphite-200" : "text-graphite-600",
				)}
			>
				{foot}
			</div>
		</div>
	)
}

export default async function HistoryPage() {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		redirect("/logowanie")
	}

	const data = await getCustomerHistory(session.user.id)
	if (!data) {
		redirect("/logowanie")
	}

	const {customer, upcomingCount, stats, visits} = data

	const sinceLabel = stats.since
		? `od ${formatInTimeZone(stats.since, SALON_TIMEZONE, "MMMM yyyy", {locale: pl})}`
		: "brak danych"
	const deltaLabel =
		stats.yearDelta > 0
			? `+${stats.yearDelta} vs. zeszły rok`
			: stats.yearDelta < 0
				? `${stats.yearDelta} vs. zeszły rok`
				: "bez zmian vs. zeszły rok"

	const statTiles: StatTileData[] = [
		{label: "Wszystkich wizyt", value: String(stats.totalCount), foot: sinceLabel},
		{
			label: "W tym roku",
			value: String(stats.yearCount),
			foot: deltaLabel,
			footUp: stats.yearDelta > 0,
		},
		{
			label: "Łącznie wydane",
			value: formatMoney(stats.totalSpentGr),
			foot: `średnio ${formatMoney(stats.avgPerVisitGr)} / wizytę`,
		},
		{
			label: "Najczęstszy zabieg",
			value: stats.topService?.name ?? "—",
			foot: stats.topService
				? `${stats.topService.count} ${stats.topService.count === 1 ? "raz" : "razy"} · ${stats.topService.percent}% wszystkich wizyt`
				: "brak danych",
			featured: true,
			valueSmall: true,
		},
	]

	const rows = visits.map(toRow)
	const years = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => b.localeCompare(a))
	const services = Array.from(new Set(rows.flatMap((r) => r.serviceNames))).sort((a, b) =>
		a.localeCompare(b, "pl"),
	)

	return (
		<div className="min-h-screen relative bg-white">
			<Sidebar
				firstName={customer.firstName}
				lastName={customer.lastName}
				upcomingCount={upcomingCount}
			/>

			<main
				className={cn(
					"pt-22 md:pt-8 md:py-8 lg:py-10 pb-14",
					"px-5 md:px-8 lg:px-12",
					"md:ml-65",
				)}
			>
				<header className="flex items-end justify-between flex-wrap gap-4 mb-7">
					<div>
						<Eyebrow className="block mb-1.5">Twoje konto</Eyebrow>
						<h1 className="font-serif font-medium text-[clamp(26px,3.6vw,36px)] leading-[1.15] tracking-tight text-graphite-900">
							Historia <em className="italic text-rose-600 font-normal">wizyt</em>
						</h1>
					</div>
				</header>

				{stats.totalCount === 0 ? (
					<div className="text-center px-6 py-16 bg-white border border-dashed border-border-default rounded-lg">
						<span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-warm text-rose-500 mb-3.5">
							<CalendarX size={24} strokeWidth={1.6} />
						</span>
						<h3 className="font-serif font-medium text-xl text-graphite-900 tracking-[-0.01em] mb-1.5">
							Brak zakończonych wizyt
						</h3>
						<p className="text-sm text-graphite-600 max-w-95 mx-auto mb-4.5">
							Tutaj pojawi się historia Twoich wizyt po pierwszej zrealizowanej rezerwacji.
						</p>
						<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
							Zarezerwuj wizytę
						</Link>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-7">
							{statTiles.map((s) => (
								<StatTile key={s.label} {...s} />
							))}
						</div>

						<HistoryTimeline rows={rows} years={years} services={services} />
					</>
				)}
			</main>
		</div>
	)
}
