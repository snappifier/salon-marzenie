// src/components/ui/empty-state.tsx
import Link from "next/link"
import {Button, buttonStyles} from "@/components/ui/button"
import {cn} from "@/lib/cn"

interface EmptyStateAction {
	label: string
	href?: string
	onClick?: () => void
}

interface EmptyStateProps {
	className?: string
	icon: React.ReactNode
	title: string
	description: string
	action?: EmptyStateAction
}

export function EmptyState({className, icon, title, description, action}: EmptyStateProps) {
	return (
		<section
			className={cn(
				"rounded-2xl bg-white border border-border-soft p-8 md:p-12 text-center",
				className,
			)}
		>
			<div
				className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 text-rose-600 mb-5"
				aria-hidden="true"
			>
				{icon}
			</div>
			<h3 className="font-serif text-[20px] leading-tight text-graphite-900 mb-2 text-balance">
				{title}
			</h3>
			<p className="text-sm text-graphite-600 max-w-md mx-auto mb-6 text-balance">
				{description}
			</p>
			{action && (
				action.href ? (
					<Link className={buttonStyles({size: "md"})} href={action.href}>
						{action.label}
					</Link>
				) : (
					<Button size="md" type="button" onClick={action.onClick}>
						{action.label}
					</Button>
				)
			)}
		</section>
	)
}
