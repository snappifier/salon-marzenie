// src/app/admin/klienci/loading.tsx
import {SkeletonPageHeader, SkeletonTable, Skeleton} from "@/components/admin-shell/skeleton"

export default function CustomersLoading() {
	return (
		<div className="flex flex-col gap-6">
			<SkeletonPageHeader />
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<Skeleton className="h-11 w-full md:max-w-sm rounded-full" />
				<div className="flex gap-3">
					<Skeleton className="h-10 w-48 rounded-full" />
					<Skeleton className="h-9 w-32 rounded-full" />
				</div>
			</div>
			<SkeletonTable rows={6} />
		</div>
	)
}
