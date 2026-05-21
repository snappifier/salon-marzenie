// src/app/admin/zespol/loading.tsx
import {SkeletonPageHeader, SkeletonTable, Skeleton} from "@/components/admin-shell/skeleton"

export default function ZespolLoading() {
	return (
		<div className="flex flex-col gap-6">
			<SkeletonPageHeader />
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<Skeleton className="h-11 w-full md:max-w-sm rounded-full" />
				<Skeleton className="h-10 w-48 rounded-full" />
			</div>
			<SkeletonTable rows={5} />
		</div>
	)
}
