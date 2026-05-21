// src/app/admin/oferta/uslugi/[id]/page.tsx
import {notFound} from "next/navigation"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {StatusBadge} from "@/components/ui/status-badge"
import {ServiceDetailTabs} from "@/components/services/service-detail-tabs"
import {getServiceById, getServiceStaffAssignments} from "@/features/services/queries"
import {prisma} from "@/lib/prisma"

type Props = {
	params: Promise<{id: string}>
	searchParams: Promise<{tab?: string}>
}

export default async function ServiceDetailPage({params, searchParams}: Props) {
	const [{id}, {tab}] = await Promise.all([params, searchParams])
	const [service, categories, staffAssignments] = await Promise.all([
		getServiceById(id),
		prisma.category.findMany({orderBy: {order: "asc"}}),
		getServiceStaffAssignments(id),
	])
	if (!service) notFound()

	const defaultTab = tab === "pracownicy" ? "pracownicy" : "dane"
	const staffAssignedCount = staffAssignments.filter((a) => a.assigned).length

	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/oferta?sub=uslugi"
				>
					<span aria-hidden="true">←</span>
					<span>Wszystkie usługi</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>{service.category.name}</Eyebrow>
					<div className="flex items-center gap-3 flex-wrap">
						<Heading className="!text-[clamp(1.75rem,4vw,2.5rem)]" level="h1">
							{service.name}
						</Heading>
						<StatusBadge variant={service.active ? "active" : "inactive"} />
					</div>
				</header>

				<ServiceDetailTabs
					service={service}
					categories={categories}
					staffAssignments={staffAssignments}
					defaultTab={defaultTab}
					staffAssignedCount={staffAssignedCount}
				/>
			</div>
		</Container>
	)
}
