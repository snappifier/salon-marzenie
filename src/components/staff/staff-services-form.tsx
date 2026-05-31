// src/components/staff/staff-services-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useMemo, useState, useTransition} from "react"
import {ChevronDown, Sparkles} from "lucide-react"
import {motion, AnimatePresence} from "motion/react"
import {CheckboxField} from "@/components/ui/checkbox-field"
import {EmptyState} from "@/components/ui/empty-state"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {useToast} from "@/components/ui/toast"
import {saveStaffServicesJson} from "@/features/staff/services-actions"
import {formatMoney} from "@/lib/money"
import {cn} from "@/lib/cn"
import type {StaffServiceAssignment} from "@/features/staff/queries"

interface StaffServicesFormProps {
	staffId: string
	assignments: StaffServiceAssignment[]
}

interface RowState {
	serviceId: string
	name: string
	categoryName: string
	defaultDurationMin: number
	defaultBufferAfterMin: number
	defaultPriceGr: number
	assigned: boolean
	durationOverride: string
	bufferOverride: string
	priceOverride: string
	expanded: boolean
}

function toRowState(a: StaffServiceAssignment): RowState {
	return {
		serviceId: a.serviceId,
		name: a.name,
		categoryName: a.categoryName,
		defaultDurationMin: a.defaultDurationMin,
		defaultBufferAfterMin: a.defaultBufferAfterMin,
		defaultPriceGr: a.defaultPriceGr,
		assigned: a.assigned,
		durationOverride: a.durationOverrideMin !== null ? String(a.durationOverrideMin) : "",
		bufferOverride: a.bufferOverrideMin !== null ? String(a.bufferOverrideMin) : "",
		priceOverride: a.priceOverrideGr !== null ? (a.priceOverrideGr / 100).toFixed(2) : "",
		expanded: false,
	}
}

function dirtyKey(r: RowState): string {
	return `${r.assigned}|${r.durationOverride}|${r.bufferOverride}|${r.priceOverride}`
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function StaffServicesForm({staffId, assignments}: StaffServicesFormProps) {
	const router = useRouter()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [initial, setInitial] = useState<RowState[]>(() => assignments.map(toRowState))
	const [rows, setRows] = useState<RowState[]>(initial)
	const [submitting, setSubmitting] = useState(false)

	const grouped = useMemo(() => {
		const map = new Map<string, RowState[]>()
		for (const r of rows) {
			const list = map.get(r.categoryName) ?? []
			list.push(r)
			map.set(r.categoryName, list)
		}
		return Array.from(map.entries())
	}, [rows])

	const isDirty = rows.some((r, idx) => dirtyKey(r) !== dirtyKey(initial[idx]))

	function updateRow(serviceId: string, patch: Partial<RowState>) {
		setRows((prev) => prev.map((r) => (r.serviceId === serviceId ? {...r, ...patch} : r)))
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
				return {
					serviceId: r.serviceId,
					assigned: r.assigned,
					durationOverrideMin: duration,
					bufferOverrideMin: buffer,
					priceOverrideGr: priceZl === null ? null : Math.round(priceZl * 100),
				}
			})
			const r = await saveStaffServicesJson(staffId, payload)
			if (!r.success) {
				toast.error(r.error)
				return
			}
			toast.success("Zapisano przypisania usług")
			setInitial(rows)
			startTransition(() => router.refresh())
		} finally {
			setSubmitting(false)
		}
	}

	if (rows.length === 0) {
		return (
			<EmptyState
				icon={<Sparkles size={24} />}
				title="Brak usług"
				description="Dodaj najpierw usługi w sekcji Oferta, żeby przypisać je do pracownika."
				action={{label: "Przejdź do Oferty", href: "/admin/oferta"}}
			/>
		)
	}

	return (
		<>
			<div className="flex flex-col gap-5 pb-32">
				<p className="text-sm text-graphite-600">
					Zaznacz usługi, które wykonuje ten pracownik. Rozwiń wiersz, żeby nadpisać domyślny czas lub cenę.
				</p>

				{grouped.map(([categoryName, categoryRows]) => (
					<div key={categoryName} className="flex flex-col gap-2">
						<h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-600 px-1">
							{categoryName}
						</h3>
						{categoryRows.map((row) => (
							<div
								key={row.serviceId}
								className={cn(
									"rounded-2xl border overflow-hidden bg-white",
									row.assigned ? "border-rose-200/60" : "border-border-soft",
								)}
							>
								<div className="flex items-center gap-3 p-4">
									<CheckboxField
										className="flex-1"
										label={row.name}
										description={`${row.defaultDurationMin} min · ${formatMoney(row.defaultPriceGr)}`}
										checked={row.assigned}
										onChange={(e) => updateRow(row.serviceId, {assigned: e.target.checked})}
									/>
									{row.assigned && (
										<button
											type="button"
											className={cn(
												"inline-flex items-center justify-center w-9 h-9 rounded-full text-graphite-500 shrink-0",
												"transition-[background-color,color] duration-150 ease-out",
												"hover-supported:hover:bg-graphite-100 hover-supported:hover:text-graphite-900",
											)}
											aria-label={row.expanded ? "Schowaj nadpisania" : "Pokaż nadpisania"}
											aria-expanded={row.expanded}
											onClick={() => updateRow(row.serviceId, {expanded: !row.expanded})}
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
													<label htmlFor={`duration-${row.serviceId}`} className="block text-xs font-medium text-graphite-700 mb-1">Czas (min)</label>
													<input
														id={`duration-${row.serviceId}`}
														type="number"
														min={5}
														max={480}
														className="w-full h-10 px-3 text-sm bg-white border border-border-default rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500"
														placeholder={`${row.defaultDurationMin} (domyślnie)`}
														value={row.durationOverride}
														onChange={(e) => updateRow(row.serviceId, {durationOverride: e.target.value})}
													/>
												</div>
												<div>
													<label htmlFor={`buffer-${row.serviceId}`} className="block text-xs font-medium text-graphite-700 mb-1">Bufor (min)</label>
													<input
														id={`buffer-${row.serviceId}`}
														type="number"
														min={0}
														max={120}
														className="w-full h-10 px-3 text-sm bg-white border border-border-default rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500"
														placeholder={`${row.defaultBufferAfterMin} (domyślnie)`}
														value={row.bufferOverride}
														onChange={(e) => updateRow(row.serviceId, {bufferOverride: e.target.value})}
													/>
												</div>
												<div>
													<label htmlFor={`price-${row.serviceId}`} className="block text-xs font-medium text-graphite-700 mb-1">Cena (zł)</label>
													<input
														id={`price-${row.serviceId}`}
														type="text"
														inputMode="decimal"
														className="w-full h-10 px-3 text-sm bg-white border border-border-default rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500"
														placeholder={`${(row.defaultPriceGr / 100).toFixed(2)} (domyślnie)`}
														value={row.priceOverride}
														onChange={(e) => updateRow(row.serviceId, {priceOverride: e.target.value})}
													/>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						))}
					</div>
				))}
			</div>

			<StickySaveBar open={isDirty} onDiscard={discard} onSave={handleSubmit} saving={submitting} />
		</>
	)
}
