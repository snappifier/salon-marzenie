// src/app/admin/klienci/[id]/page.tsx
import {notFound} from "next/navigation"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {StatusBadge} from "@/components/ui/status-badge"
import {CustomerDetailTabs} from "@/components/customers/customer-detail-tabs"
import {getCustomerById, getCustomerBookings} from "@/features/customers/queries"

type Props = {
	params: Promise<{id: string}>
	searchParams: Promise<{tab?: string}>
}

export default async function CustomerDetailPage({params, searchParams}: Props) {
	const [{id}, {tab}] = await Promise.all([params, searchParams])
	const [customer, bookings] = await Promise.all([
		getCustomerById(id),
		getCustomerBookings(id),
	])
	if (!customer) notFound()

	const defaultTab = tab === "historia" ? "historia" : "dane"

	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/klienci"
				>
					<span aria-hidden="true">←</span>
					<span>Wszystkie klientki</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>Klientka</Eyebrow>
					<div className="flex items-center gap-3 flex-wrap">
						<Heading className="!text-[clamp(1.75rem,4vw,2.5rem)]" level="h1">
							{customer.firstName} {customer.lastName}
						</Heading>
						<StatusBadge variant={customer.active ? "active" : "inactive"} />
					</div>
				</header>

				<CustomerDetailTabs customer={customer} bookings={bookings} defaultTab={defaultTab} />
			</div>
		</Container>
	)
}
