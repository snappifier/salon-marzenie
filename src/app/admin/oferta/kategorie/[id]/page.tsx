// src/app/admin/oferta/kategorie/[id]/page.tsx
import {notFound} from "next/navigation"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {StatusBadge} from "@/components/ui/status-badge"
import {CategoryForm} from "@/components/categories/category-form"
import {getCategoryById} from "@/features/categories/queries"

type Props = {
	params: Promise<{id: string}>
}

export default async function CategoryDetailPage({params}: Props) {
	const {id} = await params
	const category = await getCategoryById(id)
	if (!category) notFound()

	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/oferta?sub=kategorie"
				>
					<span aria-hidden="true">←</span>
					<span>Wszystkie kategorie</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>Kategoria</Eyebrow>
					<div className="flex items-center gap-3 flex-wrap">
						<Heading className="!text-[clamp(1.75rem,4vw,2.5rem)]" level="h1">
							{category.name}
						</Heading>
						<StatusBadge variant={category.active ? "active" : "inactive"} />
					</div>
				</header>

				<CategoryForm mode="edit" initialData={category} />
			</div>
		</Container>
	)
}
