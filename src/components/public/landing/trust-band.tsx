import {landing} from "@/lib/content"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Reveal} from "@/components/ui/reveal"

export function TrustBand() {
    return (
        <section className="py-16 md:py-24 bg-warm">
            <Container>
                <Reveal className="text-center pb-14 mb-14 border-b border-border-default">
                    <Eyebrow className="mb-5">Pracujemy z markami</Eyebrow>
                    <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                        {landing.brands.map((brand, i) => (
                            <div key={brand} className="contents">
								<span className="font-serif font-medium text-lg md:text-xl text-graphite-600 tracking-wide">
									{brand}
								</span>
                                {i < landing.brands.length - 1 && (
                                    <span className="font-serif font-normal text-rose-200" aria-hidden="true">/</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
                    {landing.stats.map((stat, i) => (
                        <Reveal key={stat.label} delay={i * 0.08} className="text-center">
                            <div className="w-8 h-px bg-rose-300 mx-auto mb-4 sm:hidden" />
                            <div className="font-serif font-medium text-[clamp(48px,7vw,72px)] leading-none tracking-[-0.03em] text-graphite-900 mb-2">
                                {stat.num}
                                <em className="italic font-normal text-rose-600">{stat.suffix}</em>
                            </div>
                            <div className="text-sm text-graphite-600 leading-snug whitespace-pre-line">
                                {stat.label}
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    )
}