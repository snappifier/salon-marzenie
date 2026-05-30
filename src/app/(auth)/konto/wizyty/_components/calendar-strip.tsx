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
	"w-[30px] h-[30px] rounded-full bg-transparent border border-border-soft flex items-center justify-center text-graphite-600",
	"transition-[border-color,color] duration-150 ease-out",
	"hover-supported:hover:border-rose-300 hover-supported:hover:text-rose-600 active:scale-[0.97]",
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
		<div className="bg-white border border-border-soft rounded-lg px-6 py-5.5 mb-6">
			<div className="flex justify-between items-center mb-4.5">
				<h3 className="font-serif font-medium text-lg text-graphite-900 tracking-[-0.01em]">
					{monthTitle} <em className="italic text-rose-600 font-normal">{yearTitle}</em>
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
								? "bg-graphite-900 border-transparent"
								: d.hasVisit
									? "bg-linear-to-b from-rose-50 to-white border-rose-100 hover-supported:hover:border-rose-300"
									: "bg-warm border-transparent hover-supported:hover:border-rose-300",
						)}
					>
						<span
							className={cn(
								"text-[10px] uppercase tracking-[0.12em] font-medium",
								d.today ? "text-rose-100" : "text-graphite-400",
							)}
						>
							{d.dow}
						</span>
						<span
							className={cn(
								"font-serif font-medium text-xl leading-none tracking-[-0.02em]",
								d.today ? "text-rose-100" : "text-graphite-900",
							)}
						>
							{d.dom}
						</span>
						{d.hasVisit && (
							<span
								className={cn(
									"w-1.25 h-1.25 rounded-full mt-auto",
									d.today ? "bg-rose-200" : "bg-rose-500",
								)}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
