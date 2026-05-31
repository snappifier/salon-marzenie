// src/app/admin/oferta/page.tsx
import Link from "next/link"
import {Plus} from "lucide-react"
import {buttonStyles} from "@/components/ui/button"
import {PageHeader} from "@/components/admin-shell/page-header"
import {SearchInput} from "@/components/admin-shell/search-input"
import {FilterPills} from "@/components/admin-shell/filter-pills"
import {SortMenu} from "@/components/admin-shell/sort-menu"
import {SubTabStrip} from "@/components/admin-shell/sub-tab-strip"
import {ServicesList} from "@/components/services/services-list"
import {CategoriesList} from "@/components/categories/categories-list"
import {getAllServices} from "@/features/services/queries"
import {getAllCategories} from "@/features/categories/queries"
import {prisma} from "@/lib/prisma"
import {cn} from "@/lib/cn"

type Props = {
	searchParams: Promise<{sub?: string; q?: string; filter?: string; sort?: string; categoryId?: string}>
}

const SERVICE_FILTER_OPTIONS = [
	{value: "all", label: "Wszystkie"},
	{value: "active", label: "Aktywne"},
	{value: "inactive", label: "Nieaktywne"},
]

const SERVICE_SORT_OPTIONS = [
	{value: "category", label: "Wg kategorii"},
	{value: "alpha", label: "Alfabetycznie"},
	{value: "newest", label: "Najnowsze"},
]

export default async function OfertaPage({searchParams}: Props) {
	const sp = await searchParams
	const sub = sp.sub === "kategorie" ? "kategorie" : "uslugi"

	const categoryNav = await prisma.category.findMany({orderBy: {order: "asc"}, select: {id: true, name: true, _count: {select: {services: true}}}})
	const servicesCount = await prisma.service.count()
	const categoriesCount = categoryNav.length

	const tabs = [
		{id: "uslugi", label: "Usługi", badge: servicesCount},
		{id: "kategorie", label: "Kategorie", badge: categoriesCount},
	]

	const cta = sub === "uslugi"
		? {href: "/admin/oferta/uslugi/nowa", label: "Nowa usługa"}
		: {href: "/admin/oferta/kategorie/nowa", label: "Nowa kategoria"}

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Sekcja"
				title="Usługi i kategorie"
				subtitle="Zarządzaj ofertą salonu — zabiegami i kategoriami w których są pogrupowane."
				actions={
					<Link className={cn(buttonStyles({size: "sm"}))} href={cta.href}>
						<Plus size={15} strokeWidth={2.25} />
						<span>{cta.label}</span>
					</Link>
				}
			/>

			<SubTabStrip
				tabs={tabs}
				active={sub}
				defaultValue="uslugi"
				layoutId="oferta-subtabs"
				aria-label="Sekcje oferty"
			/>

			{sub === "uslugi" ? (
				<div id="panel-uslugi" role="tabpanel" aria-labelledby="tab-uslugi">
					<ServicesContent searchParams={sp} categories={categoryNav.map((c) => ({id: c.id, name: c.name, count: c._count.services}))} />
				</div>
			) : (
				<div id="panel-kategorie" role="tabpanel" aria-labelledby="tab-kategorie">
					<CategoriesContent />
				</div>
			)}
		</div>
	)
}

async function ServicesContent({searchParams, categories}: {searchParams: {q?: string; filter?: string; sort?: string; categoryId?: string}; categories: {id: string; name: string; count: number}[]}) {
	const q = searchParams.q?.trim() ?? ""
	const filter = (["all", "active", "inactive"] as const).includes(searchParams.filter as "all" | "active" | "inactive")
		? (searchParams.filter as "all" | "active" | "inactive")
		: "all"
	const sort = (["category", "alpha", "newest"] as const).includes(searchParams.sort as "category" | "alpha" | "newest")
		? (searchParams.sort as "category" | "alpha" | "newest")
		: "category"
	const categoryId = searchParams.categoryId

	const services = await getAllServices({q, filter, sort, categoryId})
	const isFiltering = q.length > 0 || filter !== "all" || Boolean(categoryId)

	const categoryFilterOptions = [
		{value: "", label: "Wszystkie"},
		...categories.map((c) => ({value: c.id, label: c.name, badge: c.count})),
	]

	return (
		<>
			<div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 bg-cream/95 backdrop-blur-sm border-y border-border-soft/60 flex flex-col gap-3">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<SearchInput className="md:max-w-sm flex-1" placeholder="Szukaj usługi..." />
					<div className="flex items-center justify-between md:justify-end gap-3">
						<FilterPills options={SERVICE_FILTER_OPTIONS} active={filter} aria-label="Status usług" />
						<SortMenu options={SERVICE_SORT_OPTIONS} active={sort} />
					</div>
				</div>
				{categoryFilterOptions.length > 2 && (
					<div className="-mx-1 overflow-x-auto scrollbar-none px-1">
						<FilterPills
							className="flex-nowrap"
							options={categoryFilterOptions}
							active={categoryId ?? ""}
							paramName="categoryId"
							aria-label="Filtr kategorii"
						/>
					</div>
				)}
			</div>

			<ServicesList services={services} isFiltering={isFiltering} />
		</>
	)
}

async function CategoriesContent() {
	const raw = await getAllCategories()
	const categories = raw.map((c) => ({
		id: c.id,
		name: c.name,
		slug: c.slug,
		order: c.order,
		active: c.active,
		serviceCount: c._count.services,
	}))

	return <CategoriesList categories={categories} />
}
