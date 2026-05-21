// src/components/categories/categories-list.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState} from "react"
import {Layers, Edit3, Pause, Play, Trash2} from "lucide-react"
import {AdminTable, type Column} from "@/components/ui/admin-table"
import {StatusBadge} from "@/components/ui/status-badge"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {EmptyState} from "@/components/ui/empty-state"
import {RowActionMenu, type RowAction} from "@/components/admin-shell/row-action-menu"
import {useToast} from "@/components/ui/toast"
import {activateCategory, deactivateCategory, deleteCategory} from "@/features/categories/actions"
import {cn} from "@/lib/cn"

interface CategoryRow {
	id: string
	name: string
	slug: string
	order: number
	active: boolean
	serviceCount: number
}

interface CategoriesListProps {
	categories: CategoryRow[]
}

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
	category: CategoryRow
}

export function CategoriesList({categories}: CategoriesListProps) {
	const router = useRouter()
	const toast = useToast()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [loading, setLoading] = useState(false)

	function buildActions(c: CategoryRow): RowAction[] {
		const actions: RowAction[] = [
			{id: "edit", label: "Edytuj", href: `/admin/oferta/kategorie/${c.id}`, icon: <Edit3 size={14} />},
		]
		if (c.active) {
			actions.push({id: "deactivate", label: "Dezaktywuj", icon: <Pause size={14} />, onClick: () => setPending({type: "deactivate", category: c})})
		} else {
			actions.push({id: "activate", label: "Aktywuj", icon: <Play size={14} />, onClick: () => setPending({type: "activate", category: c})})
		}
		actions.push({id: "delete", label: "Usuń", icon: <Trash2 size={14} />, danger: true, onClick: () => setPending({type: "delete", category: c})})
		return actions
	}

	const columns: Column<CategoryRow>[] = [
		{
			id: "name",
			header: "Nazwa",
			cell: (c) => (
				<div className="flex items-center gap-3 min-w-0">
					<span
						className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-700 font-serif text-sm tabular-nums shrink-0"
						aria-hidden="true"
					>
						{c.order}
					</span>
					<p className="font-medium text-graphite-900 truncate">{c.name}</p>
				</div>
			),
		},
		{
			id: "slug",
			header: "Slug",
			mobileHidden: true,
			cell: (c) => <code className="text-xs text-graphite-600 bg-warm px-1.5 py-0.5 rounded">{c.slug}</code>,
		},
		{
			id: "services",
			header: "Usług",
			align: "right",
			cell: (c) => (
				<span className={cn("tabular-nums font-medium", c.serviceCount > 0 ? "text-graphite-900" : "text-graphite-400")}>
					{c.serviceCount}
				</span>
			),
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
					<RowActionMenu actions={buildActions(c)} label={`Akcje dla ${c.name}`} />
				</div>
			),
		},
	]

	async function handleConfirm() {
		if (!pending) return
		setLoading(true)
		try {
			if (pending.type === "delete") {
				const r = await deleteCategory(pending.category.id)
				if (r.success) toast.success(`Usunięto kategorię: ${pending.category.name}`)
				else toast.error(r.error)
			} else if (pending.type === "deactivate") {
				await deactivateCategory(pending.category.id)
				toast.success(`Dezaktywowano: ${pending.category.name}`)
			} else {
				await activateCategory(pending.category.id)
				toast.success(`Aktywowano: ${pending.category.name}`)
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
					title: `Usunąć kategorię „${pending.category.name}"?`,
					description: "Pamiętaj, że usługi przypisane do tej kategorii zostaną osierocone. Najpierw przepnij je gdzie indziej.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować kategorię „${pending.category.name}"?`,
						description: "Kategoria zniknie z publicznej oferty. Usługi pozostaną.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować kategorię „${pending.category.name}"?`,
						description: "Kategoria znów pojawi się w publicznej ofercie.",
						confirmLabel: "Aktywuj",
						variant: "warning" as const,
					}
		: null

	return (
		<>
			<AdminTable
				data={categories}
				columns={columns}
				rowKey={(c) => c.id}
				onRowClick={(c) => router.push(`/admin/oferta/kategorie/${c.id}`)}
				emptyState={
					<EmptyState
						icon={<Layers size={24} />}
						title="Brak kategorii"
						description="Grupuj usługi w kategorie (Manicure, Pedicure, itp.), żeby klientom łatwiej było szukać."
						action={{label: "Dodaj kategorię", href: "/admin/oferta/kategorie/nowa"}}
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
