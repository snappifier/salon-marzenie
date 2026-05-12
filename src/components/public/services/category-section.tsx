import {Container} from "@/components/ui/container"
import {Reveal} from "@/components/ui/reveal"
import {ServiceRow} from "./service-row"
import {landing} from "@/lib/content"
import type {CategoryWithServices} from "@/features/landing/queries"

interface Props {
    category: CategoryWithServices
    index: number
}

export function CategorySection({category, index}: Props) {
    const description = landing.categoryDescriptions[category.slug]

    return (
        <section
            id={category.slug}
            className="scroll-mt-28 py-12 md:py-14 border-b border-border-soft last:border-b-0"
        >
            <Container>
                <Reveal className="mb-8 md:mb-10">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-12">
                        <div className="flex items-baseline gap-4 flex-wrap">
							<span className="font-serif italic font-normal text-lg text-rose-500 opacity-70">
								{String(index + 1).padStart(2, "0")}
							</span>
                            <h2 className="font-serif font-medium text-[clamp(28px,4vw,38px)] leading-tight tracking-tight text-graphite-900">
                                {category.name}
                            </h2>
                        </div>
                        {description && (
                            <p className="text-sm text-graphite-600 leading-relaxed max-w-[360px]">
                                {description}
                            </p>
                        )}
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="flex flex-col">
                        {category.services.map((service) => (
                            <ServiceRow key={service.id} service={service} />
                        ))}
                    </div>
                </Reveal>
            </Container>
        </section>
    )
}