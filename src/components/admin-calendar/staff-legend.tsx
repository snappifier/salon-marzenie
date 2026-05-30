// src/components/admin-calendar/staff-legend.tsx
import type {StaffResource} from "./calendar-types"

interface StaffLegendProps {
	staff: StaffResource[]
}

export function StaffLegend({staff}: StaffLegendProps) {
	if (staff.length === 0) return null

	return (
		<div className="flex items-center gap-x-3 gap-y-1.5 overflow-x-auto scrollbar-none md:flex-wrap md:gap-x-4">
			<span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-graphite-400">
				Pracownicy
			</span>
			{staff.map((s) => (
				<span
					key={s.id}
					className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-graphite-700 md:text-xs"
				>
					<span
						className="h-2.5 w-2.5 shrink-0 rounded-full"
						style={{backgroundColor: s.color}}
						aria-hidden="true"
					/>
					{s.firstName} {s.lastName}
				</span>
			))}
		</div>
	)
}
