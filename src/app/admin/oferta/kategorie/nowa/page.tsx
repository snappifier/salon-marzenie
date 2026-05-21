// src/app/admin/oferta/kategorie/nowa/page.tsx
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {CategoryForm} from "@/components/categories/category-form"

export default function NewCategoryPage() {
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
					<Eyebrow>Nowa kategoria</Eyebrow>
					<Heading className="text-balance" level="h1">
						Dodaj <span className="italic font-normal text-rose-600">kategorię</span>
					</Heading>
					<p className="text-sm text-graphite-600 max-w-md">
						Kategoria grupuje podobne usługi. Slug generuje się automatycznie z nazwy.
					</p>
				</header>

				<CategoryForm mode="create" />
			</div>
		</Container>
	)
}
