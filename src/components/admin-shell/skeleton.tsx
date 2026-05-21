// src/components/admin-shell/skeleton.tsx
import {cn} from "@/lib/cn"

export function Skeleton({className}: {className?: string}) {
	return <div className={cn("bg-warm animate-pulse rounded-md", className)} aria-hidden="true" />
}

export function SkeletonPageHeader() {
	return (
		<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
			<div className="flex flex-col gap-2.5">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-9 w-64 max-w-full" />
				<Skeleton className="h-4 w-24" />
			</div>
			<Skeleton className="h-9 w-36 rounded-full" />
		</div>
	)
}

export function SkeletonTable({rows = 5}: {rows?: number}) {
	return (
		<div className="rounded-2xl bg-white border border-border-soft overflow-hidden">
			<div className="bg-warm h-11 border-b border-border-soft" />
			<div className="flex flex-col">
				{Array.from({length: rows}).map((_, i) => (
					<div
						key={i}
						className={cn("flex items-center gap-3 px-5 py-3.5", i > 0 && "border-t border-border-soft")}
					>
						<Skeleton className="w-8 h-8 rounded-full shrink-0" />
						<div className="flex flex-col gap-1.5 flex-1">
							<Skeleton className="h-3.5 w-40 max-w-[40%]" />
							<Skeleton className="h-3 w-24 max-w-[25%]" />
						</div>
						<Skeleton className="h-6 w-20 rounded-full shrink-0" />
					</div>
				))}
			</div>
		</div>
	)
}

export function SkeletonCard({className}: {className?: string}) {
	return (
		<div className={cn("rounded-2xl bg-white border border-border-soft p-5 md:p-6 flex flex-col gap-4", className)}>
			<Skeleton className="h-3 w-16" />
			<Skeleton className="h-11 w-28" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-3.5 w-full" />
				<Skeleton className="h-3.5 w-3/4" />
			</div>
		</div>
	)
}
