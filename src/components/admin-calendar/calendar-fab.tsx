// src/components/admin-calendar/calendar-fab.tsx
"use client"

import {Plus} from "lucide-react"
import {cn} from "@/lib/cn"

interface CalendarFabProps {
	onClick: () => void
}

export function CalendarFab({onClick}: CalendarFabProps) {
	return (
		<button
			className={cn(
				"fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full md:hidden",
				"bg-rose-600 text-white shadow-lg",
				"transition-[background-color,transform] duration-150 ease-out",
				"hover-supported:hover:bg-rose-700 active:scale-95",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
			)}
			type="button"
			aria-label="Nowa rezerwacja"
			onClick={onClick}
		>
			<Plus size={24} strokeWidth={2.25} />
		</button>
	)
}
