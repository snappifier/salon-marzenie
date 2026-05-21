// src/components/dashboard/stat-card.tsx
import {cn} from "@/lib/cn"

interface StatCardProps {
	className?: string
	eyebrow?: string
	title?: string
	children: React.ReactNode
	action?: React.ReactNode
}

export function StatCard({className, eyebrow, title, children, action}: StatCardProps) {
	return (
		<section
			className={cn(
				"rounded-2xl bg-white border border-border-soft p-5 md:p-6 shadow-xs",
				"flex flex-col gap-4",
				className,
			)}
		>
			{(eyebrow || title || action) && (
				<header className="flex items-center justify-between gap-3">
					<div>
						{eyebrow && (
							<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-600">
								{eyebrow}
							</p>
						)}
						{title && (
							<h2 className="font-serif text-[20px] leading-tight text-graphite-900 mt-1">
								{title}
							</h2>
						)}
					</div>
					{action}
				</header>
			)}
			{children}
		</section>
	)
}
