// src/app/(auth)/konto/wizyty/_components/visit-tabs.tsx
"use client"

import {useState} from "react"
import {cn} from "@/lib/cn"

interface TabDef {
	key: string
	label: string
	count: number
}

interface Props {
	tabs: TabDef[]
	panels: Record<string, React.ReactNode>
}

export function VisitTabs({tabs, panels}: Props) {
	const [active, setActive] = useState(tabs[0]?.key ?? "")

	return (
		<>
			<div
				role="tablist"
				className="flex gap-1 border-b border-border-soft mb-7 overflow-x-auto scrollbar-none"
			>
				{tabs.map((tab) => {
					const isActive = tab.key === active
					return (
						<button
							key={tab.key}
							type="button"
							role="tab"
							aria-selected={isActive}
							onClick={() => setActive(tab.key)}
							className={cn(
								"flex items-center gap-2 px-4 pt-3 pb-3.5 text-sm font-medium whitespace-nowrap border-b-2",
								"transition-[color,border-color] duration-150 ease-out",
								isActive
									? "text-graphite-900 border-rose-500"
									: "text-graphite-400 border-transparent hover-supported:hover:text-graphite-900",
							)}
						>
							{tab.label}
							<span
								className={cn(
									"inline-block min-w-5 px-1.75 py-px text-[11px] font-medium rounded-full text-center",
									isActive ? "bg-rose-100 text-rose-700" : "bg-graphite-50 text-graphite-600",
								)}
							>
								{tab.count}
							</span>
						</button>
					)
				})}
			</div>

			{panels[active]}
		</>
	)
}
