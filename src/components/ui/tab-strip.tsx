// src/components/ui/tab-strip.tsx
"use client"

import {motion} from "motion/react"
import {cn} from "@/lib/cn"

export interface Tab {
	id: string
	label: string
	badge?: number | string
}

interface TabStripProps {
	className?: string
	tabs: Tab[]
	active: string
	onChange: (id: string) => void
	layoutId?: string
	"aria-label"?: string
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Per WAI-ARIA APG (Tabs Pattern). Wrap ArrowLeft/Right, Home/End → first/last.
// Inne klawisze → bez zmiany. Pure function żeby vitest mógł testować bez DOM.
export function nextTabIndex(currentIndex: number, total: number, key: string): number {
	if (total === 0) return currentIndex
	switch (key) {
		case "ArrowRight":
			return (currentIndex + 1) % total
		case "ArrowLeft":
			return (currentIndex - 1 + total) % total
		case "Home":
			return 0
		case "End":
			return total - 1
		default:
			return currentIndex
	}
}

const NAV_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End"])

export function TabStrip({
	className,
	tabs,
	active,
	onChange,
	layoutId = "tab-strip-underline",
	"aria-label": ariaLabel,
}: TabStripProps) {
	function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
		if (!NAV_KEYS.has(e.key)) return
		e.preventDefault()
		const next = nextTabIndex(index, tabs.length, e.key)
		if (next === index) return
		const nextId = tabs[next].id
		onChange(nextId)
		// Focus po flush state — nowy button zyska tabIndex=0 i może otrzymać focus.
		setTimeout(() => {
			document.getElementById(`tab-${nextId}`)?.focus()
		}, 0)
	}

	return (
		<div
			className={cn(
				"relative border-b border-border-soft",
				"overflow-x-auto scrollbar-none -mx-1",
				className,
			)}
			role="tablist"
			aria-label={ariaLabel}
		>
			<div className="inline-flex items-stretch gap-6 px-1 min-w-full">
				{tabs.map((tab, idx) => {
					const isActive = tab.id === active
					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							aria-controls={`panel-${tab.id}`}
							id={`tab-${tab.id}`}
							tabIndex={isActive ? 0 : -1}
							onClick={() => onChange(tab.id)}
							onKeyDown={(e) => handleKeyDown(e, idx)}
							className={cn(
								"relative shrink-0 inline-flex items-center gap-2 pb-3 pt-2 text-sm font-medium whitespace-nowrap",
								"transition-[color] duration-150 ease-out",
								isActive
									? "text-rose-600"
									: "text-graphite-600 hover-supported:hover:text-graphite-900",
							)}
						>
							<span>{tab.label}</span>
							{tab.badge !== undefined && (
								<span
									className={cn(
										"inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] tabular-nums font-medium",
										"transition-[background-color,color] duration-150 ease-out",
										isActive
											? "bg-rose-100 text-rose-700"
											: "bg-graphite-100 text-graphite-600",
									)}
								>
									{tab.badge}
								</span>
							)}
							{isActive && (
								<motion.span
									className="absolute left-0 right-0 -bottom-px h-[2px] bg-rose-600 rounded-full"
									layoutId={layoutId}
									transition={{duration: 0.24, ease: EASE_OUT_QUINT}}
									aria-hidden="true"
								/>
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
