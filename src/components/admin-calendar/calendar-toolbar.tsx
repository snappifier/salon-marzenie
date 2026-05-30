// src/components/admin-calendar/calendar-toolbar.tsx
"use client"

import {ChevronLeft, ChevronRight, Plus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/cn"
import type {ResourceMode, ViewMode} from "./calendar-types"

interface CalendarToolbarProps {
	title: string
	titleShort: string
	view: ViewMode
	resourceMode: ResourceMode
	eventCount: number
	loading: boolean
	onPrev: () => void
	onNext: () => void
	onToday: () => void
	onViewChange: (view: ViewMode) => void
	onResourceModeChange: (mode: ResourceMode) => void
	onAdd: () => void
}

const VIEW_OPTIONS: Array<{id: ViewMode; label: string}> = [
	{id: "day", label: "Dzień"},
	{id: "week", label: "Tydzień"},
	{id: "month", label: "Miesiąc"},
]

const navButtonBase = cn(
	"inline-flex items-center justify-center rounded-full border border-border-soft bg-white text-graphite-700",
	"transition-[background-color,border-color,transform] duration-150 ease-out",
	"hover-supported:hover:border-graphite-300 hover-supported:hover:bg-warm active:scale-[0.94]",
)

const todayButtonBase = cn(
	"inline-flex items-center rounded-full border border-border-soft bg-white px-3.5 text-sm font-medium text-graphite-700",
	"transition-[background-color,border-color,transform] duration-150 ease-out",
	"hover-supported:hover:border-graphite-300 hover-supported:hover:bg-warm active:scale-[0.97]",
)

export function CalendarToolbar({
	title,
	titleShort,
	view,
	resourceMode,
	eventCount,
	loading,
	onPrev,
	onNext,
	onToday,
	onViewChange,
	onResourceModeChange,
	onAdd,
}: CalendarToolbarProps) {
	return (
		<div className="flex flex-col gap-3">
			{/* MOBILE (<md): dwa rzędy, "+ Nowa" przeniesione do FAB */}
			<div className="flex flex-col gap-2.5 md:hidden">
				<div className="flex items-center gap-2">
					<button
						className={cn(navButtonBase, "h-11 w-11 shrink-0")}
						type="button"
						aria-label="Poprzedni"
						onClick={onPrev}
					>
						<ChevronLeft size={18} />
					</button>
					<span className="min-w-0 truncate font-serif text-base text-graphite-900">{titleShort}</span>
					<button
						className={cn(navButtonBase, "h-11 w-11 shrink-0")}
						type="button"
						aria-label="Następny"
						onClick={onNext}
					>
						<ChevronRight size={18} />
					</button>
					<button className={cn(todayButtonBase, "ml-auto h-11 shrink-0")} type="button" onClick={onToday}>
						Dzisiaj
					</button>
				</div>
				<ViewSwitcher view={view} onViewChange={onViewChange} full />
				{view === "day" && (
					<div className="flex w-full rounded-full border border-border-soft bg-white p-0.5">
						<ResourcePill full active={resourceMode === "combined"} onClick={() => onResourceModeChange("combined")}>
							Łącznie
						</ResourcePill>
						<ResourcePill full active={resourceMode === "perStaff"} onClick={() => onResourceModeChange("perStaff")}>
							Per pracownik
						</ResourcePill>
					</div>
				)}
			</div>

			{/* DESKTOP (>=md): jeden rząd, bez zmian względem desktopu */}
			<div className="hidden md:flex md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<button className={cn(navButtonBase, "h-9 w-9")} type="button" aria-label="Poprzedni" onClick={onPrev}>
						<ChevronLeft size={18} />
					</button>
					<button className={cn(navButtonBase, "h-9 w-9")} type="button" aria-label="Następny" onClick={onNext}>
						<ChevronRight size={18} />
					</button>
					<button className={cn(todayButtonBase, "h-9")} type="button" onClick={onToday}>
						Dzisiaj
					</button>
					<div className="ml-1 flex min-w-0 items-baseline gap-2">
						<span className="truncate font-serif text-lg text-graphite-900">{title}</span>
						<span
							className={cn(
								"shrink-0 text-xs tabular-nums text-graphite-400 transition-opacity duration-150",
								loading && "opacity-40",
							)}
						>
							· {visitsLabel(eventCount)}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<ViewSwitcher view={view} onViewChange={onViewChange} />

					{view === "day" && (
						<div className="inline-flex rounded-full border border-border-soft bg-white p-0.5">
							<ResourcePill
								active={resourceMode === "combined"}
								onClick={() => onResourceModeChange("combined")}
							>
								Łącznie
							</ResourcePill>
							<ResourcePill
								active={resourceMode === "perStaff"}
								onClick={() => onResourceModeChange("perStaff")}
							>
								Per pracownik
							</ResourcePill>
						</div>
					)}

					<Button size="sm" onClick={onAdd}>
						<Plus size={15} strokeWidth={2.25} />
						<span>Nowa rezerwacja</span>
					</Button>
				</div>
			</div>
		</div>
	)
}

function ViewSwitcher({
	view,
	onViewChange,
	full,
}: {
	view: ViewMode
	onViewChange: (view: ViewMode) => void
	full?: boolean
}) {
	return (
		<div className={cn("rounded-full border border-border-soft bg-white p-0.5", full ? "flex w-full" : "inline-flex")}>
			{VIEW_OPTIONS.map((opt) => (
				<button
					key={opt.id}
					type="button"
					onClick={() => onViewChange(opt.id)}
					aria-pressed={view === opt.id}
					className={cn(
						"rounded-full text-sm font-medium",
						"transition-[background-color,color] duration-150 ease-out",
						full ? "inline-flex min-h-[44px] flex-1 items-center justify-center px-3" : "px-3 py-1",
						view === opt.id
							? "bg-rose-600 text-white"
							: "text-graphite-600 hover-supported:hover:text-graphite-900",
					)}
				>
					{opt.label}
				</button>
			))}
		</div>
	)
}

function ResourcePill({
	active,
	onClick,
	full,
	children,
}: {
	active: boolean
	onClick: () => void
	full?: boolean
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"rounded-full text-sm font-medium",
				"transition-[background-color,color] duration-150 ease-out",
				full ? "inline-flex min-h-[44px] flex-1 items-center justify-center px-3" : "px-3 py-1",
				active ? "bg-graphite-900 text-white" : "text-graphite-600 hover-supported:hover:text-graphite-900",
			)}
		>
			{children}
		</button>
	)
}

function visitsLabel(n: number): string {
	if (n === 1) return "1 wizyta"
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${n} wizyty`
	return `${n} wizyt`
}
