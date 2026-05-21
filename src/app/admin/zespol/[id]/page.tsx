// src/app/admin/zespol/[id]/page.tsx
import {notFound} from "next/navigation"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {StatusBadge} from "@/components/ui/status-badge"
import {StaffDetailTabs} from "@/components/staff/staff-detail-tabs"
import {getStaffById, getStaffServiceAssignments} from "@/features/staff/queries"
import {getStaffWorkingHours, getStaffTimeOffs} from "@/features/staff/schedule-queries"
import {getSettings} from "@/features/settings/queries"

type TabId = "dane" | "grafik" | "uslugi" | "timeoff"

type Props = {
	params: Promise<{id: string}>
	searchParams: Promise<{tab?: string}>
}

export default async function StaffDetailPage({params, searchParams}: Props) {
	const [{id}, {tab}] = await Promise.all([params, searchParams])
	const [staff, workingHours, timeOffs, serviceAssignments, settings] = await Promise.all([
		getStaffById(id),
		getStaffWorkingHours(id),
		getStaffTimeOffs(id),
		getStaffServiceAssignments(id),
		getSettings(),
	])
	if (!staff) notFound()

	const validTabs: TabId[] = ["dane", "grafik", "uslugi", "timeoff"]
	const defaultTab: TabId = validTabs.includes(tab as TabId) ? (tab as TabId) : "dane"

	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/zespol"
				>
					<span aria-hidden="true">←</span>
					<span>Cały zespół</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>Pracownik</Eyebrow>
					<div className="flex items-center gap-3 flex-wrap">
						<span
							className="w-3.5 h-3.5 rounded-full shrink-0"
							style={{backgroundColor: staff.color}}
							aria-hidden="true"
						/>
						<Heading className="!text-[clamp(1.75rem,4vw,2.5rem)]" level="h1">
							{staff.firstName} {staff.lastName}
						</Heading>
						<StatusBadge variant={staff.active ? "active" : "inactive"} />
					</div>
				</header>

				<StaffDetailTabs
					staff={staff}
					workingHours={workingHours}
					timeOffs={timeOffs}
					serviceAssignments={serviceAssignments}
					salonOpenMin={settings.salonOpenMin ?? 540}
					salonCloseMin={settings.salonCloseMin ?? 1140}
					defaultTab={defaultTab}
				/>
			</div>
		</Container>
	)
}
