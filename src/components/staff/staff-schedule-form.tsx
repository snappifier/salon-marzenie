// src/components/staff/staff-schedule-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState, useTransition} from "react"
import {useToast} from "@/components/ui/toast"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {saveWorkingHoursJson} from "@/features/staff/schedule-actions"
import {cn} from "@/lib/cn"
import type {DayOfWeek, WorkingHours} from "@/generated/prisma/client"

interface StaffScheduleFormProps {
	staffId: string
	workingHours: WorkingHours[]
	salonOpenMin: number
	salonCloseMin: number
}

const DAYS: {key: DayOfWeek; label: string}[] = [
	{key: "MONDAY", label: "Poniedziałek"},
	{key: "TUESDAY", label: "Wtorek"},
	{key: "WEDNESDAY", label: "Środa"},
	{key: "THURSDAY", label: "Czwartek"},
	{key: "FRIDAY", label: "Piątek"},
	{key: "SATURDAY", label: "Sobota"},
	{key: "SUNDAY", label: "Niedziela"},
]

interface DayState {
	active: boolean
	start: string
	end: string
}

function minToTime(min: number): string {
	const h = Math.floor(min / 60)
	const m = min % 60
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function timeToMin(time: string): number {
	const [h, m] = time.split(":").map(Number)
	return h * 60 + m
}

function buildInitial(workingHours: WorkingHours[], openMin: number, closeMin: number): Record<DayOfWeek, DayState> {
	const byDay = new Map(workingHours.map((w) => [w.dayOfWeek, w]))
	const result = {} as Record<DayOfWeek, DayState>
	for (const {key} of DAYS) {
		const wh = byDay.get(key)
		result[key] = wh
			? {active: true, start: minToTime(wh.startMin), end: minToTime(wh.endMin)}
			: {active: false, start: minToTime(openMin), end: minToTime(closeMin)}
	}
	return result
}

function statesEqual(a: Record<DayOfWeek, DayState>, b: Record<DayOfWeek, DayState>): boolean {
	return DAYS.every(({key}) =>
		a[key].active === b[key].active && a[key].start === b[key].start && a[key].end === b[key].end,
	)
}

export function StaffScheduleForm({staffId, workingHours, salonOpenMin, salonCloseMin}: StaffScheduleFormProps) {
	const router = useRouter()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [initial, setInitial] = useState(() => buildInitial(workingHours, salonOpenMin, salonCloseMin))
	const [days, setDays] = useState(initial)
	const [submitting, setSubmitting] = useState(false)
	const isDirty = !statesEqual(initial, days)

	const salonRange = `${minToTime(salonOpenMin)}–${minToTime(salonCloseMin)}`

	function updateDay(key: DayOfWeek, patch: Partial<DayState>) {
		setDays((prev) => ({...prev, [key]: {...prev[key], ...patch}}))
	}

	async function handleSubmit() {
		for (const {key, label} of DAYS) {
			const d = days[key]
			if (!d.active) continue
			const start = timeToMin(d.start)
			const end = timeToMin(d.end)
			if (end <= start) {
				toast.error(`${label}: koniec pracy musi być po początku`)
				return
			}
			if (start < salonOpenMin || end > salonCloseMin) {
				toast.error(`${label}: godziny muszą mieścić się w godzinach salonu (${salonRange})`)
				return
			}
		}

		setSubmitting(true)
		try {
			const entries = DAYS.map(({key}) => ({
				dayOfWeek: key,
				active: days[key].active,
				startMin: timeToMin(days[key].start),
				endMin: timeToMin(days[key].end),
			}))
			const r = await saveWorkingHoursJson(staffId, entries)
			if (!r.success) {
				toast.error(r.error)
				return
			}
			toast.success("Zapisano grafik")
			setInitial(days)
			startTransition(() => router.refresh())
		} finally {
			setSubmitting(false)
		}
	}

	function discard() {
		setDays(initial)
	}

	return (
		<>
			<div className="flex flex-col gap-3 pb-32">
				<p className="text-sm text-graphite-600">
					Ustaw godziny pracy w poszczególne dni. Muszą mieścić się w godzinach otwarcia salonu:{" "}
					<span className="font-medium text-graphite-900 tabular-nums">{salonRange}</span>.
				</p>

				<div className="flex flex-col gap-2">
					{DAYS.map(({key, label}) => {
						const d = days[key]
						return (
							<div
								key={key}
								className={cn(
									"rounded-2xl border bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3",
									d.active ? "border-rose-200/60" : "border-border-soft",
								)}
							>
								<label className="flex items-center gap-3 cursor-pointer sm:w-44 shrink-0">
									<span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
										<input
											className="peer sr-only"
											type="checkbox"
											checked={d.active}
											onChange={(e) => updateDay(key, {active: e.target.checked})}
										/>
										<span className="absolute inset-0 rounded-md border border-border-default bg-white transition-[background-color,border-color] duration-150 ease-out peer-checked:bg-rose-600 peer-checked:border-rose-600 peer-focus-visible:ring-3 peer-focus-visible:ring-rose-500/25" aria-hidden="true" />
										<svg className="relative w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-150 ease-out peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
									</span>
									<span className={cn("text-sm font-medium", d.active ? "text-graphite-900" : "text-graphite-500")}>
										{label}
									</span>
								</label>

								{d.active ? (
									<div className="flex items-center gap-2 flex-1">
										<input
											className="h-10 px-3 text-sm bg-white border border-border-default rounded-md tabular-nums focus:outline-none focus:ring-3 focus:ring-rose-500/15 focus:border-rose-500"
											type="time"
											value={d.start}
											min={minToTime(salonOpenMin)}
											max={minToTime(salonCloseMin)}
											step={300}
											onChange={(e) => updateDay(key, {start: e.target.value})}
											aria-label={`${label} - początek`}
										/>
										<span className="text-graphite-400">–</span>
										<input
											className="h-10 px-3 text-sm bg-white border border-border-default rounded-md tabular-nums focus:outline-none focus:ring-3 focus:ring-rose-500/15 focus:border-rose-500"
											type="time"
											value={d.end}
											min={minToTime(salonOpenMin)}
											max={minToTime(salonCloseMin)}
											step={300}
											onChange={(e) => updateDay(key, {end: e.target.value})}
											aria-label={`${label} - koniec`}
										/>
									</div>
								) : (
									<span className="text-sm text-graphite-400 italic flex-1">Dzień wolny</span>
								)}
							</div>
						)
					})}
				</div>
			</div>

			<StickySaveBar open={isDirty} onDiscard={discard} onSave={handleSubmit} saving={submitting} />
		</>
	)
}
