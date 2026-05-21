// src/components/staff/staff-list.tsx
"use client"

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
import {activateStaff, deactivateStaff, deleteStaff} from "@/features/staff/actions"
import {cn} from "@/lib/cn"
import type {StaffListRow} from "@/features/staff/queries"

interface StaffListProps {
	staff: StaffListRow[]
	isFiltering: boolean
}

interface PendingAction {
	type: "deactivate" | "activate" | "delete"
	member: StaffListRow
}

export function StaffList({staff, isFiltering}: StaffListProps) {
	const router = useRouter()
	const toast = useToast()
	const [pending, setPending] = useState<PendingAction | null>(null)
	const [loading, setLoading] = useState(false)

	function buildActions(s: StaffListRow): RowAction[] {
		const actions: RowAction[] = [
			{id: "edit", label: "Edytuj", href: `/admin/zespol/${s.id}`, icon: <Edit3 size={14} />},
		]
		if (s.active) {
			actions.push({id: "deactivate", label: "Dezaktywuj", icon: <Pause size={14} />, onClick: () => setPending({type: "deactivate", member: s})})
		} else {
			actions.push({id: "activate", label: "Aktywuj", icon: <Play size={14} />, onClick: () => setPending({type: "activate", member: s})})
		}
		actions.push({id: "delete", label: "Usuń", icon: <Trash2 size={14} />, danger: true, onClick: () => setPending({type: "delete", member: s})})
		return actions
	}

	const columns: Column<StaffListRow>[] = [
		{
			id: "name",
			header: "Pracownik",
			cell: (s) => (
				<div className="flex items-center gap-3 min-w-0">
					<Avatar name={`${s.firstName} ${s.lastName}`} size="sm" accentColor={s.color} />
					<div className="min-w-0">
						<p className="font-medium text-graphite-900 truncate">{s.firstName} {s.lastName}</p>
						<p className="text-[11px] text-graphite-500 mt-0.5">
							{s.serviceCount} {s.serviceCount === 1 ? "usługa" : "usług"} · {s.workingDays} {s.workingDays === 1 ? "dzień" : "dni"} pracy
						</p>
					</div>
				</div>
			),
		},
		{
			id: "email",
			header: "Email",
			mobileHidden: true,
			cell: (s) => (
				<span className={cn("truncate block max-w-[200px]", s.email ? "text-graphite-700" : "text-graphite-400")}>
					{s.email ?? "—"}
				</span>
			),
		},
		{
			id: "phone",
			header: "Telefon",
			mobileHidden: true,
			cell: (s) => (
				<span className={cn("tabular-nums", s.phone ? "text-graphite-700" : "text-graphite-400")}>
					{s.phone ?? "—"}
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
					<RowActionMenu actions={buildActions(s)} label={`Akcje dla ${s.firstName}`} />
				</div>
			),
		},
	]

	async function handleConfirm() {
		if (!pending) return
		setLoading(true)
		try {
			if (pending.type === "delete") {
				const r = await deleteStaff(pending.member.id)
				if (r.success) toast.success(`Usunięto: ${pending.member.firstName} ${pending.member.lastName}`)
				else toast.error(r.error)
			} else if (pending.type === "deactivate") {
				await deactivateStaff(pending.member.id)
				toast.success(`Dezaktywowano: ${pending.member.firstName}`)
			} else {
				await activateStaff(pending.member.id)
				toast.success(`Aktywowano: ${pending.member.firstName}`)
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
					title: `Usunąć pracownika ${pending.member.firstName} ${pending.member.lastName}?`,
					description: "Tej operacji nie można cofnąć. Grafik i przypisania usług zostaną usunięte.",
					confirmLabel: "Usuń",
					variant: "danger" as const,
				}
			: pending.type === "deactivate"
				? {
						title: `Dezaktywować ${pending.member.firstName}?`,
						description: "Pracownik nie będzie dostępny w rezerwacjach. Grafik zostanie zachowany.",
						confirmLabel: "Dezaktywuj",
						variant: "warning" as const,
					}
				: {
						title: `Aktywować ${pending.member.firstName}?`,
						description: "Pracownik znów będzie dostępny w rezerwacjach.",
						confirmLabel: "Aktywuj",
						variant: "warning" as const,
					}
		: null

	return (
		<>
			<AdminTable
				data={staff}
				columns={columns}
				rowKey={(s) => s.id}
				onRowClick={(s) => router.push(`/admin/zespol/${s.id}`)}
				emptyState={
					<EmptyState
						icon={<Users size={24} />}
						title={isFiltering ? "Brak wyników" : "Brak pracowników"}
						description={
							isFiltering
								? "Spróbuj innego zapytania lub zmień filtr."
								: "Dodaj członków zespołu salonu, żeby przypisywać ich do wizyt."
						}
						action={isFiltering ? undefined : {label: "Dodaj pracownika", href: "/admin/zespol/nowy"}}
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
