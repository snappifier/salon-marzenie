import type {DashboardData} from "@/features/dashboard/queries"

interface Props {
	customer: DashboardData["customer"]
}

export function PreferencesCard({customer}: Props) {
	const rows: Array<{label: string; value: string; empty?: boolean}> = [
		{label: "Telefon", value: customer.phone},
		{label: "Email", value: customer.email ?? "brak", empty: !customer.email},
		{label: "Notatki", value: customer.notes ?? "brak", empty: !customer.notes},
		{label: "Powiadomienia", value: "SMS · 24h przed wizytą"},
	]

	return (
		<div className="bg-white border border-border-soft rounded-[var(--radius-lg)] overflow-hidden">
			<div className="px-[22px] pt-[18px] pb-3.5 flex items-center justify-between">
				<h3 className="font-serif font-medium text-lg text-graphite-900 tracking-[-0.01em]">
					Twoje <em className="italic text-rose-600 font-normal">preferencje</em>
				</h3>
			</div>

			<div className="px-[22px] pb-[22px] pt-1">
				{rows.map((pref) => (
					<div
						key={pref.label}
						className="flex justify-between items-baseline py-[11px] border-b border-border-soft last:border-b-0 gap-3"
					>
						<p className="text-xs uppercase tracking-[0.12em] text-graphite-400 font-medium shrink-0">
							{pref.label}
						</p>
						<p className={pref.empty ? "text-sm text-right italic text-graphite-400" : "text-sm text-right text-graphite-900"}>
							{pref.value}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
