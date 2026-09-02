import {redirect} from "next/navigation"
import {auth} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {cn} from "@/lib/cn"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Sidebar} from "@/app/(auth)/konto/_components/sidebar"
import {NotificationsSettings} from "@/app/(auth)/konto/powiadomienia/_components/notifications-settings"

export default async function NotificationsPage() {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		redirect("/logowanie")
	}

	const [customer, upcomingCount] = await Promise.all([
		prisma.customer.findUnique({
			where: {id: session.user.id},
			select: {firstName: true, lastName: true},
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
				<header className="mb-7">
					<Eyebrow className="block mb-1.5">Konto</Eyebrow>
					<h1 className="font-display font-normal text-[clamp(26px,3.6vw,36px)] leading-[1.15] tracking-tight text-primary">
						Powiadomienia
					</h1>
					<p className="text-sm text-secondary mt-2 max-w-[560px]">
						Zdecyduj, o czym i w jaki sposób chcesz być informowana. Powiadomienia o wizytach
						pomagają nie przegapić terminu.
					</p>
				</header>

				<div className="max-w-[820px]">
					<NotificationsSettings />
				</div>
			</main>
		</div>
	)
}
