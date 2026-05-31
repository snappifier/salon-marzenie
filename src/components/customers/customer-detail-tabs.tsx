// src/components/customers/customer-detail-tabs.tsx
"use client"

import {AnimatePresence, motion} from "motion/react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useState, useTransition} from "react"
import {Edit3, Pause, Play, Trash2} from "lucide-react"
import {TabStrip, type Tab} from "@/components/ui/tab-strip"
import {RowActionMenu, type RowAction} from "@/components/admin-shell/row-action-menu"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {useToast} from "@/components/ui/toast"
import {activateCustomer, deactivateCustomer, deleteCustomer} from "@/features/customers/actions"
import {CustomerForm} from "@/components/customers/customer-form"
import {CustomerHistory} from "@/components/customers/customer-history"
import type {Customer, Booking, BookingItem, Service, Staff} from "@/generated/prisma/client"

interface CustomerDetailTabsProps {
	customer: Customer
	bookings: (Booking & {items: (BookingItem & {service: Service; staff: Staff})[]})[]
	defaultTab: "dane" | "historia"
}

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

export function CustomerDetailTabs({customer, bookings, defaultTab}: CustomerDetailTabsProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [busy, setBusy] = useState(false)

	const activeTab = (searchParams.get("tab") as "dane" | "historia") ?? defaultTab

	const tabs: Tab[] = [
		{id: "dane", label: "Dane"},
		{id: "historia", label: "Historia", badge: bookings.length},
	]

	function setTab(id: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (id === "dane") params.delete("tab")
		else params.set("tab", id)
		const qs = params.toString()
		startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`))
	}

	const menuActions: RowAction[] = customer.active
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
				const result = await deleteCustomer(customer.id)
				if (result.success) {
					toast.success("Klientka usunięta")
					router.push("/admin/klienci")
					return
				}
				toast.error(result.error)
			} else if (pending.type === "deactivate") {
				await deactivateCustomer(customer.id)
				toast.success("Klientka dezaktywowana")
				router.refresh()
			} else {
				await activateCustomer(customer.id)
				toast.success("Klientka aktywowana")
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
					title: `Usunąć klientkę ${customer.firstName} ${customer.lastName}?`,
					description: "Klient zniknie z systemu wraz z historią wizyt. Tej operacji nie można cofnąć.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować klientkę ${customer.firstName}?`,
						description: "Klient nie będzie mógł rezerwować, historia pozostanie nietknięta.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować klientkę ${customer.firstName}?`,
						description: "Klient będzie mógł znowu rezerwować wizyty.",
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
					layoutId={`customer-tabs-${customer.id}`}
					aria-label="Sekcje klientki"
				/>
				<RowActionMenu actions={menuActions} label={`Akcje dla ${customer.firstName}`} />
			</div>

			<div className="relative">
				<AnimatePresence mode="wait">
					{activeTab === "dane" && (
						<motion.div
							key="dane"
							id="panel-dane"
							role="tabpanel"
							aria-labelledby="tab-dane"
							initial={{opacity: 0, y: 8}}
							animate={{opacity: 1, y: 0, transition: {duration: 0.22, ease: EASE_OUT_QUINT}}}
							exit={{opacity: 0, y: -4, transition: {duration: 0.15, ease: EASE_IN_CUBIC}}}
						>
							<CustomerForm mode="edit" initialData={customer} />
						</motion.div>
					)}
					{activeTab === "historia" && (
						<motion.div
							key="historia"
							id="panel-historia"
							role="tabpanel"
							aria-labelledby="tab-historia"
							initial={{opacity: 0, y: 8}}
							animate={{opacity: 1, y: 0, transition: {duration: 0.22, ease: EASE_OUT_QUINT}}}
							exit={{opacity: 0, y: -4, transition: {duration: 0.15, ease: EASE_IN_CUBIC}}}
						>
							<CustomerHistory bookings={bookings} />
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
