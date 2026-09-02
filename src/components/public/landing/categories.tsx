import Link from "next/link"
import {ArrowRight} from "lucide-react"
import {getCategoriesWithMinPrice} from "@/features/landing/queries"
import {landing} from "@/lib/content"
import {formatMoney} from "@/lib/money"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {Reveal} from "@/components/ui/reveal"

export async function Categories() {
    const categories = await getCategoriesWithMinPrice()

    return (
        <section id="uslugi" className="py-16 md:py-24 bg-surface">
            <Container>
                <Reveal className="max-w-[640px] mb-12">
                    <Eyebrow className="mb-3">Co robimy</Eyebrow>
                    <Heading level="h2" className="mb-3">
                        Pełna oferta studia{" "}
                        <span className="italic font-normal text-interactive">w jednym miejscu</span>
                    </Heading>
                    <p className="text-base text-secondary leading-relaxed">
                        Od codziennej pielęgnacji po specjalistyczne zabiegi. Wszystko w spokojnej, kameralnej atmosferze.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {categories.map((cat, i) => (
                        <Reveal key={cat.id} delay={i * 0.06} className="h-full">
                            <Link
                                href={`/uslugi#${cat.slug}`}
                                className="group h-full flex flex-col justify-between gap-8 bg-surface border border-border-subtle rounded-lg p-7 pb-6 min-h-[220px] transition-[border-color,box-shadow] duration-200 ease-out hover-supported:hover:border-accent-100 hover-supported:hover:shadow-md"
                            >
                                <div>
                                    <div className="font-display italic font-normal text-sm text-interactive opacity-70">
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                    <h3 className="font-display font-medium text-2xl leading-tight tracking-tight text-primary mt-2 mb-2">
                                        {cat.name}
                                    </h3>
                                    <p className="text-[13px] text-secondary leading-relaxed">
                                        {landing.categoryDescriptions[cat.slug] ?? "Profesjonalne zabiegi w naszym studio."}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                                    <div className="font-display font-medium text-base text-primary">
                                        <span className="text-[11px] text-secondary uppercase tracking-wider mr-1">od</span>
                                        {formatMoney(cat.minPriceGr)}
                                    </div>
                                    <div className="text-interactive opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    )
}