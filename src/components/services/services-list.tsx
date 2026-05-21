// src/components/services/services-list.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState} from "react"
import {Sparkles, Edit3, Pause, Play, Trash2} from "lucide-react"
import {AdminTable, type Column} from "@/components/ui/admin-table"
import {StatusBadge} from "@/components/ui/status-badge"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {EmptyState} from "@/components/ui/empty-state"
import {RowActionMenu, type RowAction} from "@/components/admin-shell/row-action-menu"
import {useToast} from "@/components/ui/toast"
import {activateService, deactivateService, deleteService} from "@/features/services/actions"
import {formatMoney} from "@/lib/money"
import {cn} from "@/lib/cn"
import type {ServiceListRow} from "@/features/services/queries"

interface ServicesListProps {
	services: ServiceListRow[]
	isFiltering: boolean
}

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
	service: ServiceListRow
}

export function ServicesList({services, isFiltering}: ServicesListProps) {
	const router = useRouter()
	const toast = useToast()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [loading, setLoading] = useState(false)

	function buildActions(s: ServiceListRow): RowAction[] {
		const actions: RowAction[] = [
			{id: "edit", label: "Edytuj", href: `/admin/oferta/uslugi/${s.id}`, icon: <Edit3 size={14} />},
		]
		if (s.active) {
			actions.push({id: "deactivate", label: "Dezaktywuj", icon: <Pause size={14} />, onClick: () => setPending({type: "deactivate", service: s})})
		} else {
			actions.push({id: "activate", label: "Aktywuj", icon: <Play size={14} />, onClick: () => setPending({type: "activate", service: s})})
		}
		actions.push({id: "delete", label: "Usuń", icon: <Trash2 size={14} />, danger: true, onClick: () => setPending({type: "delete", service: s})})
		return actions
	}

	const columns: Column<ServiceListRow>[] = [
		{
			id: "name",
			header: "Usługa",
			cell: (s) => (
				<div className="min-w-0">
					<p className="font-medium text-graphite-900 truncate">{s.name}</p>
					{s.description && (
						<p className="text-xs text-graphite-500 truncate mt-0.5 max-w-xs">{s.description}</p>
					)}
				</div>
			),
		},
		{
			id: "category",
			header: "Kategoria",
			cell: (s) => <span className="text-graphite-700">{s.categoryName}</span>,
		},
		{
			id: "duration",
			header: "Czas",
			align: "right",
			mobileHidden: true,
			cell: (s) => (
				<span className="tabular-nums text-graphite-700">
					{s.defaultDurationMin} <span className="text-graphite-400">min</span>
				</span>
			),
		},
		{
			id: "buffer",
			header: "Bufor",
			align: "right",
			mobileHidden: true,
			cell: (s) => (
				<span className={cn("tabular-nums", s.defaultBufferAfterMin > 0 ? "text-graphite-700" : "text-graphite-400")}>
					{s.defaultBufferAfterMin > 0 ? `${s.defaultBufferAfterMin} min` : "—"}
				</span>
			),
		},
		{
			id: "price",
			header: "Cena",
			align: "right",
			cell: (s) => (
				<span className="tabular-nums font-medium text-graphite-900">{formatMoney(s.defaultPriceGr)}</span>
			),
		},
		{
			id: "staff",
			header: "Wykonawcy",
			align: "right",
			mobileHidden: true,
			cell: (s) => (
				<span className={cn("tabular-nums", s.staffCount > 0 ? "text-graphite-700" : "text-warning")}>
					{s.staffCount}
				</span>
			),
		},
		{
			id: "status",
			header: "Status",
			cell: (s) => <StatusBadge variant={s.active ? "active" : "inactive"} />,
		},
		{
			id: "actions",
			header: "",
			align: "right",
			width: "w-12",
			cell: (s) => (
				<div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
					<RowActionMenu actions={buildActions(s)} label={`Akcje dla ${s.name}`} />
				</div>
			),
		},
	]

	async function handleConfirm() {
		if (!pending) return
		setLoading(true)
		try {
			if (pending.type === "delete") {
				const r = await deleteService(pending.service.id)
				if (r.success) toast.success(`Usunięto: ${pending.service.name}`)
				else toast.error(r.error)
			} else if (pending.type === "deactivate") {
				await deactivateService(pending.service.id)
				toast.success(`Dezaktywowano: ${pending.service.name}`)
			} else {
				await activateService(pending.service.id)
				toast.success(`Aktywowano: ${pending.service.name}`)
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
					title: `Usunąć usługę „${pending.service.name}"?`,
					description: "Tej operacji nie można cofnąć. Wszystkie powiązania z pracownikami i historią zostaną usunięte.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować usługę „${pending.service.name}"?`,
						description: "Usługa zniknie z publicznej oferty. Istniejące rezerwacje zostaną.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować usługę „${pending.service.name}"?`,
						description: "Usługa pojawi się na liście dostępnych zabiegów.",
						confirmLabel: "Aktywuj",
						variant: "warning" as const,
					}
		: null

	return (
		<>
			<AdminTable
				data={services}
				columns={columns}
				rowKey={(s) => s.id}
				onRowClick={(s) => router.push(`/admin/oferta/uslugi/${s.id}`)}
				emptyState={
					<EmptyState
						icon={<Sparkles size={24} />}
						title={isFiltering ? "Brak wyników" : "Brak usług"}
						description={
							isFiltering
								? "Spróbuj innego filtru lub szukaj po nazwie."
								: "Zacznij od dodania zabiegów, które oferujesz w salonie."
						}
						action={isFiltering ? undefined : {label: "Dodaj usługę", href: "/admin/oferta/uslugi/nowa"}}
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
