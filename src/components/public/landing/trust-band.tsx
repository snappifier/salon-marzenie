import {landing} from "@/lib/content"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Reveal} from "@/components/ui/reveal"

export function TrustBand() {
    return (
        <section className="py-16 md:py-24 bg-paper-300">
            <Container>
                <Reveal className="text-center pb-14 mb-14 border-b border-border-subtle">
                    <Eyebrow className="mb-5">Pracujemy z markami</Eyebrow>
                    <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                        {landing.brands.map((brand, i) => (
                            <div key={brand} className="contents">
								<span className="font-display font-medium text-lg md:text-xl text-secondary tracking-wide">
									{brand}
								</span>
                                {i < landing.brands.length - 1 && (
                                    <span className="font-display font-normal text-accent-100" aria-hidden="true">/</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
                    {landing.stats.map((stat, i) => (
                        <Reveal key={stat.label} delay={i * 0.08} className="text-center">
                            <div className="w-8 h-px bg-accent-100 mx-auto mb-4 sm:hidden" />
                            <div className="font-display font-medium text-[clamp(48px,7vw,72px)] leading-none tracking-[-0.03em] text-primary mb-2">
                                {stat.num}
                                <em className="italic font-normal text-interactive">{stat.suffix}</em>
                            </div>
                            <div className="text-sm text-secondary leading-snug whitespace-pre-line">
                                {stat.label}
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    )
}