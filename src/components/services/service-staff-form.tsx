// src/components/services/service-staff-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState, useTransition} from "react"
import {ChevronDown} from "lucide-react"
import {motion, AnimatePresence} from "motion/react"
import {CheckboxField} from "@/components/ui/checkbox-field"
import {Avatar} from "@/components/ui/avatar"
import {EmptyState} from "@/components/ui/empty-state"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {useToast} from "@/components/ui/toast"
import {saveServiceStaff} from "@/features/services/actions"
import {formatMoney} from "@/lib/money"
import {cn} from "@/lib/cn"
import type {ServiceStaffAssignment} from "@/features/services/queries"

interface ServiceStaffFormProps {
	serviceId: string
	defaultDurationMin: number
	defaultBufferAfterMin: number
	defaultPriceGr: number
	assignments: ServiceStaffAssignment[]
}

interface RowState {
	staffId: string
	firstName: string
	lastName: string
	color: string
	active: boolean
	assigned: boolean
	durationOverride: string
	bufferOverride: string
	priceOverride: string
	expanded: boolean
}

function toRowState(a: ServiceStaffAssignment): RowState {
	return {
		staffId: a.staffId,
		firstName: a.firstName,
		lastName: a.lastName,
		color: a.color,
		active: a.active,
		assigned: a.assigned,
		durationOverride: a.durationOverrideMin !== null ? String(a.durationOverrideMin) : "",
		bufferOverride: a.bufferOverrideMin !== null ? String(a.bufferOverrideMin) : "",
		priceOverride: a.priceOverrideGr !== null ? (a.priceOverrideGr / 100).toFixed(2) : "",
		expanded: false,
	}
}

function rowToDirtyKey(r: RowState): string {
	return `${r.assigned}|${r.durationOverride}|${r.bufferOverride}|${r.priceOverride}`
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function ServiceStaffForm({
	serviceId,
	defaultDurationMin,
	defaultBufferAfterMin,
	defaultPriceGr,
	assignments,
}: ServiceStaffFormProps) {
	const router = useRouter()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [initial, setInitial] = useState<RowState[]>(() => assignments.map(toRowState))
	const [rows, setRows] = useState<RowState[]>(initial)
	const [submitting, setSubmitting] = useState(false)

	const isDirty = rows.some((r, idx) => rowToDirtyKey(r) !== rowToDirtyKey(initial[idx]))

	function updateRow(staffId: string, patch: Partial<RowState>) {
		setRows((prev) => prev.map((r) => (r.staffId === staffId ? {...r, ...patch} : r)))
	}

	function discard() {
		setRows(initial)
	}

	async function handleSubmit() {
		setSubmitting(true)
		try {
			const payload = rows.map((r) => {
				const duration = r.durationOverride.trim() === "" ? null : Number(r.durationOverride)
				const buffer = r.bufferOverride.trim() === "" ? null : Number(r.bufferOverride)
				const priceZl = r.priceOverride.trim() === "" ? null : Number(r.priceOverride.replace(",", "."))
				const priceGr = priceZl === null ? null : Math.round(priceZl * 100)
				return {
					staffId: r.staffId,
					assigned: r.assigned,
					durationOverrideMin: duration,
					bufferOverrideMin: buffer,
					priceOverrideGr: priceGr,
				}
			})
			const result = await saveServiceStaff(serviceId, payload)
			if (!result.success) {
				toast.error(result.error)
				return
			}
			toast.success("Zapisano przypisania pracowników")
			setInitial(rows)
			startTransition(() => router.refresh())
		} finally {
			setSubmitting(false)
		}
	}

	if (rows.length === 0) {
		return (
			<EmptyState
				icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>}
				title="Brak pracowników"
				description="Dodaj najpierw pracowników w sekcji Zespół, żeby przypisać ich do tej usługi."
				action={{label: "Przejdź do Zespołu", href: "/admin/zespol"}}
			/>
		)
	}

	return (
		<>
			<div className="flex flex-col gap-3 pb-32">
				<p className="text-sm text-graphite-600">
					Zaznacz, którzy pracownicy wykonują tę usługę. Opcjonalnie nadpisz domyślny czas lub cenę dla konkretnej osoby.
				</p>

				<div className="flex flex-col gap-2">
					{rows.map((row) => (
						<div
							key={row.staffId}
							className={cn(
								"rounded-2xl border overflow-hidden bg-white",
								row.assigned ? "border-rose-200/60" : "border-border-soft",
								!row.active && "opacity-60",
							)}
						>
							<div className="flex items-center gap-3 p-4">
								<CheckboxField
									className="flex-1"
									label={`${row.firstName} ${row.lastName}`}
									description={row.active ? undefined : "Pracownik nieaktywny"}
									checked={row.assigned}
									onChange={(e) => updateRow(row.staffId, {assigned: e.target.checked})}
								/>
								<Avatar
									name={`${row.firstName} ${row.lastName}`}
									size="sm"
									accentColor={row.color}
								/>
								{row.assigned && (
									<button
										type="button"
										className={cn(
											"inline-flex items-center justify-center w-9 h-9 rounded-full text-graphite-500",
											"transition-[background-color,color,transform] duration-150 ease-out",
											"hover-supported:hover:bg-graphite-100 hover-supported:hover:text-graphite-900",
										)}
										aria-label={row.expanded ? "Schowaj nadpisania" : "Pokaż nadpisania"}
										aria-expanded={row.expanded}
										onClick={() => updateRow(row.staffId, {expanded: !row.expanded})}
									>
										<ChevronDown size={16} className={cn("transition-transform duration-150 ease-out", row.expanded && "rotate-180")} />
									</button>
								)}
							</div>
							<AnimatePresence>
								{row.assigned && row.expanded && (
									<motion.div
										className="border-t border-border-soft bg-warm/40"
										initial={{height: 0, opacity: 0}}
										animate={{height: "auto", opacity: 1, transition: {duration: 0.24, ease: EASE_OUT_QUINT}}}
										exit={{height: 0, opacity: 0, transition: {duration: 0.18, ease: [0.4, 0, 1, 1]}}}
									>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
											<div>
												<label className="block text-xs font-medium text-graphite-700 mb-1">
													Czas (min)
												</label>
												<input
													type="number"
													min={5}
													max={480}
													className="w-full h-10 px-3 text-sm bg-white border border-border-default rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500"
													placeholder={`${defaultDurationMin} (domyślnie)`}
													value={row.durationOverride}
													onChange={(e) => updateRow(row.staffId, {durationOverride: e.target.value})}
												/>
											</div>
											<div>
												<label className="block text-xs font-medium text-graphite-700 mb-1">
													Bufor (min)
												</label>
												<input
													type="number"
													min={0}
													max={120}
													className="w-full h-10 px-3 text-sm bg-white border border-border-default rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500"
													placeholder={`${defaultBufferAfterMin} (domyślnie)`}
													value={row.bufferOverride}
													onChange={(e) => updateRow(row.staffId, {bufferOverride: e.target.value})}
												/>
											</div>
											<div>
												<label className="block text-xs font-medium text-graphite-700 mb-1">
													Cena (zł)
												</label>
												<input
													type="text"
													inputMode="decimal"
													className="w-full h-10 px-3 text-sm bg-white border border-border-default rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500"
													placeholder={`${(defaultPriceGr / 100).toFixed(2)} (domyślnie)`}
													value={row.priceOverride}
													onChange={(e) => updateRow(row.staffId, {priceOverride: e.target.value})}
												/>
											</div>
										</div>
										<p className="text-[11px] text-graphite-500 px-4 pb-3">
											Domyślnie: {defaultDurationMin} min · bufor {defaultBufferAfterMin} min · {formatMoney(defaultPriceGr)}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</div>
			</div>

			<StickySaveBar open={isDirty} onDiscard={discard} onSave={handleSubmit} saving={submitting} />
		</>
	)
}
