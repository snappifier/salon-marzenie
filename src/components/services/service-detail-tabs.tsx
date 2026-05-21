// src/components/services/service-detail-tabs.tsx
"use client"

import {AnimatePresence, motion} from "motion/react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useState, useTransition} from "react"
import {Pause, Play, Trash2} from "lucide-react"
import {TabStrip, type Tab} from "@/components/ui/tab-strip"
import {RowActionMenu, type RowAction} from "@/components/admin-shell/row-action-menu"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {useToast} from "@/components/ui/toast"
import {activateService, deactivateService, deleteService} from "@/features/services/actions"
import {ServiceForm} from "@/components/services/service-form"
import {ServiceStaffForm} from "@/components/services/service-staff-form"
import type {Service, Category} from "@/generated/prisma/client"
import type {ServiceStaffAssignment} from "@/features/services/queries"

interface ServiceDetailTabsProps {
	service: Service
	categories: Category[]
	staffAssignments: ServiceStaffAssignment[]
	defaultTab: "dane" | "pracownicy"
	staffAssignedCount: number
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
}

export function ServiceDetailTabs({service, categories, staffAssignments, defaultTab, staffAssignedCount}: ServiceDetailTabsProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [busy, setBusy] = useState(false)

	const activeTab = (searchParams.get("tab") as "dane" | "pracownicy") ?? defaultTab

	const tabs: Tab[] = [
		{id: "dane", label: "Dane"},
		{id: "pracownicy", label: "Pracownicy", badge: staffAssignedCount},
	]

	function setTab(id: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (id === "dane") params.delete("tab")
		else params.set("tab", id)
		const qs = params.toString()
		startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`))
	}

	const menuActions: RowAction[] = service.active
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
				const r = await deleteService(service.id)
				if (r.success) {
					toast.success("Usługa usunięta")
					router.push("/admin/oferta")
					return
				}
				toast.error(r.error)
			} else if (pending.type === "deactivate") {
				await deactivateService(service.id)
				toast.success("Usługa dezaktywowana")
				router.refresh()
			} else {
				await activateService(service.id)
				toast.success("Usługa aktywowana")
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
					title: `Usunąć usługę „${service.name}"?`,
					description: "Tej operacji nie można cofnąć. Wszystkie powiązania z pracownikami zostaną usunięte.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować usługę „${service.name}"?`,
						description: "Usługa zniknie z publicznej oferty. Istniejące rezerwacje pozostaną.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować usługę „${service.name}"?`,
						description: "Usługa pojawi się na liście dostępnych zabiegów.",
						confirmLabel: "Aktywuj",
						variant: "warning" as const,
					}
		: null

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-3">
				<TabStrip
					className="flex-1"
					tabs={tabs}
					active={activeTab}
					onChange={setTab}
					layoutId={`service-tabs-${service.id}`}
					aria-label="Sekcje usługi"
				/>
				<RowActionMenu actions={menuActions} label={`Akcje dla ${service.name}`} />
			</div>

			<div className="relative">
				<AnimatePresence mode="wait">
					{activeTab === "dane" && (
						<motion.div
							key="dane"
							initial={{opacity: 0, y: 8}}
							animate={{opacity: 1, y: 0, transition: {duration: 0.22, ease: EASE_OUT_QUINT}}}
							exit={{opacity: 0, y: -4, transition: {duration: 0.15, ease: EASE_IN_CUBIC}}}
						>
							<ServiceForm mode="edit" categories={categories} initialData={service} />
						</motion.div>
					)}
					{activeTab === "pracownicy" && (
						<motion.div
							key="pracownicy"
							initial={{opacity: 0, y: 8}}
							animate={{opacity: 1, y: 0, transition: {duration: 0.22, ease: EASE_OUT_QUINT}}}
							exit={{opacity: 0, y: -4, transition: {duration: 0.15, ease: EASE_IN_CUBIC}}}
						>
							<ServiceStaffForm
								serviceId={service.id}
								defaultDurationMin={service.defaultDurationMin}
								defaultBufferAfterMin={service.defaultBufferAfterMin}
								defaultPriceGr={service.defaultPriceGr}
								assignments={staffAssignments}
							/>
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
