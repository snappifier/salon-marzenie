// src/components/dashboard/week-heatmap.tsx
"use client"

import Link from "next/link"
import {cn} from "@/lib/cn"

interface WeekHeatmapProps {
	className?: string
	heatmap: number[][]
	hours: number[]
	dayLabels: {short: string; long: string}[]
	weekDates: {iso: string; dayNum: number}[]
}

export function WeekHeatmap({className, heatmap, hours, dayLabels, weekDates}: WeekHeatmapProps) {
	const max = Math.max(1, ...heatmap.flat())

	return (
		<div className={cn("overflow-x-auto scrollbar-none -mx-2 px-2", className)}>
			<div
				className="grid gap-1 min-w-[480px]"
				style={{
					gridTemplateColumns: "auto repeat(7, minmax(2.25rem, 1fr))",
					gridTemplateRows: `auto repeat(${hours.length}, 1.4rem)`,
				}}
				role="grid"
				aria-label="Heatmap obłożenia tygodnia"
			>
				<div role="presentation" />
				{dayLabels.map((d, idx) => (
					<div
						key={d.short}
						className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-graphite-600 leading-tight tabular-nums"
						role="columnheader"
					>
						<div>{d.short}</div>
						<div className="text-graphite-400 font-normal mt-0.5">{weekDates[idx]?.dayNum}</div>
					</div>
				))}

				{hours.map((hour, hourIdx) => (
					<div className="contents" key={hour}>
						<div
							className="text-[10px] text-graphite-500 pr-2 tabular-nums text-right self-center leading-none"
							role="rowheader"
						>
							{String(hour).padStart(2, "0")}
						</div>
						{dayLabels.map((day, dayIdx) => {
							const count = heatmap[dayIdx]?.[hourIdx] ?? 0
							const intensity = max === 0 ? 0 : count / max
							const iso = weekDates[dayIdx]?.iso
							const opacity = count === 0 ? 0 : Math.max(0.18, intensity)
							return (
								<Link
									key={`${dayIdx}-${hourIdx}`}
									className={cn(
										"relative rounded-md group",
										"transition-[opacity,transform] duration-150 ease-out",
										"hover-supported:hover:scale-105 active:scale-[0.97]",
										count === 0 ? "bg-warm" : "bg-rose-500",
									)}
									style={count > 0 ? {opacity} : undefined}
									href={`/admin/kalendarz?date=${iso}&hour=${String(hour).padStart(2, "0")}`}
									title={`${day.long}, ${String(hour).padStart(2, "0")}:00 — ${count} ${count === 1 ? "wizyta" : "wizyt"}`}
									aria-label={`${day.long}, godzina ${String(hour).padStart(2, "0")}:00, ${count} ${count === 1 ? "wizyta" : "wizyt"}`}
								>
									<span className="sr-only">{count}</span>
								</Link>
							)
						})}
					</div>
				))}
			</div>
		</div>
	)
}
