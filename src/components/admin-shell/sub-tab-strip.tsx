// src/components/admin-shell/sub-tab-strip.tsx
"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useTransition} from "react"
import {TabStrip, type Tab} from "@/components/ui/tab-strip"

interface SubTabStripProps {
	className?: string
	tabs: Tab[]
	active: string
	paramName?: string
	defaultValue?: string
	layoutId?: string
	"aria-label"?: string
}

export function SubTabStrip({
	className,
	tabs,
	active,
	paramName = "sub",
	defaultValue,
	layoutId,
	"aria-label": ariaLabel,
}: SubTabStripProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [, startTransition] = useTransition()

	function setActive(id: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (id === defaultValue) params.delete(paramName)
		else params.set(paramName, id)
		params.delete("page")
		params.delete("q")
		params.delete("filter")
		params.delete("sort")
		const qs = params.toString()
		startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`))
	}

	return (
		<TabStrip
			className={className}
			tabs={tabs}
			active={active}
			onChange={setActive}
			layoutId={layoutId}
			aria-label={ariaLabel}
		/>
	)
}
