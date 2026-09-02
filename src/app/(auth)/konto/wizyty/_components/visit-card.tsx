// src/app/(auth)/konto/wizyty/_components/visit-card.tsx
import {Fragment} from "react"
import Link from "next/link"
import {cn} from "@/lib/cn"
import {buttonStyles} from "@/components/ui/button"

type StatusTone = "confirmed" | "pending" | "cancelled" | "completed"
type CardState = "confirmed" | "pending" | "past" | "cancelled"

const statusToneClasses: Record<StatusTone, string> = {
	confirmed: "bg-success-bg text-success",
	pending: "bg-warning-bg text-warning",
	cancelled: "bg-error-bg text-error",
	completed: "bg-surface-muted text-secondary",
}

export interface VisitCardData {
	day: string
	month: string
	time?: string
	title: string
	metaItems: string[]
	status: {label: string; tone: StatusTone}
	state: CardState
	actionLabel: string
	actionHref?: string
}

export function VisitCard({
	day,
	month,
	time,
	title,
	metaItems,
	status,
	state,
	actionLabel,
	actionHref,
}: VisitCardData) {
	return (
		<div
			className={cn(
				"bg-surface border border-border-subtle rounded-lg px-5.5 py-4.5",
				"grid grid-cols-[60px_1fr] sm:grid-cols-[72px_1fr_auto] gap-3.5 sm:gap-4.5 items-center relative",
				"transition-[border-color,box-shadow,opacity] duration-150 ease-out",
				"hover-supported:hover:border-accent-100 hover-supported:hover:shadow-sm",
				state === "pending" && "border-l-[3px] border-l-warning",
				state === "cancelled" && "opacity-60",
				state === "past" && "bg-paper-300",
			)}
		>
			<div className="text-center px-1.5 py-3 bg-paper-300 rounded-md">
				<div className="font-display font-medium text-2xl text-primary leading-none tracking-[-0.02em]">
					{day}
				</div>
				<div className="text-[10px] uppercase text-interactive tracking-[0.18em] mt-1 font-medium">
					{month}
				</div>
				{time && (
					<div className="text-[11px] text-secondary mt-1.5 pt-1.5 border-t border-border-subtle font-display font-medium">
						{time}
					</div>
				)}
			</div>

			<div className="min-w-0">
				<div className="font-display font-medium text-base text-primary tracking-[-0.01em] leading-[1.3] mb-1">
					{title}
				</div>
				<div className="text-xs text-secondary flex items-center gap-2 flex-wrap">
					{metaItems.map((m, i) => (
						<Fragment key={i}>
							<span>{m}</span>
							<span className="text-secondary/50">·</span>
						</Fragment>
					))}
					<span
						className={cn(
							"inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-widest",
							statusToneClasses[status.tone],
						)}
					>
						{status.label}
					</span>
				</div>
			</div>

			<div className="flex gap-1.5 items-center justify-end col-span-2 sm:col-span-1 pt-3 mt-1 border-t border-border-subtle sm:pt-0 sm:mt-0 sm:border-t-0">
				{actionHref ? (
					<Link href={actionHref} className={buttonStyles({variant: "secondary", size: "sm"})}>
						{actionLabel}
					</Link>
				) : (
					<button type="button" className={buttonStyles({variant: "secondary", size: "sm"})}>
						{actionLabel}
					</button>
				)}
			</div>
		</div>
	)
}
