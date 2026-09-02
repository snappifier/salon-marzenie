// src/app/(auth)/konto/wizyty/_components/calendar-strip.tsx
"use client"

import {useMemo, useState} from "react"
import {addDays, addWeeks, format, parseISO, startOfWeek} from "date-fns"
import {pl} from "date-fns/locale"
import {ChevronLeft, ChevronRight} from "lucide-react"
import {cn} from "@/lib/cn"

interface Props {
	todayIso: string
	visitDays: string[]
}

const DOW_LABELS = ["Pon", "Wt", "Śr", "Czw", "Pią", "Sob", "Nd"]
const VISIBLE_DAYS = 14

const navBtn = cn(
	"w-[30px] h-[30px] rounded-full bg-transparent border border-border-subtle flex items-center justify-center text-secondary",
	"transition-[border-color,color] duration-150 ease-out",
	"hover-supported:hover:border-accent-100 hover-supported:hover:text-interactive active:scale-[0.97]",
)

export function CalendarStrip({todayIso, visitDays}: Props) {
	const [weekOffset, setWeekOffset] = useState(0)
	const visitSet = useMemo(() => new Set(visitDays), [visitDays])

	const today = parseISO(todayIso)
	const start = addWeeks(startOfWeek(today, {weekStartsOn: 1}), weekOffset)

	const days = Array.from({length: VISIBLE_DAYS}, (_, i) => {
		const date = addDays(start, i)
		const iso = format(date, "yyyy-MM-dd")
		return {
			iso,
			dom: format(date, "d"),
			dow: DOW_LABELS[i % 7],
			today: iso === todayIso,
			hasVisit: visitSet.has(iso),
		}
	})

	const monthLabel = format(start, "LLLL", {locale: pl})
	const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
	const yearTitle = format(start, "yyyy")

	return (
		<div className="bg-surface border border-border-subtle rounded-lg px-6 py-5.5 mb-6">
			<div className="flex justify-between items-center mb-4.5">
				<h3 className="font-display font-medium text-lg text-primary tracking-[-0.01em]">
					{monthTitle} <em className="italic text-interactive font-normal">{yearTitle}</em>
				</h3>
				<div className="flex gap-1">
					<button
						type="button"
						aria-label="Poprzedni tydzień"
						className={navBtn}
						onClick={() => setWeekOffset((o) => o - 1)}
					>
						<ChevronLeft size={14} strokeWidth={2} />
					</button>
					<button
						type="button"
						aria-label="Następny tydzień"
						className={navBtn}
						onClick={() => setWeekOffset((o) => o + 1)}
					>
						<ChevronRight size={14} strokeWidth={2} />
					</button>
				</div>
			</div>

			<div className="grid grid-cols-7 gap-2">
				{days.map((d) => (
					<div
						key={d.iso}
						className={cn(
							"aspect-[1/1.1] min-h-16 rounded-md px-1.5 pt-2 pb-1.5 flex flex-col items-center gap-1 border",
							"transition-[border-color,background-color] duration-150 ease-out",
							d.today
								? "bg-ink-900 border-transparent"
								: d.hasVisit
									? "bg-linear-to-b from-surface-muted to-surface border-accent-100 hover-supported:hover:border-accent-100"
									: "bg-paper-300 border-transparent hover-supported:hover:border-accent-100",
						)}
					>
						<span
							className={cn(
								"text-[10px] uppercase tracking-[0.18em] font-medium",
								d.today ? "text-accent-100" : "text-secondary",
							)}
						>
							{d.dow}
						</span>
						<span
							className={cn(
								"font-display font-medium text-xl leading-none tracking-[-0.02em]",
								d.today ? "text-accent-100" : "text-primary",
							)}
						>
							{d.dom}
						</span>
						{d.hasVisit && (
							<span
								className={cn(
									"w-1.25 h-1.25 rounded-full mt-auto",
									d.today ? "bg-accent-100" : "bg-interactive",
								)}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
