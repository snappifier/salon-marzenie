// src/app/admin/page.tsx
import Link from "next/link"
import {ArrowUpRight, CalendarClock, Sparkles, UserPlus} from "lucide-react"
import {auth} from "@/lib/auth"
import {Heading} from "@/components/ui/heading"
import {Eyebrow} from "@/components/ui/eyebrow"
import {buttonStyles} from "@/components/ui/button"
import {StatusBadge, type StatusVariant} from "@/components/ui/status-badge"
import {EmptyState} from "@/components/ui/empty-state"
import {StatCard} from "@/components/dashboard/stat-card"
import {Sparkline} from "@/components/dashboard/sparkline"
import {WeekHeatmap} from "@/components/dashboard/week-heatmap"
import {getAdminDashboardData, getHeatmapHours, getWeekDayLabels, getWeekDates} from "@/features/dashboard/admin-queries"
import {formatMoney} from "@/lib/money"
import {formatRelativeSlot, formatTime} from "@/lib/date"
import {cn} from "@/lib/cn"
import type {BookingStatus} from "@/generated/prisma/client"

function firstNameFromSession(name?: string | null): string {
	if (!name) return "ekipo"
	return name.trim().split(/\s+/)[0] ?? "ekipo"
}

const STATUS_TO_VARIANT: Record<BookingStatus, StatusVariant> = {
	CONFIRMED: "confirmed",
	PENDING: "pending",
	CANCELLED: "cancelled",
	COMPLETED: "completed",
	NO_SHOW: "no_show",
}

function timeAgoPl(date: Date): string {
	const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
	if (diffMin < 1) return "przed chwilą"
	if (diffMin < 60) return `${diffMin} min temu`
	const diffH = Math.floor(diffMin / 60)
	if (diffH < 24) return `${diffH} ${diffH === 1 ? "godzinę" : diffH < 5 ? "godziny" : "godzin"} temu`
	const diffD = Math.floor(diffH / 24)
	return `${diffD} ${diffD === 1 ? "dzień" : "dni"} temu`
}

interface Props {
    searchParams: Promise<{test?: string}>
}

export default async function AdminDashboardPage({searchParams}: Props) {
    const sp = await searchParams
    if (sp.test === "error") throw new Error("Test error boundary — admin/page.tsx ?test=error")

	const session = await auth()
	const firstName = firstNameFromSession(session?.user?.name)
	const data = await getAdminDashboardData()

	const hours = getHeatmapHours()
	const dayLabels = getWeekDayLabels()
	const weekDates = getWeekDates()

	const hasTodayBookings = data.today.total > 0
	const hasNewBookings = data.newBookings.length > 0
	const hasUpcoming = data.upcomingBookings.length > 0
	const heatmapHasData = data.weekHeatmap.some((row) => row.some((c) => c > 0))

	return (
		<div className="flex flex-col gap-6 md:gap-8">
			<header className="flex flex-col gap-1.5">
				<Eyebrow>Witamy z powrotem</Eyebrow>
				<Heading className="text-balance" level="h1">
					Cześć <span className="italic font-normal text-rose-600">{firstName}</span>
				</Heading>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
				<StatCard eyebrow="Dziś" title={hasTodayBookings ? "Plan na dzień" : "Spokojny dzień"}>
					{hasTodayBookings ? (
						<>
							<div className="flex items-baseline gap-3 flex-wrap">
								<span className="font-serif text-[44px] leading-none text-graphite-900 tabular-nums">
									{data.today.total}
								</span>
								<span className="text-sm text-graphite-600">
									{data.today.total === 1 ? "wizyta" : data.today.total < 5 ? "wizyty" : "wizyt"} dziś
								</span>
							</div>
							<dl className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-graphite-700">
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
									<dt className="text-graphite-500">Potwierdzone</dt>
									<dd className="font-medium tabular-nums">{data.today.byStatus.confirmed}</dd>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden="true" />
									<dt className="text-graphite-500">Oczekujące</dt>
									<dd className="font-medium tabular-nums">{data.today.byStatus.pending}</dd>
								</div>
								{data.today.byStatus.cancelled > 0 && (
									<div className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true" />
										<dt className="text-graphite-500">Anulowane</dt>
										<dd className="font-medium tabular-nums">{data.today.byStatus.cancelled}</dd>
									</div>
								)}
							</dl>
							<div className="border-t border-border-soft pt-3 flex items-center justify-between gap-3 text-sm">
								<span className="text-graphite-600">
									Jutro: <span className="font-medium text-graphite-900 tabular-nums">{data.tomorrow.total}</span>{" "}
									{data.tomorrow.total === 1 ? "wizyta" : data.tomorrow.total < 5 ? "wizyty" : "wizyt"}
								</span>
								{data.today.revenue > 0 && (
									<span className="text-graphite-600">
										Wartość: <span className="font-medium text-graphite-900 tabular-nums">{formatMoney(data.today.revenue)}</span>
									</span>
								)}
							</div>
						</>
					) : (
						<div className="-mt-2">
							<p className="text-sm text-graphite-600 text-balance mb-4">
								Wykorzystaj go na uzupełnienie kartoteki albo telefon do stałych klientek.
							</p>
							<Link className={cn(buttonStyles({size: "sm", variant: "secondary"}))} href="/admin/klienci/nowy">
								<UserPlus size={15} />
								Dodaj klientkę
							</Link>
						</div>
					)}
				</StatCard>

				<StatCard
					eyebrow="Najbliższe"
					title="Wizyty na horyzoncie"
					action={
						hasUpcoming ? (
							<Link
								className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover-supported:hover:text-rose-700 transition-[color] duration-150 ease-out"
								href="/admin/kalendarz"
							>
								<span>Cały kalendarz</span>
								<ArrowUpRight size={13} />
							</Link>
						) : undefined
					}
				>
					{hasUpcoming ? (
						<ul className="flex flex-col gap-1 -mx-1">
							{data.upcomingBookings.map((b) => (
								<li key={b.id}>
									<Link
										className={cn(
											"flex items-start gap-3 px-3 py-2.5 rounded-xl",
											"transition-[background-color] duration-150 ease-out",
											"hover-supported:hover:bg-rose-50/40 active:bg-rose-50/60",
										)}
										href={`/admin/klienci/${b.customerId}`}
									>
										<time
											className="font-serif text-[18px] leading-none text-graphite-900 tabular-nums pt-0.5 shrink-0 w-14"
											dateTime={formatTime(b.startAt)}
										>
											{formatTime(b.startAt)}
										</time>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-graphite-900 truncate">{b.customerName}</p>
											<p className="text-xs text-graphite-600 truncate mt-0.5">
												{b.serviceNames} · {b.staffName}
											</p>
											<p className="text-[11px] text-graphite-500 mt-1">{formatRelativeSlot(b.startAt)}</p>
										</div>
										<StatusBadge variant={STATUS_TO_VARIANT[b.status]} />
									</Link>
								</li>
							))}
						</ul>
					) : (
						<EmptyState
							className="border-0 bg-transparent p-0 md:p-0 text-left flex flex-row items-center gap-4"
							icon={<CalendarClock size={20} />}
							title="Brak nadchodzących wizyt"
							description="Gdy klientki będą rezerwować, pojawią się tutaj."
						/>
					)}
				</StatCard>

				<StatCard eyebrow="Ten tydzień" title="Obłożenie">
					<div className="flex items-baseline gap-3 flex-wrap">
						<span className="font-serif text-[44px] leading-none text-graphite-900 tabular-nums">
							{data.thisWeek.total}
						</span>
						<span className="text-sm text-graphite-600">
							{data.thisWeek.total === 1 ? "wizyta" : data.thisWeek.total < 5 ? "wizyty" : "wizyt"} w tygodniu
						</span>
					</div>
					{data.thisWeek.revenue > 0 && (
						<p className="text-sm text-graphite-600">
							Wartość:{" "}
							<span className="font-medium text-graphite-900 tabular-nums">
								{formatMoney(data.thisWeek.revenue)}
							</span>
						</p>
					)}
					<div className="-mx-1 mt-1">
						<Sparkline
							data={data.thisWeek.daily.map((d) => d.count)}
							aria-label="Trend wizyt w bieżącym tygodniu"
						/>
						<div className="flex justify-between px-1 mt-1.5 text-[10px] uppercase tracking-[0.14em] text-graphite-400 font-medium">
							{dayLabels.map((d) => (
								<span key={d.short}>{d.short}</span>
							))}
						</div>
					</div>
				</StatCard>

				{hasNewBookings && (
					<StatCard eyebrow="Świeże" title="Nowe rezerwacje">
						<p className="text-sm text-graphite-600 -mt-2">
							<span className="font-medium text-graphite-900 tabular-nums">{data.newBookings.length}</span>{" "}
							{data.newBookings.length === 1 ? "nowa" : data.newBookings.length < 5 ? "nowe" : "nowych"} od wczoraj
						</p>
						<ul className="flex flex-col gap-1 -mx-1">
							{data.newBookings.map((b) => (
								<li key={b.id}>
									<Link
										className={cn(
											"flex items-start gap-3 px-3 py-2.5 rounded-xl",
											"transition-[background-color] duration-150 ease-out",
											"hover-supported:hover:bg-rose-50/40 active:bg-rose-50/60",
										)}
										href={`/admin/klienci/${b.customerId}`}
									>
										<span
											className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-50 text-rose-600 shrink-0"
											aria-hidden="true"
										>
											<Sparkles size={14} />
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-graphite-900 truncate">{b.customerName}</p>
											<p className="text-xs text-graphite-600 truncate mt-0.5">{b.serviceNames}</p>
										</div>
										<span className="text-[11px] text-graphite-400 whitespace-nowrap pt-1">
											{timeAgoPl(b.createdAt)}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</StatCard>
				)}
			</div>

			<StatCard
				eyebrow="Tydzień w skali ciepła"
				title="Heatmap obłożenia"
				action={
					<Link
						className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover-supported:hover:text-rose-700 transition-[color] duration-150 ease-out"
						href="/admin/kalendarz"
					>
						<span>Przejdź do kalendarza</span>
						<ArrowUpRight size={13} />
					</Link>
				}
			>
				{heatmapHasData ? (
					<>
						<WeekHeatmap heatmap={data.weekHeatmap} hours={hours} dayLabels={dayLabels} weekDates={weekDates} />
						<div className="flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.14em] text-graphite-500 font-medium mt-1">
							<span>Mniej</span>
							<div className="flex gap-1">
								{[0.18, 0.4, 0.6, 0.8, 1].map((op) => (
									<span
										key={op}
										className="w-3 h-3 rounded-sm bg-rose-500"
										style={{opacity: op}}
										aria-hidden="true"
									/>
								))}
							</div>
							<span>Więcej</span>
						</div>
					</>
				) : (
					<p className="text-sm text-graphite-500 italic text-center py-6">
						W tym tygodniu nie ma jeszcze wizyt do pokazania.
					</p>
				)}
			</StatCard>
		</div>
	)
}
