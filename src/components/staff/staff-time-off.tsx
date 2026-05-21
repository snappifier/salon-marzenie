// src/components/staff/staff-time-off.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState} from "react"
import {CalendarOff, Plus, Trash2} from "lucide-react"
import {Modal} from "@/components/ui/modal"
import {Button} from "@/components/ui/button"
import {Field} from "@/components/ui/field"
import {Textarea} from "@/components/ui/textarea"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {EmptyState} from "@/components/ui/empty-state"
import {useToast} from "@/components/ui/toast"
import {addTimeOffJson, deleteTimeOff} from "@/features/staff/schedule-actions"
import {formatDate} from "@/lib/date"
import type {TimeOff} from "@/generated/prisma/client"

interface StaffTimeOffProps {
	staffId: string
	timeOffs: TimeOff[]
}

export function StaffTimeOff({staffId, timeOffs}: StaffTimeOffProps) {
	const router = useRouter()
	const toast = useToast()
	const [addOpen, setAddOpen] = useState(false)
	const [start, setStart] = useState("")
	const [end, setEnd] = useState("")
	const [reason, setReason] = useState("")
	const [error, setError] = useState<string | undefined>()
	const [saving, setSaving] = useState(false)
	const [pendingDelete, setPendingDelete] = useState<TimeOff | null>(null)
	const [deleting, setDeleting] = useState(false)

	function resetForm() {
		setStart("")
		setEnd("")
		setReason("")
		setError(undefined)
	}

	async function handleAdd() {
		setError(undefined)
		if (!start || !end) {
			setError("Podaj datę początku i końca")
			return
		}
		if (new Date(end) <= new Date(start)) {
			setError("Koniec musi być po początku")
			return
		}
		setSaving(true)
		try {
			const r = await addTimeOffJson(staffId, {startAt: start, endAt: end, reason})
			if (!r.success) {
				setError(r.error)
				return
			}
			toast.success("Dodano nieobecność")
			setAddOpen(false)
			resetForm()
			router.refresh()
		} finally {
			setSaving(false)
		}
	}

	async function handleDelete() {
		if (!pendingDelete) return
		setDeleting(true)
		try {
			await deleteTimeOff(pendingDelete.id, staffId)
			toast.success("Usunięto nieobecność")
			router.refresh()
		} finally {
			setDeleting(false)
			setPendingDelete(null)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-graphite-600">
					Urlopy, dni wolne i nieobecności. Pracownik nie będzie dostępny w tym czasie.
				</p>
				<Button size="sm" type="button" onClick={() => setAddOpen(true)}>
					<Plus size={15} strokeWidth={2.25} />
					<span className="hidden sm:inline">Dodaj nieobecność</span>
					<span className="sm:hidden">Dodaj</span>
				</Button>
			</div>

			{timeOffs.length === 0 ? (
				<EmptyState
					icon={<CalendarOff size={24} />}
					title="Brak zaplanowanych nieobecności"
					description="Dodaj urlopy lub dni wolne, żeby system nie proponował wizyt w tym czasie."
					action={{label: "Dodaj nieobecność", onClick: () => setAddOpen(true)}}
				/>
			) : (
				<ul className="flex flex-col gap-2">
					{timeOffs.map((t) => (
						<li
							key={t.id}
							className="rounded-2xl bg-white border border-border-soft p-4 flex items-center justify-between gap-3"
						>
							<div className="min-w-0">
								<p className="font-medium text-graphite-900 tabular-nums">
									{formatDate(t.startAt)} – {formatDate(t.endAt)}
								</p>
								{t.reason && <p className="text-sm text-graphite-600 mt-0.5">{t.reason}</p>}
							</div>
							<button
								className="inline-flex items-center justify-center w-9 h-9 rounded-full text-graphite-400 transition-[background-color,color] duration-150 ease-out hover-supported:hover:bg-error-bg hover-supported:hover:text-error active:scale-[0.94] shrink-0"
								type="button"
								aria-label="Usuń nieobecność"
								onClick={() => setPendingDelete(t)}
							>
								<Trash2 size={15} />
							</button>
						</li>
					))}
				</ul>
			)}

			<Modal
				open={addOpen}
				onClose={() => !saving && (setAddOpen(false), resetForm())}
				title="Dodaj nieobecność"
				size="md"
				footer={
					<div className="flex justify-end gap-2">
						<Button variant="secondary" size="sm" type="button" onClick={() => {setAddOpen(false); resetForm()}} disabled={saving}>
							Anuluj
						</Button>
						<Button size="sm" type="button" onClick={handleAdd} disabled={saving}>
							{saving ? "Dodawanie..." : "Dodaj"}
						</Button>
					</div>
				}
			>
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Field
							label="Od"
							type="datetime-local"
							value={start}
							onChange={(e) => setStart(e.target.value)}
							data-autofocus
						/>
						<Field
							label="Do"
							type="datetime-local"
							value={end}
							onChange={(e) => setEnd(e.target.value)}
							error={error}
						/>
					</div>
					<Textarea
						label="Powód (opcjonalnie)"
						rows={2}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="np. urlop, szkolenie"
					/>
				</div>
			</Modal>

			<ConfirmDialog
				open={pendingDelete !== null}
				onClose={() => !deleting && setPendingDelete(null)}
				onConfirm={handleDelete}
				title="Usunąć nieobecność?"
				description="Pracownik znów będzie dostępny w tym czasie."
				confirmLabel="Usuń"
				variant="danger"
				loading={deleting}
			/>
		</div>
	)
}
