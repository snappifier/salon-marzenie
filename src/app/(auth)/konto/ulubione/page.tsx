import Link from "next/link"
import {redirect} from "next/navigation"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {Calendar, Clock, Heart, Plus, RotateCcw, Search, Star} from "lucide-react"
import {auth} from "@/lib/auth"
import {cn} from "@/lib/cn"
import {SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {buttonStyles} from "@/components/ui/button"
import {Eyebrow} from "@/components/ui/eyebrow"
import {getCustomerFavorites} from "@/features/dashboard/favorites-queries"
import type {FavoriteService, RecommendedService} from "@/features/dashboard/favorites-queries"
import {Sidebar} from "@/app/(auth)/konto/_components/sidebar"

const FAV_GRADIENTS = [
	"from-[#E8D5B7] to-[#C99A4F]",
	"from-[#B7C9C0] to-success",
	"from-rose-200 to-[#B89B8E]",
	"from-rose-100 to-rose-300",
	"from-[#D4C5E0] to-[#9B82A8]",
	"from-[#E5C8A8] to-[#B8956C]",
	"from-rose-300 to-rose-500",
]

const REC_GRADIENTS = [
	"from-rose-200 to-rose-500",
	"from-[#D4C5E0] to-[#9B82A8]",
	"from-[#B7C9C0] to-success",
	"from-[#E5C8A8] to-[#B8956C]",
]

function fmtDuration(totalMin: number): string {
	const h = Math.floor(totalMin / 60)
	const m = totalMin % 60
	if (h === 0) return `${m} min`
	if (m === 0) return `${h}h`
	return `${h}h ${m} min`
}

function razyLabel(count: number): string {
	return count === 1 ? "raz" : "razy"
}

function lastLabel(date: Date | null): string {
	if (!date) return "Jeszcze nie próbowane"
	return `Ostatnio: ${formatInTimeZone(date, SALON_TIMEZONE, "d LLL yyyy", {locale: pl})}`
}

interface FavoriteCard {
	gradient: string
	category: string
	title: string
	desc: string
	price: string
	duration: string
	last: string
	count?: string
}

function toCard(f: FavoriteService, index: number): FavoriteCard {
	return {
		gradient: FAV_GRADIENTS[index % FAV_GRADIENTS.length],
		category: f.category,
		title: f.name,
		desc: f.description ?? "Twój sprawdzony wybór — zarezerwuj ponownie w kilka kliknięć.",
		price: formatMoney(f.priceGr),
		duration: fmtDuration(f.durationMin),
		last: lastLabel(f.lastVisit),
		count: `${f.count} ${razyLabel(f.count)}`,
	}
}

interface Recommendation {
	gradient: string
	category: string
	title: string
	meta: string
}

function toRec(r: RecommendedService, index: number): Recommendation {
	return {
		gradient: REC_GRADIENTS[index % REC_GRADIENTS.length],
		category: r.category,
		title: r.name,
		meta: `${formatMoney(r.priceGr)} · ${fmtDuration(r.durationMin)}`,
	}
}

function FavoriteCardView({card}: {card: FavoriteCard}) {
	return (
		<article
			className={cn(
				"bg-white border border-border-soft rounded-lg overflow-hidden relative flex flex-col",
				"transition-[border-color,box-shadow,transform] duration-200 ease-out",
				"hover-supported:hover:border-rose-200 hover-supported:hover:shadow-md hover-supported:hover:-translate-y-0.5",
			)}
		>
			<div className={cn("relative overflow-hidden aspect-16/10 bg-linear-to-br", card.gradient)}>
				<span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_25%,rgba(255,255,255,0.25)_0%,transparent_55%)]" />
				{card.count && (
					<span className="absolute bottom-3 left-3 z-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-graphite-900/80 backdrop-blur-sm">
						<RotateCcw size={11} strokeWidth={2} />
						{card.count}
					</span>
				)}
			</div>

			<div className="px-5.5 pt-4.5 pb-5.5 flex flex-col flex-1">
				<div className="text-[10px] uppercase tracking-[0.16em] text-rose-600 font-medium mb-1.5">
					{card.category}
				</div>
				<h3 className="font-serif font-medium text-lg text-graphite-900 tracking-[-0.01em] leading-tight mb-1.5">
					{card.title}
				</h3>
				<p className="text-[13px] text-graphite-600 leading-[1.55] mb-4 flex-1">{card.desc}</p>

				<div className="flex gap-4.5 pt-3.5 border-t border-border-soft mb-3.5">
					<div className="flex-1">
						<div className="text-[10px] uppercase tracking-[0.12em] text-graphite-400 font-medium mb-0.5">
							Cena
						</div>
						<div className="font-serif font-medium text-sm text-graphite-900 tracking-[-0.01em]">
							{card.price}
						</div>
					</div>
					<div className="flex-1">
						<div className="text-[10px] uppercase tracking-[0.12em] text-graphite-400 font-medium mb-0.5">
							Czas
						</div>
						<div className="font-serif font-medium text-sm text-graphite-900 tracking-[-0.01em]">
							{card.duration}
						</div>
					</div>
				</div>

				<div className="text-[11px] text-graphite-400 mb-3.5 pb-3.5 border-b border-border-soft flex items-center gap-1.5">
					<Clock size={12} strokeWidth={1.8} className="text-graphite-400" />
					{card.last}
				</div>

				<div className="flex gap-2">
					<Link href="/rezerwacja" className={buttonStyles({size: "sm", className: "flex-1"})}>
						Zarezerwuj
					</Link>
					<Link
						href="/uslugi"
						className={buttonStyles({variant: "secondary", size: "sm", className: "flex-1"})}
					>
						Szczegóły
					</Link>
				</div>
			</div>
		</article>
	)
}

function RecommendationCard({rec}: {rec: Recommendation}) {
	return (
		<Link
			href="/uslugi"
			className={cn(
				"bg-white border border-border-soft rounded-lg px-5.5 py-4.5 grid grid-cols-[56px_1fr] gap-4 items-center",
				"transition-[border-color,box-shadow] duration-150 ease-out",
				"hover-supported:hover:border-rose-200 hover-supported:hover:shadow-sm",
			)}
		>
			<div className={cn("w-14 h-14 rounded-md bg-linear-to-br", rec.gradient)} />
			<div className="min-w-0">
				<div className="text-[10px] uppercase tracking-[0.14em] text-rose-600 font-medium mb-0.5">
					{rec.category}
				</div>
				<div className="font-serif font-medium text-[15px] text-graphite-900 tracking-[-0.01em] mb-0.5">
					{rec.title}
				</div>
				<div className="text-xs text-graphite-400">{rec.meta}</div>
			</div>
		</Link>
	)
}

function HeroMeta({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="flex flex-col gap-0.5">
			<div className="text-[10px] uppercase tracking-[0.14em] text-graphite-400 font-medium">{label}</div>
			<div className="font-serif font-medium text-[17px] text-graphite-900 tracking-[-0.01em]">
				{value}
			</div>
		</div>
	)
}

function HeroTitle({name}: {name: string}) {
	const parts = name.trim().split(" ")
	if (parts.length === 1) {
		return <em className="italic text-rose-600 font-normal">{name}</em>
	}
	const head = parts.slice(0, -1).join(" ")
	const tail = parts[parts.length - 1]
	return (
		<>
			{head} <em className="italic text-rose-600 font-normal">{tail}</em>
		</>
	)
}

export default async function FavoritesPage() {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		redirect("/logowanie")
	}

	const data = await getCustomerFavorites(session.user.id)
	if (!data) {
		redirect("/logowanie")
	}

	const {customer, upcomingCount, favoritesCount, hero, others, recommendations} = data
	const favNoun = favoritesCount === 1 ? "zabieg" : "zabiegów"

	return (
		<div className="min-h-screen relative bg-white">
			<Sidebar
				firstName={customer.firstName}
				lastName={customer.lastName}
				upcomingCount={upcomingCount}
				favoritesCount={favoritesCount}
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
							Ulubione <em className="italic text-rose-600 font-normal">zabiegi</em>
						</h1>
					</div>
					<div className="flex gap-2.5 items-center">
						<Link href="/uslugi" className={buttonStyles({variant: "secondary", size: "sm"})}>
							<Search size={14} strokeWidth={1.8} />
							Przeglądaj wszystkie zabiegi
						</Link>
						<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
							<Plus size={14} strokeWidth={2.2} />
							Nowa rezerwacja
						</Link>
					</div>
				</header>

				{hero ? (
					<>
						{/* HERO - most-booked treatment */}
						<div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] bg-white border border-border-soft rounded-lg overflow-hidden mb-8">
							<div className="relative overflow-hidden aspect-4/3 lg:aspect-auto bg-linear-to-br from-rose-200 via-rose-400 to-rose-600">
								<span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
								<div className="absolute bottom-5 left-6 z-2 font-serif italic text-sm text-white/85 tracking-[0.02em]">
									Twój wybór #1
								</div>
							</div>

							<div className="p-8 lg:px-9 flex flex-col justify-center">
								<div className="inline-flex items-center gap-1.5 self-start px-3 py-1 bg-warm rounded-full text-[11px] font-medium text-rose-700 uppercase tracking-[0.14em] mb-3.5">
									<Star size={11} className="text-rose-500" fill="currentColor" strokeWidth={0} />
									Najczęściej wybierany
								</div>
								<h2 className="font-serif font-medium text-[clamp(28px,3.5vw,36px)] leading-[1.1] tracking-tight text-graphite-900 mb-2.5">
									<HeroTitle name={hero.name} />
								</h2>
								<p className="text-sm text-graphite-600 leading-[1.6] mb-5.5 max-w-125">
									{hero.description ??
										"Twój najczęściej wybierany zabieg — zarezerwuj ponownie w kilka kliknięć."}
								</p>

								<div className="flex flex-wrap gap-6 py-4.5 border-t border-b border-border-soft mb-5.5">
									<HeroMeta label="Cena" value={formatMoney(hero.priceGr)} />
									<HeroMeta label="Czas" value={fmtDuration(hero.durationMin)} />
									<HeroMeta
										label="Zarezerwowane"
										value={
											<>
												{hero.count}{" "}
												<em className="italic text-rose-500 font-normal text-[13px]">
													{razyLabel(hero.count)}
												</em>
											</>
										}
									/>
									<HeroMeta
										label="Ostatnia wizyta"
										value={
											hero.lastVisit
												? formatInTimeZone(hero.lastVisit, SALON_TIMEZONE, "d LLL", {locale: pl})
												: "—"
										}
									/>
								</div>

								<div className="flex flex-wrap gap-2.5">
									<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
										<Calendar size={14} strokeWidth={2} />
										Zarezerwuj ponownie
									</Link>
									<Link href="/uslugi" className={buttonStyles({variant: "secondary", size: "md"})}>
										Zobacz szczegóły
									</Link>
								</div>
							</div>
						</div>

						{/* ALL FAVORITES */}
						{others.length > 0 && (
							<>
								<div className="flex items-baseline justify-between gap-3 flex-wrap mt-9 mb-5 pb-3 border-b border-border-soft">
									<h2 className="font-serif font-medium text-[22px] text-graphite-900 tracking-[-0.02em]">
										Wszystkie <em className="italic text-rose-600 font-normal">ulubione</em>
									</h2>
									<span className="text-xs text-graphite-400">
										{favoritesCount} {favNoun} · posortowane wg częstotliwości
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
									{others.map((f, i) => (
										<FavoriteCardView key={f.id} card={toCard(f, i)} />
									))}
								</div>
							</>
						)}
					</>
				) : (
					<div className="text-center px-6 py-16 bg-white border border-dashed border-border-default rounded-lg mb-8">
						<span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-warm text-rose-500 mb-3.5">
							<Heart size={24} strokeWidth={1.6} />
						</span>
						<h3 className="font-serif font-medium text-xl text-graphite-900 tracking-[-0.01em] mb-1.5">
							Brak ulubionych zabiegów
						</h3>
						<p className="text-sm text-graphite-600 max-w-95 mx-auto mb-4.5">
							Twoje ulubione zabiegi pojawią się tutaj na podstawie historii wizyt. Zarezerwuj
							pierwszy zabieg, a my zapamiętamy Twoje wybory.
						</p>
						<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
							Zarezerwuj wizytę
						</Link>
					</div>
				)}

				{/* RECOMMENDED */}
				{recommendations.length > 0 && (
					<>
						<div className="flex items-baseline justify-between gap-3 flex-wrap mt-9 mb-5 pb-3 border-b border-border-soft">
							<h2 className="font-serif font-medium text-[22px] text-graphite-900 tracking-[-0.02em]">
								Może się <em className="italic text-rose-600 font-normal">spodoba</em>
							</h2>
							<span className="text-xs text-graphite-400">Na podstawie Twoich wizyt</span>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							{recommendations.map((r, i) => (
								<RecommendationCard key={r.id} rec={toRec(r, i)} />
							))}
						</div>
					</>
				)}
			</main>
		</div>
	)
}
