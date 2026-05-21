// src/app/admin/loading.tsx
import {SkeletonCard, Skeleton} from "@/components/admin-shell/skeleton"

export default function DashboardLoading() {
	return (
		<div className="flex flex-col gap-6 md:gap-8">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-3 w-32" />
				<Skeleton className="h-10 w-48" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
			</div>
			<div className="rounded-2xl bg-white border border-border-soft p-5 md:p-6">
				<Skeleton className="h-48 w-full" />
			</div>
		</div>
	)
}
