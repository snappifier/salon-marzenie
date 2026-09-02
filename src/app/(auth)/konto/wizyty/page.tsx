import Link from "next/link"
import {redirect} from "next/navigation"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {CalendarX, Plus} from "lucide-react"
import {auth} from "@/lib/auth"
import {cn} from "@/lib/cn"
import {SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {buttonStyles} from "@/components/ui/button"
import {Eyebrow} from "@/components/ui/eyebrow"
import {getCustomerVisits} from "@/features/dashboard/visits-queries"
import type {CustomerVisitSummary} from "@/features/dashboard/visits-queries"
import {Sidebar} from "@/app/(auth)/konto/_components/sidebar"
import {VisitTabs} from "@/app/(auth)/konto/wizyty/_components/visit-tabs"
import {VisitCard, type VisitCardData} from "@/app/(auth)/konto/wizyty/_components/visit-card"
import {CalendarStrip} from "@/app/(auth)/konto/wizyty/_components/calendar-strip"
import {FeaturedVisit} from "@/app/(auth)/konto/wizyty/_components/featured-visit"

function fmtDay(d: Date): string {
	return formatInTimeZone(d, SALON_TIMEZONE, "dd")
}

function fmtMonth(d: Date): string {
	const m = formatInTimeZone(d, SALON_TIMEZONE, "LLL", {locale: pl})
	return m.charAt(0).toUpperCase() + m.slice(1)
}

function fmtTime(d: Date): string {
	return formatInTimeZone(d, SALON_TIMEZONE, "HH:mm")
}

function fmtDuration(totalMin: number): string {
	const h = Math.floor(totalMin / 60)
	const m = totalMin % 60
	if (h === 0) return `${m} min`
	if (m === 0) return `${h}h`
	return `${h}h ${m} min`
}

const cancelledByLabel: Record<string, string> = {
	CUSTOMER: "Przez klientkę",
	ADMIN: "Przez studio",
	SYSTEM: "Automatycznie",
}

function upcomingToCard(v: CustomerVisitSummary): VisitCardData {
	return {
		day: fmtDay(v.startAt),
		month: fmtMonth(v.startAt),
		time: fmtTime(v.startAt),
		title: v.title,
		metaItems: [formatMoney(v.totalPriceGr), `ok. ${fmtDuration(v.totalDurationMin)}`, v.staffName].filter(
			Boolean,
		),
		status: {label: "potwierdzona", tone: "confirmed"},
		state: "confirmed",
		actionLabel: "Szczegóły",
		actionHref: `/moja-wizyta/${v.manageToken}`,
	}
}

function pendingToCard(v: CustomerVisitSummary): VisitCardData {
	return {
		day: fmtDay(v.startAt),
		month: fmtMonth(v.startAt),
		time: fmtTime(v.startAt),
		title: v.title,
		metaItems: [formatMoney(v.totalPriceGr), v.staffName].filter(Boolean),
		status: {label: "do potwierdzenia", tone: "pending"},
		state: "pending",
		actionLabel: "Szczegóły",
		actionHref: `/moja-wizyta/${v.manageToken}`,
	}
}

function pastToCard(v: CustomerVisitSummary): VisitCardData {
	return {
		day: fmtDay(v.startAt),
		month: fmtMonth(v.startAt),
		time: fmtTime(v.startAt),
		title: v.title,
		metaItems: [formatMoney(v.totalPriceGr), v.staffName].filter(Boolean),
		status: {label: "opłacone", tone: "completed"},
		state: "past",
		actionLabel: "Powtórz",
		actionHref: "/rezerwacja",
	}
}

function cancelledToCard(v: CustomerVisitSummary): VisitCardData {
	const when = v.cancelledAt
		? `Anulowana ${formatInTimeZone(v.cancelledAt, SALON_TIMEZONE, "d LLL", {locale: pl})}`
		: "Anulowana"
	const by = v.cancelledBy ? cancelledByLabel[v.cancelledBy] : null
	return {
		day: fmtDay(v.startAt),
		month: fmtMonth(v.startAt),
		time: fmtTime(v.startAt),
		title: v.title,
		metaItems: [when, by].filter((x): x is string => Boolean(x)),
		status: {label: "anulowana", tone: "cancelled"},
		state: "cancelled",
		actionLabel: "Zarezerwuj ponownie",
		actionHref: "/rezerwacja",
	}
}

function EmptyState({title, hint}: {title: string; hint: string}) {
	return (
		<div className="text-center px-6 py-14 bg-surface border border-dashed border-border-subtle rounded-lg">
			<span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-paper-300 text-interactive mb-3.5">
				<CalendarX size={24} strokeWidth={1.6} />
			</span>
			<h3 className="font-display font-medium text-xl text-primary tracking-[-0.01em] mb-1.5">
				{title}
			</h3>
			<p className="text-sm text-secondary max-w-95 mx-auto mb-4.5">{hint}</p>
			<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
				Zarezerwuj wizytę
			</Link>
		</div>
	)
}

function SectionLabel({title, em, count}: {title: string; em: string; count: React.ReactNode}) {
	return (
		<div className="flex items-baseline gap-3 mt-8 mb-4 pb-2.5 border-b border-border-subtle first:mt-0">
			<h2 className="font-display font-medium text-lg text-primary tracking-[-0.01em]">
				{title} <em className="italic text-interactive font-normal">{em}</em>
			</h2>
			<span className="text-xs text-secondary">{count}</span>
		</div>
	)
}

function VisitList({visits}: {visits: VisitCardData[]}) {
	return (
		<div className="flex flex-col gap-3">
			{visits.map((v, i) => (
				<VisitCard key={i} {...v} />
			))}
		</div>
	)
}

export default async function MyVisitsPage() {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		redirect("/logowanie")
	}

	const data = await getCustomerVisits(session.user.id)
	if (!data) {
		redirect("/logowanie")
	}

	const {customer, upcoming, pending, past, cancelled, counts, calendar} = data

	const tabs = [
		{key: "upcoming", label: "Najbliższe", count: counts.upcoming},
		{key: "pending", label: "Oczekujące", count: counts.pending},
		{key: "past", label: "Przeszłe", count: counts.past},
		{key: "cancelled", label: "Anulowane", count: counts.cancelled},
	]

	const pastVisibleLabel =
		past.total > past.items.length
			? `pokazuję ${past.items.length} z ${past.total}`
			: `${past.total} ${past.total === 1 ? "wizyta" : "wizyt"}`

	const panels: Record<string, React.ReactNode> = {
		upcoming: (
			<div>
				<CalendarStrip todayIso={calendar.todayIso} visitDays={calendar.visitDays} />
				{upcoming.featured ? (
					<>
						<FeaturedVisit visit={upcoming.featured} />
						{upcoming.others.length > 0 && (
							<>
								<SectionLabel
									title="Pozostałe"
									em="nadchodzące"
									count={`${upcoming.others.length} ${upcoming.others.length === 1 ? "wizyta" : "wizyty"}`}
								/>
								<VisitList visits={upcoming.others.map(upcomingToCard)} />
							</>
						)}
					</>
				) : (
					<EmptyState
						title="Brak nadchodzących wizyt"
						hint="Nie masz teraz zaplanowanej żadnej wizyty. Sprawdź dostępne terminy i zarezerwuj swój ulubiony zabieg."
					/>
				)}
			</div>
		),
		pending: (
			<div>
				{pending.length > 0 ? (
					<>
						<SectionLabel
							title="Oczekujące"
							em="potwierdzenia"
							count={`${pending.length} ${pending.length === 1 ? "wizyta" : "wizyty"} · czekasz na kontakt ze studia`}
						/>
						<VisitList visits={pending.map(pendingToCard)} />
					</>
				) : (
					<EmptyState
						title="Brak oczekujących wizyt"
						hint="Tu pojawią się rezerwacje, które czekają na potwierdzenie ze strony studia."
					/>
				)}
			</div>
		),
		past: (
			<div>
				{past.items.length > 0 ? (
					<>
						<SectionLabel
							title="Ostatnie"
							em="wizyty"
							count={
								<>
									{pastVisibleLabel} ·{" "}
									<Link href="/konto/historia" className="text-interactive font-medium">
										zobacz pełną historię →
									</Link>
								</>
							}
						/>
						<VisitList visits={past.items.map(pastToCard)} />
					</>
				) : (
					<EmptyState
						title="Brak zakończonych wizyt"
						hint="Historia Twoich wizyt pojawi się tutaj po pierwszej zrealizowanej wizycie."
					/>
				)}
			</div>
		),
		cancelled: (
			<div>
				{cancelled.length > 0 ? (
					<>
						<SectionLabel
							title="Anulowane"
							em="wizyty"
							count={`${cancelled.length} ${cancelled.length === 1 ? "wizyta" : "wizyty"}`}
						/>
						<VisitList visits={cancelled.map(cancelledToCard)} />
					</>
				) : (
					<EmptyState
						title="Brak anulowanych wizyt"
						hint="Dobrze! Nie masz żadnych anulowanych rezerwacji."
					/>
				)}
			</div>
		),
	}

	return (
		<div className="min-h-screen relative bg-surface">
			<Sidebar
				firstName={customer.firstName}
				lastName={customer.lastName}
				upcomingCount={counts.upcoming}
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
						<h1 className="font-display font-normal text-[clamp(26px,3.6vw,36px)] leading-[1.15] tracking-tight text-primary">
							Moje <em className="italic text-interactive font-normal">wizyty</em>
						</h1>
					</div>
					<div className="flex gap-2.5 items-center">
						<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
							<Plus size={14} strokeWidth={2.2} />
							Nowa rezerwacja
						</Link>
					</div>
				</header>

				<VisitTabs tabs={tabs} panels={panels} />
			</main>
		</div>
	)
}
