import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"
import {getActiveServicesGrouped, getAllStaffByService} from "@/features/booking/public-queries"
import {Wizard} from "@/components/booking-wizard/wizard"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"

export const metadata = {
	title: "Rezerwacja wizyty",
	description: "Umów wizytę online w studiu Marzenie - wybierz zabieg, pracownika i pasujący termin.",
}

type Props = {
	searchParams: Promise<{service?: string | string[]}>
}

export default async function ReservationPage({searchParams}: Props) {
	const sp = await searchParams
	const session = await auth()
	const isLoggedIn = session?.user?.role === "customer"

	const [groupedServices, staffNames, allStaffByService, loggedInCustomer] = await Promise.all([
		getActiveServicesGrouped(),
		prisma.staff.findMany({
			where: {active: true},
			select: {id: true, firstName: true, lastName: true},
		}),
		getAllStaffByService(),
		isLoggedIn && session?.user?.id
			? prisma.customer.findUnique({
				where: {id: session.user.id},
				select: {firstName: true, lastName: true, phone: true, email: true, marketingConsent: true},
			})
			: Promise.resolve(null),
	])

	const validIds = new Set(groupedServices.flatMap((g) => g.services.map((s) => s.id)))
	const requested = Array.isArray(sp.service) ? sp.service : sp.service ? [sp.service] : []
	const initialServiceIds = requested.filter((id) => validIds.has(id))

	const prefilledCustomer = loggedInCustomer
		? {
			firstName: loggedInCustomer.firstName,
			lastName: loggedInCustomer.lastName,
			phone: loggedInCustomer.phone,
			email: loggedInCustomer.email ?? "",
			marketingConsent: loggedInCustomer.marketingConsent,
		}
		: undefined

	return (
		<Container size="narrow" className="py-12 md:py-16">
			<div className="mb-8 md:mb-10">
				<Eyebrow className="mb-3">Rezerwacja</Eyebrow>
				<Heading level="h1" className="mb-3">
					Umów <span className="italic font-normal text-rose-600">swoją wizytę</span>
				</Heading>
				<p className="text-base text-graphite-600 leading-relaxed max-w-[520px]">
					{isLoggedIn
						? `Witaj z powrotem${loggedInCustomer ? ", " + loggedInCustomer.firstName : ""}. Twoje dane są już uzupełnione — wybierz zabiegi i termin.`
						: "Wybierz zabiegi, pasującego pracownika i termin. Potwierdzenie dostaniesz SMS-em."}
				</p>
			</div>
			<Wizard
				groupedServices={groupedServices}
				staffNames={staffNames}
				allStaffByService={allStaffByService}
				initialServiceIds={initialServiceIds}
				prefilledCustomer={prefilledCustomer}
				isLoggedIn={isLoggedIn}
			/>
		</Container>
	)
}
