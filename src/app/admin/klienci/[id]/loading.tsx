// src/app/admin/klienci/[id]/loading.tsx
import {Skeleton} from "@/components/admin-shell/skeleton"

export default function CustomerDetailLoading() {
	return (
		<div className="mx-auto max-w-[880px] flex flex-col gap-6">
			<Skeleton className="h-3 w-32" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-9 w-64 max-w-full" />
			</div>
			<div className="flex gap-6 border-b border-border-soft pb-3">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-20" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
			<Skeleton className="h-28 w-full" />
		</div>
	)
}
