// src/components/admin-shell/filter-pills.tsx
"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useTransition} from "react"
import {cn} from "@/lib/cn"

export interface FilterPillOption {
	value: string
	label: string
	badge?: number | string
}

interface FilterPillsProps {
	className?: string
	options: FilterPillOption[]
	active: string
	paramName?: string
	"aria-label"?: string
}

export function FilterPills({className, options, active, paramName = "filter", "aria-label": ariaLabel}: FilterPillsProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [, startTransition] = useTransition()

	function setFilter(value: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (value && value !== options[0].value) params.set(paramName, value)
		else params.delete(paramName)
		params.delete("page")
		const qs = params.toString()
		startTransition(() => {
			router.push(`${pathname}${qs ? `?${qs}` : ""}`)
		})
	}

	return (
		<div className={cn("inline-flex items-center gap-1 p-1 rounded-full bg-warm border border-border-soft", className)} role="group" aria-label={ariaLabel}>
			{options.map((opt) => {
				const isActive = opt.value === active
				return (
					<button
						key={opt.value}
						type="button"
						aria-pressed={isActive}
						onClick={() => setFilter(opt.value)}
						className={cn(
							"inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium whitespace-nowrap",
							"transition-[background-color,color,box-shadow] duration-150 ease-out",
							isActive
								? "bg-white text-rose-700 shadow-xs ring-1 ring-rose-200/60"
								: "text-graphite-600 hover-supported:hover:text-graphite-900",
						)}
					>
						<span>{opt.label}</span>
						{opt.badge !== undefined && (
							<span
								className={cn(
									"inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] tabular-nums font-medium",
									isActive ? "bg-rose-100 text-rose-700" : "bg-graphite-100 text-graphite-600",
								)}
							>
								{opt.badge}
							</span>
						)}
					</button>
				)
			})}
		</div>
	)
}
