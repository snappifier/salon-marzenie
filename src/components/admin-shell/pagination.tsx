// src/components/admin-shell/pagination.tsx
"use client"

import Link from "next/link"
import {usePathname, useSearchParams} from "next/navigation"
import {ChevronLeft, ChevronRight} from "lucide-react"
import {cn} from "@/lib/cn"

interface PaginationProps {
	className?: string
	page: number
	totalPages: number
}

export function Pagination({className, page, totalPages}: PaginationProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	if (totalPages <= 1) return null

	function buildHref(p: number): string {
		const params = new URLSearchParams(searchParams.toString())
		if (p > 1) params.set("page", String(p))
		else params.delete("page")
		const qs = params.toString()
		return `${pathname}${qs ? `?${qs}` : ""}`
	}

	const hasPrev = page > 1
	const hasNext = page < totalPages

	return (
		<nav
			className={cn("flex items-center justify-between gap-3 text-sm", className)}
			aria-label="Paginacja"
		>
			<span className="text-graphite-600 tabular-nums">
				Strona <span className="font-medium text-graphite-900">{page}</span> z{" "}
				<span className="font-medium text-graphite-900">{totalPages}</span>
			</span>

			<div className="flex items-center gap-1.5">
				{hasPrev ? (
					<Link
						className={cn(
							"inline-flex items-center gap-1 h-9 pl-2 pr-3.5 rounded-full text-xs font-medium",
							"bg-white border border-border-soft text-graphite-900",
							"transition-[border-color,background-color,transform] duration-150 ease-out",
							"hover-supported:hover:border-rose-200 hover-supported:hover:bg-rose-50/40",
							"active:scale-[0.97]",
						)}
						href={buildHref(page - 1)}
						aria-label="Poprzednia strona"
					>
						<ChevronLeft size={14} />
						<span>Poprzednia</span>
					</Link>
				) : (
					<span
						className="inline-flex items-center gap-1 h-9 pl-2 pr-3.5 rounded-full text-xs font-medium bg-warm border border-border-soft text-graphite-400 cursor-not-allowed"
						aria-disabled="true"
					>
						<ChevronLeft size={14} />
						<span>Poprzednia</span>
					</span>
				)}

				{hasNext ? (
					<Link
						className={cn(
							"inline-flex items-center gap-1 h-9 pl-3.5 pr-2 rounded-full text-xs font-medium",
							"bg-white border border-border-soft text-graphite-900",
							"transition-[border-color,background-color,transform] duration-150 ease-out",
							"hover-supported:hover:border-rose-200 hover-supported:hover:bg-rose-50/40",
							"active:scale-[0.97]",
						)}
						href={buildHref(page + 1)}
						aria-label="Następna strona"
					>
						<span>Następna</span>
						<ChevronRight size={14} />
					</Link>
				) : (
					<span
						className="inline-flex items-center gap-1 h-9 pl-3.5 pr-2 rounded-full text-xs font-medium bg-warm border border-border-soft text-graphite-400 cursor-not-allowed"
						aria-disabled="true"
					>
						<span>Następna</span>
						<ChevronRight size={14} />
					</span>
				)}
			</div>
		</nav>
	)
}
