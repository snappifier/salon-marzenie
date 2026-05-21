// src/app/admin/oferta/uslugi/nowa/page.tsx
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {ServiceForm} from "@/components/services/service-form"
import {prisma} from "@/lib/prisma"

export default async function NewServicePage() {
	const categories = await prisma.category.findMany({orderBy: {order: "asc"}})

	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/oferta?sub=uslugi"
				>
					<span aria-hidden="true">←</span>
					<span>Wszystkie usługi</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>Nowa usługa</Eyebrow>
					<Heading className="text-balance" level="h1">
						Dodaj <span className="italic font-normal text-rose-600">zabieg</span>
					</Heading>
					<p className="text-sm text-graphite-600 max-w-md">
						Po dodaniu usługi przypisz do niej pracowników w sekcji „Pracownicy".
					</p>
				</header>

				<ServiceForm mode="create" categories={categories} />
			</div>
		</Container>
	)
}
