// src/components/public/services/category-section.tsx
import {Container} from "@/components/ui/container"
import {ServiceRow} from "./service-row"
import {landing} from "@/lib/content"
import type {CategoryWithServices} from "@/features/landing/queries"

interface Props {
	category: CategoryWithServices
}

export function CategorySection({category}: Props) {
	const description =
		landing.categoryDescriptions[category.slug] ??
		category.services.find((s) => s.description)?.description

	return (
		<section
			id={category.slug}
			className="scroll-mt-[152px] py-[clamp(40px,6vw,64px)] border-b border-border-subtle last:border-b-0"
		>
			<Container>
				<div className="max-w-xl mx-auto mb-[clamp(24px,4vw,40px)] text-center">
					<h2 className="font-display font-normal text-[clamp(28px,5vw,40px)] leading-[1.1] mb-4">
						{category.name}
					</h2>
					{description && <p className="text-secondary leading-[25px]">{description}</p>}
				</div>

				<div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
					{category.services.map((service) => (
						<ServiceRow key={service.id} service={service} />
					))}
				</div>
			</Container>
		</section>
	)
}
