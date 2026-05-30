import Link from "next/link"
import {redirect} from "next/navigation"
import {Plus} from "lucide-react"
import {auth} from "@/lib/auth"
import {cn} from "@/lib/cn"
import {buttonStyles} from "@/components/ui/button"
import {Eyebrow} from "@/components/ui/eyebrow"
import {getDashboardData} from "@/features/dashboard/queries"
import {Sidebar} from "@/app/(auth)/konto/_components/sidebar"
import {NextVisitCard} from "@/app/(auth)/konto/_components/next-visit-card"
import {StatsRow} from "@/app/(auth)/konto/_components/stats-row"
import {HistoryCard} from "@/app/(auth)/konto/_components/history-card"
import {FavoritesCard} from "@/app/(auth)/konto/_components/favorites-card"
import {PreferencesCard} from "@/app/(auth)/konto/_components/preferences-card"

export default async function DashboardPage() {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		redirect("/logowanie")
	}

	const data = await getDashboardData(session.user.id)
	if (!data) {
		redirect("/logowanie")
	}

	const upcomingCount = data.nextBooking ? 1 : 0

	return (
		<div className="min-h-screen relative bg-white">
			<Sidebar
				firstName={data.customer.firstName}
				lastName={data.customer.lastName}
				upcomingCount={upcomingCount}
			/>

			<main
				className={cn(
					"pt-22 md:pt-8 md:py-8 lg:py-10 pb-14",
					"px-5 md:px-8 lg:px-12",
					"md:ml-65",
				)}
			>
				<header className="flex items-end justify-between flex-wrap gap-4 mb-8">
					<div>
						<Eyebrow className="block mb-1.5">Pulpit</Eyebrow>
						<h1 className="font-serif font-medium text-[clamp(26px,3.6vw,36px)] leading-[1.15] tracking-tight text-graphite-900">
							Cześć {data.customer.firstName},{" "}
							<em className="italic text-rose-600 font-normal">miło Cię widzieć.</em>
						</h1>
					</div>
					<div className="flex gap-2.5 items-center">
						<Link href="/rezerwacja" className={buttonStyles({size: "md"})}>
							<Plus size={14} strokeWidth={2.2} />
							Nowa rezerwacja
						</Link>
					</div>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-7">
					<div className="flex flex-col gap-6">
						<NextVisitCard booking={data.nextBooking} />
						<StatsRow stats={data.stats} />
						<HistoryCard bookings={data.recentBookings} />
					</div>

					<div className="flex flex-col gap-6">
						<FavoritesCard favorites={data.favorites} />
						<PreferencesCard customer={data.customer} />
					</div>
				</div>
			</main>
		</div>
	)
}
