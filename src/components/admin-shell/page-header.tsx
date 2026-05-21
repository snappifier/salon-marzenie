// src/components/admin-shell/page-header.tsx
import {Heading} from "@/components/ui/heading"
import {Eyebrow} from "@/components/ui/eyebrow"
import {cn} from "@/lib/cn"

interface PageHeaderProps {
	className?: string
	eyebrow?: string
	title: string
	subtitle?: React.ReactNode
	actions?: React.ReactNode
	backLink?: {href: string; label: string}
}

export function PageHeader({className, eyebrow, title, subtitle, actions, backLink}: PageHeaderProps) {
	return (
		<header className={cn("flex flex-col gap-3", className)}>
			{backLink && (
				<a
					className={cn(
						"inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600",
						"transition-[color] duration-150 ease-out",
						"hover-supported:hover:text-rose-600",
					)}
					href={backLink.href}
				>
					<span aria-hidden="true">←</span>
					<span>{backLink.label}</span>
				</a>
			)}
			<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div className="flex flex-col gap-1.5 min-w-0">
					{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
					<Heading className="text-balance" level="h1">
						{title}
					</Heading>
					{subtitle && <div className="text-sm text-graphite-600">{subtitle}</div>}
				</div>
				{actions && <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0">{actions}</div>}
			</div>
		</header>
	)
}
