import {redirect} from "next/navigation"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {Download} from "lucide-react"
import {auth} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {cn} from "@/lib/cn"
import {SALON_TIMEZONE} from "@/lib/date"
import {buttonStyles} from "@/components/ui/button"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Sidebar} from "@/app/(auth)/konto/_components/sidebar"
import {ProfileToc} from "@/app/(auth)/konto/dane-osobowe/_components/profile-toc"
import {PersonalDataForm} from "@/app/(auth)/konto/dane-osobowe/_components/personal-data-form"
import {Card} from "@/app/(auth)/konto/dane-osobowe/_components/ui"

function GdprRow({
	title,
	desc,
	action,
}: {
	title: string
	desc: string
	action: React.ReactNode
}) {
	return (
		<div className="grid grid-cols-[1fr_auto] gap-4 py-4 border-b border-border-subtle last:border-b-0 items-center">
			<div className="min-w-0">
				<h4 className="font-medium text-sm text-primary mb-0.5">{title}</h4>
				<p className="text-xs text-secondary leading-relaxed max-w-[540px]">{desc}</p>
			</div>
			<div className="shrink-0">{action}</div>
		</div>
	)
}

export default async function PersonalDataPage() {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		redirect("/logowanie")
	}

	const [customer, upcomingCount] = await Promise.all([
		prisma.customer.findUnique({
			where: {id: session.user.id},
			select: {firstName: true, lastName: true, email: true, phone: true, createdAt: true},
		}),
		prisma.booking.count({
			where: {
				customerId: session.user.id,
				status: "CONFIRMED",
				items: {some: {startAt: {gte: new Date()}}},
			},
		}),
	])

	if (!customer) {
		redirect("/logowanie")
	}

	const since = formatInTimeZone(customer.createdAt, SALON_TIMEZONE, "MMMM yyyy", {locale: pl})
	const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()

	const dangerOutlineClass = cn(
		"inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-full border border-border-subtle text-error bg-transparent",
		"transition-[background-color,color,border-color] duration-150 ease-out",
		"hover-supported:hover:bg-error hover-supported:hover:text-white hover-supported:hover:border-error",
		"active:scale-[0.97]",
	)

	return (
		<div className="min-h-screen relative bg-surface">
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
						<Eyebrow className="block mb-1.5">Konto</Eyebrow>
						<h1 className="font-display font-normal text-[clamp(26px,3.6vw,36px)] leading-[1.15] tracking-tight text-primary">
							Dane <em className="italic text-interactive font-normal">osobowe</em>
						</h1>
					</div>
					<button type="button" className={buttonStyles({variant: "secondary", size: "sm"})}>
						<Download size={14} strokeWidth={1.8} />
						Pobierz moje dane
					</button>
				</header>

				{/* PROFILE HERO */}
				<div className="bg-linear-to-b from-surface-muted to-surface border border-accent-100 rounded-lg px-8 py-7 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-7 items-center mb-6">
					<div className="w-20 h-20 rounded-full bg-linear-to-br from-accent-100 to-interactive text-white flex items-center justify-center font-display font-medium text-[30px] tracking-[-0.01em] shadow-sm">
						{initials}
					</div>
					<div className="min-w-0">
						<div className="font-display font-medium text-[26px] text-primary tracking-[-0.02em] mb-1 leading-[1.15]">
							{customer.firstName} <em className="italic text-interactive font-normal">{customer.lastName}</em>
						</div>
						<div className="text-[13px] text-secondary flex items-center flex-wrap gap-2">
							{customer.email && (
								<>
									<span>{customer.email}</span>
									<span className="text-secondary/50">·</span>
								</>
							)}
							<span>{customer.phone}</span>
							<span className="text-secondary/50">·</span>
							<span>Stała klientka</span>
						</div>
					</div>
					<div className="text-right">
						<div className="text-[11px] uppercase text-interactive tracking-[0.18em] font-medium">
							Klientka od
						</div>
						<div className="font-display text-[15px] text-primary font-medium mt-0.5">
							{since}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 lg:gap-9 lg:items-start">
					<ProfileToc />

					<div>
						<PersonalDataForm
							initial={{
								firstName: customer.firstName,
								lastName: customer.lastName,
								email: customer.email ?? "",
								phone: customer.phone,
							}}
						/>

						{/* GDPR */}
						<Card
							id="gdpr"
							title="RODO"
							em="i prywatność"
							desc="Twoje prawa względem danych osobowych zgodnie z rozporządzeniem RODO."
						>
							<GdprRow
								title="Pobierz kopię moich danych"
								desc="Otrzymasz ZIP z kartą klientki, listą wizyt i wszystkim, co przechowujemy. Wyślemy na Twój adres email w ciągu 48h."
								action={
									<button type="button" className={buttonStyles({variant: "secondary", size: "sm"})}>
										Pobierz dane
									</button>
								}
							/>
							<GdprRow
								title="Zgoda na marketing"
								desc="Wycofanie zgody na informacje o promocjach i nowych zabiegach. Nie wpływa na powiadomienia o Twoich wizytach."
								action={
									<button type="button" className={buttonStyles({variant: "secondary", size: "sm"})}>
										Wycofaj zgodę
									</button>
								}
							/>
							<GdprRow
								title="Polityka prywatności"
								desc="Aktualna wersja — opisuje, jak przetwarzamy Twoje dane."
								action={
									<button type="button" className={buttonStyles({variant: "ghost", size: "sm"})}>
										Zobacz dokument →
									</button>
								}
							/>
						</Card>

						{/* DANGER */}
						<section className="bg-surface border border-error/25 rounded-lg p-7">
							<h3 className="font-display font-medium text-[17px] text-error mb-1 tracking-[-0.01em]">
								Usuń konto
							</h3>
							<p className="text-[13px] text-secondary mb-3.5 max-w-[500px]">
								Po usunięciu utracisz dostęp do historii wizyt, ulubionych zabiegów i zapisanych
								preferencji. Operacja jest nieodwracalna. Niektóre dane (faktury) możemy zachować
								przez 5 lat zgodnie z przepisami podatkowymi.
							</p>
							<button type="button" className={dangerOutlineClass}>
								Usuń konto na zawsze
							</button>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}
