// src/app/(auth)/konto/dane-osobowe/_components/profile-toc.tsx
"use client"

import {useEffect, useState} from "react"
import {Phone, ShieldCheck, User} from "lucide-react"
import {cn} from "@/lib/cn"

const items = [
	{id: "basic", label: "Dane podstawowe", icon: User},
	{id: "contact", label: "Kontakt", icon: Phone},
	{id: "gdpr", label: "RODO i prywatność", icon: ShieldCheck},
]

export function ProfileToc() {
	const [active, setActive] = useState("basic")

	useEffect(() => {
		const sections = items
			.map((i) => document.getElementById(i.id))
			.filter((el): el is HTMLElement => el !== null)
		if (!sections.length) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id)
				}
			},
			{rootMargin: "-25% 0px -65% 0px", threshold: 0},
		)
		sections.forEach((s) => observer.observe(s))
		return () => observer.disconnect()
	}, [])

	function handleClick(e: React.MouseEvent, id: string) {
		e.preventDefault()
		const el = document.getElementById(id)
		if (el) {
			el.scrollIntoView({behavior: "smooth", block: "start"})
			setActive(id)
		}
	}

	return (
		<aside className="bg-surface border border-border-subtle rounded-lg p-3.5 lg:sticky lg:top-6">
			<p className="text-[10px] uppercase tracking-[0.18em] text-secondary font-medium px-2.5 pt-1.5 pb-2.5">
				W tej sekcji
			</p>
			<nav className="flex flex-col gap-0.5">
				{items.map((item) => {
					const isActive = item.id === active
					const Icon = item.icon
					return (
						<a
							key={item.id}
							href={`#${item.id}`}
							onClick={(e) => handleClick(e, item.id)}
							className={cn(
								"flex items-center gap-2.5 px-2.5 py-2.25 text-[13px] font-medium rounded-md",
								"transition-[background-color,color] duration-150 ease-out",
								isActive
									? "bg-paper-300 text-primary [&_svg]:text-interactive"
									: "text-secondary [&_svg]:text-secondary hover-supported:hover:bg-surface-muted hover-supported:hover:text-primary",
							)}
							aria-current={isActive ? "true" : undefined}
						>
							<Icon size={14} strokeWidth={1.6} />
							{item.label}
						</a>
					)
				})}
			</nav>
		</aside>
	)
}
