// src/components/staff/staff-detail-tabs.tsx
"use client"

import {AnimatePresence, motion} from "motion/react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useState, useTransition} from "react"
import {Pause, Play, Trash2} from "lucide-react"
import {TabStrip, type Tab} from "@/components/ui/tab-strip"
import {RowActionMenu, type RowAction} from "@/components/admin-shell/row-action-menu"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {useToast} from "@/components/ui/toast"
import {activateStaff, deactivateStaff, deleteStaff} from "@/features/staff/actions"
import {StaffForm} from "@/components/staff/staff-form"
import {StaffScheduleForm} from "@/components/staff/staff-schedule-form"
import {StaffServicesForm} from "@/components/staff/staff-services-form"
import {StaffTimeOff} from "@/components/staff/staff-time-off"
import type {Staff, WorkingHours, TimeOff} from "@/generated/prisma/client"
import type {StaffServiceAssignment} from "@/features/staff/queries"

type TabId = "dane" | "grafik" | "uslugi" | "timeoff"

interface StaffDetailTabsProps {
	staff: Staff
	workingHours: WorkingHours[]
	timeOffs: TimeOff[]
	serviceAssignments: StaffServiceAssignment[]
	salonOpenMin: number
	salonCloseMin: number
	defaultTab: TabId
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
}

export function StaffDetailTabs({
	staff,
	workingHours,
	timeOffs,
	serviceAssignments,
	salonOpenMin,
	salonCloseMin,
	defaultTab,
}: StaffDetailTabsProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [busy, setBusy] = useState(false)

	const rawTab = searchParams.get("tab")
	const activeTab: TabId = (["dane", "grafik", "uslugi", "timeoff"] as const).includes(rawTab as TabId)
		? (rawTab as TabId)
		: defaultTab

	const assignedCount = serviceAssignments.filter((a) => a.assigned).length

	const tabs: Tab[] = [
		{id: "dane", label: "Dane"},
		{id: "grafik", label: "Grafik", badge: workingHours.length},
		{id: "uslugi", label: "Usługi", badge: assignedCount},
		{id: "timeoff", label: "Nieobecności", badge: timeOffs.length || undefined},
	]

	function setTab(id: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (id === "dane") params.delete("tab")
		else params.set("tab", id)
		const qs = params.toString()
		startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`))
	}

	const menuActions: RowAction[] = staff.active
		? [
				{id: "deactivate", label: "Dezaktywuj", icon: <Pause size={14} />, onClick: () => setPending({type: "deactivate"})},
				{id: "delete", label: "Usuń", icon: <Trash2 size={14} />, danger: true, onClick: () => setPending({type: "delete"})},
			]
		: [
				{id: "activate", label: "Aktywuj", icon: <Play size={14} />, onClick: () => setPending({type: "activate"})},
				{id: "delete", label: "Usuń", icon: <Trash2 size={14} />, danger: true, onClick: () => setPending({type: "delete"})},
			]

	async function handleConfirm() {
		if (!pending) return
		setBusy(true)
		try {
			if (pending.type === "delete") {
				const r = await deleteStaff(staff.id)
				if (r.success) {
					toast.success("Pracownik usunięty")
					router.push("/admin/zespol")
					return
				}
				toast.error(r.error)
			} else if (pending.type === "deactivate") {
				await deactivateStaff(staff.id)
				toast.success("Pracownik dezaktywowany")
				router.refresh()
			} else {
				await activateStaff(staff.id)
				toast.success("Pracownik aktywowany")
				router.refresh()
			}
		} finally {
			setBusy(false)
			setPending(null)
		}
	}

	const dialogProps = pending
		? pending.type === "delete"
			? {
					title: `Usunąć pracownika ${staff.firstName} ${staff.lastName}?`,
					description: "Tej operacji nie można cofnąć. Grafik i przypisania usług zostaną usunięte.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować ${staff.firstName}?`,
						description: "Pracownik nie będzie dostępny w rezerwacjach. Grafik zostanie zachowany.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować ${staff.firstName}?`,
						description: "Pracownik znów będzie dostępny w rezerwacjach.",
						confirmLabel: "Aktywuj",
						variant: "warning" as const,
					}
		: null

	const transition = {
		initial: {opacity: 0, y: 8},
		animate: {opacity: 1, y: 0, transition: {duration: 0.22, ease: EASE_OUT_QUINT}},
		exit: {opacity: 0, y: -4, transition: {duration: 0.15, ease: EASE_IN_CUBIC}},
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-3">
				<TabStrip
					className="flex-1"
					tabs={tabs}
					active={activeTab}
					onChange={setTab}
					layoutId={`staff-tabs-${staff.id}`}
					aria-label="Sekcje pracownika"
				/>
				<RowActionMenu actions={menuActions} label={`Akcje dla ${staff.firstName}`} />
			</div>

			<div className="relative">
				<AnimatePresence mode="wait">
					{activeTab === "dane" && (
						<motion.div key="dane" {...transition}>
							<StaffForm mode="edit" initialData={staff} />
						</motion.div>
					)}
					{activeTab === "grafik" && (
						<motion.div key="grafik" {...transition}>
							<StaffScheduleForm
								staffId={staff.id}
								workingHours={workingHours}
								salonOpenMin={salonOpenMin}
								salonCloseMin={salonCloseMin}
							/>
						</motion.div>
					)}
					{activeTab === "uslugi" && (
						<motion.div key="uslugi" {...transition}>
							<StaffServicesForm staffId={staff.id} assignments={serviceAssignments} />
						</motion.div>
					)}
					{activeTab === "timeoff" && (
						<motion.div key="timeoff" {...transition}>
							<StaffTimeOff staffId={staff.id} timeOffs={timeOffs} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{dialogProps && (
				<ConfirmDialog
					open={pending !== null}
					onClose={() => !busy && setPending(null)}
					onConfirm={handleConfirm}
					title={dialogProps.title}
					description={dialogProps.description}
					confirmLabel={dialogProps.confirmLabel}
					variant={dialogProps.variant}
					loading={busy}
				/>
			)}
		</div>
	)
}
