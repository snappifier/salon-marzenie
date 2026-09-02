// src/app/(public)/rezerwacja/page.tsx
import {prisma} from "@/lib/prisma"
import {getSessionSafe} from "@/lib/auth"
import {getActiveServicesGrouped, getAllStaffByService} from "@/features/booking/public-queries"
import {Wizard} from "@/components/booking-wizard/wizard"
import {Container} from "@/components/ui/container"
import {PageHeading} from "@/components/public/page-heading"

export const metadata = {
	title: "Rezerwacja wizyty",
	description: "Umów wizytę online w studiu Marzenie - wybierz zabieg, pracownika i pasujący termin.",
}

type Props = {
	searchParams: Promise<{service?: string | string[]}>
}

export default async function ReservationPage({searchParams}: Props) {
	const sp = await searchParams
	const session = await getSessionSafe()
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
		<Container size="narrow" className="pt-[50px] pb-[clamp(48px,7vw,80px)]">
			<PageHeading
				eyebrow="Rezerwacja"
				title={<>Umów <em className="italic text-interactive">swoją wizytę</em></>}
				description={
					isLoggedIn
						? `Witaj z powrotem${loggedInCustomer ? ", " + loggedInCustomer.firstName : ""}. Twoje dane są już uzupełnione — wybierz zabiegi i termin.`
						: "Wybierz zabiegi, pasującego pracownika i termin. Potwierdzenie dostaniesz SMS-em."
				}
			/>
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
