// src/app/admin/zespol/page.tsx
import Link from "next/link"
import {Plus} from "lucide-react"
import {buttonStyles} from "@/components/ui/button"
import {PageHeader} from "@/components/admin-shell/page-header"
import {SearchInput} from "@/components/admin-shell/search-input"
import {FilterPills} from "@/components/admin-shell/filter-pills"
import {StaffList} from "@/components/staff/staff-list"
import {getAllStaff} from "@/features/staff/queries"
import {cn} from "@/lib/cn"

type Props = {
	searchParams: Promise<{q?: string; filter?: string}>
}

const FILTER_OPTIONS = [
	{value: "all", label: "Wszyscy"},
	{value: "active", label: "Aktywni"},
	{value: "inactive", label: "Nieaktywni"},
]

export default async function ZespolPage({searchParams}: Props) {
	const sp = await searchParams
	const q = sp.q?.trim() ?? ""
	const filter = (["all", "active", "inactive"] as const).includes(sp.filter as "all" | "active" | "inactive")
		? (sp.filter as "all" | "active" | "inactive")
		: "all"

	const staff = await getAllStaff({q, filter})
	const isFiltering = q.length > 0 || filter !== "all"

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Sekcja"
				title="Zespół"
				subtitle={
					<span className="tabular-nums">
						{staff.length} {staff.length === 1 ? "osoba" : staff.length < 5 ? "osoby" : "osób"}
					</span>
				}
				actions={
					<Link className={cn(buttonStyles({size: "sm"}))} href="/admin/zespol/nowy">
						<Plus size={15} strokeWidth={2.25} />
						<span>Nowy pracownik</span>
					</Link>
				}
			/>

			<div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 bg-cream/95 backdrop-blur-sm border-y border-border-soft/60 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<SearchInput className="md:max-w-sm flex-1" placeholder="Wpisz imię, email..." />
				<FilterPills options={FILTER_OPTIONS} active={filter} aria-label="Status pracowników" />
			</div>

			<StaffList staff={staff} isFiltering={isFiltering} />
		</div>
	)
}
