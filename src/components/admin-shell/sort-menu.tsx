// src/components/admin-shell/sort-menu.tsx
"use client"

import {useEffect, useRef, useState, useTransition} from "react"
import {AnimatePresence, motion} from "motion/react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {ArrowUpDown, Check} from "lucide-react"
import {cn} from "@/lib/cn"

export interface SortOption {
	value: string
	label: string
}

interface SortMenuProps {
	className?: string
	options: SortOption[]
	active: string
	paramName?: string
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function SortMenu({className, options, active, paramName = "sort"}: SortMenuProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [open, setOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [, startTransition] = useTransition()

	const activeLabel = options.find((o) => o.value === active)?.label ?? options[0]?.label

	useEffect(() => {
		if (!open) return
		function onPointerDown(e: PointerEvent) {
			if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false)
		}
		document.addEventListener("pointerdown", onPointerDown)
		document.addEventListener("keydown", onKey)
		return () => {
			document.removeEventListener("pointerdown", onPointerDown)
			document.removeEventListener("keydown", onKey)
		}
	}, [open])

	function setSort(value: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (value && value !== options[0].value) params.set(paramName, value)
		else params.delete(paramName)
		params.delete("page")
		const qs = params.toString()
		startTransition(() => {
			router.push(`${pathname}${qs ? `?${qs}` : ""}`)
		})
		setOpen(false)
	}

	return (
		<div ref={wrapperRef} className={cn("relative", className)}>
			<button
				type="button"
				className={cn(
					"inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-medium",
					"bg-white border border-border-soft text-graphite-900",
					"transition-[border-color,background-color] duration-150 ease-out",
					"hover-supported:hover:border-rose-200 hover-supported:hover:bg-rose-50/40",
					"active:scale-[0.97]",
				)}
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<ArrowUpDown size={14} className="text-graphite-500" aria-hidden="true" />
				<span className="text-graphite-600 hidden sm:inline">Sortuj:</span>
				<span>{activeLabel}</span>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white shadow-lg border border-border-soft overflow-hidden origin-top-right z-30"
						role="menu"
						initial={{opacity: 0, scale: 0.96, y: -4}}
						animate={{opacity: 1, scale: 1, y: 0, transition: {duration: 0.18, ease: EASE_OUT_QUINT}}}
						exit={{opacity: 0, scale: 0.96, y: -4, transition: {duration: 0.14, ease: [0.4, 0, 1, 1]}}}
					>
						{options.map((opt) => {
							const isActive = opt.value === active
							return (
								<button
									key={opt.value}
									type="button"
									role="menuitemradio"
									aria-checked={isActive}
									className={cn(
										"w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left",
										"transition-[background-color] duration-150 ease-out",
										"hover-supported:hover:bg-rose-50/60",
										isActive ? "text-rose-700 font-medium" : "text-graphite-900",
									)}
									onClick={() => setSort(opt.value)}
								>
									<span>{opt.label}</span>
									{isActive && <Check size={14} className="text-rose-600" />}
								</button>
							)
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
