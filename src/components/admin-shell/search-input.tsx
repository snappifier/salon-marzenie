// src/components/admin-shell/search-input.tsx
"use client"

import {useEffect, useRef, useState, useTransition} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {Search, X} from "lucide-react"
import {cn} from "@/lib/cn"

interface SearchInputProps {
	className?: string
	placeholder?: string
	paramName?: string
}

export function SearchInput({className, placeholder = "Szukaj...", paramName = "q"}: SearchInputProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [value, setValue] = useState(searchParams.get(paramName) ?? "")
	const [, startTransition] = useTransition()
	const timeoutRef = useRef<number | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setValue(searchParams.get(paramName) ?? "")
	}, [searchParams, paramName])

	function pushUpdate(next: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (next.trim()) params.set(paramName, next.trim())
		else params.delete(paramName)
		params.delete("page")
		const qs = params.toString()
		startTransition(() => {
			router.push(`${pathname}${qs ? `?${qs}` : ""}`)
		})
	}

	function handleChange(next: string) {
		setValue(next)
		if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
		timeoutRef.current = window.setTimeout(() => pushUpdate(next), 250)
	}

	function handleClear() {
		if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
		setValue("")
		pushUpdate("")
		inputRef.current?.focus()
	}

	return (
		<div className={cn("relative", className)}>
			<Search
				className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-400 pointer-events-none"
				size={16}
				aria-hidden="true"
			/>
			<input
				ref={inputRef}
				className={cn(
					"w-full h-11 pl-10 pr-10 text-sm bg-white border border-border-default rounded-full text-graphite-900",
					"transition-[border-color,box-shadow] duration-150 ease-out",
					"placeholder:text-graphite-400",
					"focus:outline-none focus:ring-3 focus:ring-rose-500/15 focus:border-rose-500",
				)}
				type="search"
				value={value}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
			/>
			{value && (
				<button
					className={cn(
						"absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-full text-graphite-400",
						"transition-[background-color,color] duration-150 ease-out",
						"hover-supported:hover:bg-graphite-100 hover-supported:hover:text-graphite-700",
						"active:scale-[0.94]",
					)}
					type="button"
					aria-label="Wyczyść"
					onClick={handleClear}
				>
					<X size={14} />
				</button>
			)}
		</div>
	)
}
