// src/app/admin/klienci/page.tsx
import Link from "next/link"
import {Plus} from "lucide-react"
import {buttonStyles} from "@/components/ui/button"
import {PageHeader} from "@/components/admin-shell/page-header"
import {SearchInput} from "@/components/admin-shell/search-input"
import {FilterPills} from "@/components/admin-shell/filter-pills"
import {SortMenu} from "@/components/admin-shell/sort-menu"
import {Pagination} from "@/components/admin-shell/pagination"
import {CustomersList} from "@/components/customers/customers-list"
import {getAllCustomers, type CustomerFilter, type CustomerSort} from "@/features/customers/queries"
import {cn} from "@/lib/cn"

type Props = {
	searchParams: Promise<{q?: string; filter?: string; sort?: string; page?: string}>
}

const FILTER_OPTIONS = [
	{value: "all", label: "Wszyscy"},
	{value: "active", label: "Aktywni"},
	{value: "inactive", label: "Nieaktywni"},
]

const SORT_OPTIONS = [
	{value: "alpha", label: "Alfabetycznie"},
	{value: "newest", label: "Najnowsi"},
	{value: "frequent", label: "Najczęstsi"},
]

const VALID_FILTERS: CustomerFilter[] = ["all", "active", "inactive"]
const VALID_SORTS: CustomerSort[] = ["alpha", "newest", "frequent"]

function parseFilter(value?: string): CustomerFilter {
	return VALID_FILTERS.includes(value as CustomerFilter) ? (value as CustomerFilter) : "all"
}

function parseSort(value?: string): CustomerSort {
	return VALID_SORTS.includes(value as CustomerSort) ? (value as CustomerSort) : "alpha"
}

function parsePage(value?: string): number {
	const n = Number(value)
	if (!Number.isFinite(n) || n < 1) return 1
	return Math.floor(n)
}

export default async function CustomersPage({searchParams}: Props) {
	const sp = await searchParams
	const filter = parseFilter(sp.filter)
	const sort = parseSort(sp.sort)
	const page = parsePage(sp.page)
	const q = sp.q?.trim() ?? ""

	const {customers, total, perPage} = await getAllCustomers({q, filter, sort, page})
	const totalPages = Math.max(1, Math.ceil(total / perPage))
	const isSearching = q.length > 0 || filter !== "all"

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Sekcja"
				title="Klienci salonu"
				subtitle={
					<span className="tabular-nums">
						{total} {total === 1 ? "osoba" : total < 5 ? "osoby" : "osób"}
					</span>
				}
				actions={
					<Link className={cn(buttonStyles({size: "sm"}))} href="/admin/klienci/nowy">
						<Plus size={15} strokeWidth={2.25} />
						<span>Nowa klientka</span>
					</Link>
				}
			/>

			<div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 bg-cream/95 backdrop-blur-sm border-y border-border-soft/60 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<SearchInput className="md:max-w-sm flex-1" placeholder="Wpisz imię, telefon, email..." />
				<div className="flex items-center justify-between md:justify-end gap-3 -mx-1 overflow-x-auto scrollbar-none px-1">
					<FilterPills options={FILTER_OPTIONS} active={filter} aria-label="Filtr klientów" />
					<SortMenu options={SORT_OPTIONS} active={sort} />
				</div>
			</div>

			<CustomersList customers={customers} isSearching={isSearching} />

			<Pagination page={page} totalPages={totalPages} />
		</div>
	)
}
