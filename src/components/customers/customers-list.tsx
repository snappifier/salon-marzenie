// src/components/customers/customers-list.tsx
"use client"

import Link from "next/link"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {Users, Edit3, Pause, Play, Trash2} from "lucide-react"
import {AdminTable, type Column} from "@/components/ui/admin-table"
import {StatusBadge} from "@/components/ui/status-badge"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {EmptyState} from "@/components/ui/empty-state"
import {Avatar} from "@/components/ui/avatar"
import {RowActionMenu, type RowAction} from "@/components/admin-shell/row-action-menu"
import {useToast} from "@/components/ui/toast"
import {activateCustomer, deactivateCustomer, deleteCustomer} from "@/features/customers/actions"
import {cn} from "@/lib/cn"
import type {CustomerListRow} from "@/features/customers/queries"

interface CustomersListProps {
	customers: CustomerListRow[]
	isSearching: boolean
}

function formatLastVisit(date: Date | null): string {
	if (!date) return "—"
	const diffMs = Date.now() - date.getTime()
	const diffMin = Math.floor(diffMs / 60000)
	if (diffMin < 60) return "przed chwilą"
	const diffH = Math.floor(diffMin / 60)
	if (diffH < 24) return "dzisiaj"
	const diffD = Math.floor(diffH / 24)
	if (diffD === 1) return "wczoraj"
	if (diffD < 7) return `${diffD} dni temu`
	if (diffD < 30) return `${Math.floor(diffD / 7)} tyg. temu`
	if (diffD < 365) return `${Math.floor(diffD / 30)} mies. temu`
	return `${Math.floor(diffD / 365)} lat temu`
}

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
	customer: CustomerListRow
}

export function CustomersList({customers, isSearching}: CustomersListProps) {
	const router = useRouter()
	const toast = useToast()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [loading, setLoading] = useState(false)

	function buildActions(c: CustomerListRow): RowAction[] {
		const actions: RowAction[] = [
			{
				id: "edit",
				label: "Edytuj",
				href: `/admin/klienci/${c.id}`,
				icon: <Edit3 size={14} />,
			},
		]
		if (c.active) {
			actions.push({
				id: "deactivate",
				label: "Dezaktywuj",
				icon: <Pause size={14} />,
				onClick: () => setPending({type: "deactivate", customer: c}),
			})
		} else {
			actions.push({
				id: "activate",
				label: "Aktywuj",
				icon: <Play size={14} />,
				onClick: () => setPending({type: "activate", customer: c}),
			})
		}
		actions.push({
			id: "delete",
			label: "Usuń",
			icon: <Trash2 size={14} />,
			danger: true,
			onClick: () => setPending({type: "delete", customer: c}),
		})
		return actions
	}

	const columns: Column<CustomerListRow>[] = [
		{
			id: "name",
			header: "Klient",
			cell: (c) => (
				<div className="flex items-center gap-3 min-w-0">
					<Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
					<div className="min-w-0">
						<p className="font-medium text-graphite-900 truncate">
							{c.firstName} {c.lastName}
						</p>
						{c.hasAccount && (
							<p className="text-[11px] uppercase tracking-[0.12em] text-rose-600 font-medium mt-0.5">
								Konto klienta
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			id: "phone",
			header: "Telefon",
			cell: (c) => <span className="tabular-nums text-graphite-700">{c.phone}</span>,
		},
		{
			id: "email",
			header: "Email",
			mobileHidden: true,
			cell: (c) => (
				<span className={cn("truncate block max-w-[200px]", c.email ? "text-graphite-700" : "text-graphite-400")}>
					{c.email ?? "—"}
				</span>
			),
		},
		{
			id: "lastVisit",
			header: "Ostatnia wizyta",
			cell: (c) => <span className="text-graphite-700">{formatLastVisit(c.lastVisitAt)}</span>,
		},
		{
			id: "visits",
			header: "Wizyt",
			align: "right",
			cell: (c) => <span className="tabular-nums font-medium text-graphite-900">{c.bookingCount}</span>,
		},
		{
			id: "status",
			header: "Status",
			cell: (c) => <StatusBadge variant={c.active ? "active" : "inactive"} />,
		},
		{
			id: "actions",
			header: "",
			align: "right",
			width: "w-12",
			cell: (c) => (
				<div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
					<RowActionMenu actions={buildActions(c)} label={`Akcje dla ${c.firstName} ${c.lastName}`} />
				</div>
			),
		},
	]

	async function handleConfirm() {
		if (!pending) return
		setLoading(true)
		try {
			if (pending.type === "delete") {
				const result = await deleteCustomer(pending.customer.id)
				if (result.success) {
					toast.success(`Usunięto klientkę ${pending.customer.firstName} ${pending.customer.lastName}`)
				} else {
					toast.error(result.error)
				}
			} else if (pending.type === "deactivate") {
				await deactivateCustomer(pending.customer.id)
				toast.success(`Dezaktywowano klientkę ${pending.customer.firstName}`)
			} else {
				await activateCustomer(pending.customer.id)
				toast.success(`Aktywowano klientkę ${pending.customer.firstName}`)
			}
			router.refresh()
		} finally {
			setLoading(false)
			setPending(null)
		}
	}

	const dialogProps = pending
		? pending.type === "delete"
			? {
					title: `Usunąć klientkę ${pending.customer.firstName} ${pending.customer.lastName}?`,
					description: "Klient zniknie z systemu wraz z historią. Tej operacji nie można cofnąć.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować klientkę ${pending.customer.firstName}?`,
						description: "Klient nie będzie mógł rezerwować, historia pozostanie nietknięta.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować klientkę ${pending.customer.firstName}?`,
						description: "Klient będzie mógł znowu rezerwować wizyty.",
						confirmLabel: "Aktywuj",
						variant: "warning" as const,
					}
		: null

	return (
		<>
			<AdminTable
				data={customers}
				columns={columns}
				rowKey={(c) => c.id}
				onRowClick={(c) => router.push(`/admin/klienci/${c.id}`)}
				emptyState={
					<EmptyState
						icon={<Users size={24} />}
						title={isSearching ? "Brak wyników" : "Twoja kartoteka jest pusta"}
						description={
							isSearching
								? "Spróbuj innego zapytania albo zmień filtr."
								: "Dodaj pierwszą klientkę i zacznij budować lojalność salonu."
						}
						action={
							isSearching
								? undefined
								: {label: "Dodaj klientkę", href: "/admin/klienci/nowy"}
						}
					/>
				}
			/>

			{dialogProps && (
				<ConfirmDialog
					open={pending !== null}
					onClose={() => !loading && setPending(null)}
					onConfirm={handleConfirm}
					title={dialogProps.title}
					description={dialogProps.description}
					confirmLabel={dialogProps.confirmLabel}
					variant={dialogProps.variant}
					loading={loading}
				/>
			)}
		</>
	)
}
