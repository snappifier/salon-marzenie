import {landing} from "@/lib/content"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {Reveal} from "@/components/ui/reveal"

function StarIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
        </svg>
    )
}

export function Reviews() {
    return (
        <section id="opinie" className="py-16 md:py-24 bg-cream">
            <Container>
                <Reveal className="max-w-[640px] mb-12">
                    <Eyebrow className="mb-3">Opinie</Eyebrow>
                    <Heading level="h2" className="mb-3">
                        Co mówią <span className="italic font-normal text-rose-600">nasze klientki</span>
                    </Heading>
                    <p className="text-base text-graphite-600 leading-relaxed">
                        Realne opinie z Facebooka i Google.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    {landing.reviews.map((review, i) => (
                        <Reveal key={review.author} delay={i * 0.08}>
                            <article className="relative overflow-hidden bg-white border border-border-soft rounded-2xl p-7 transition-[border-color,box-shadow] duration-200 ease-out hover-supported:hover:border-rose-200 hover-supported:hover:shadow-sm">
                                <div className="absolute top-3 right-5 font-serif italic font-medium text-[88px] leading-none text-rose-100 pointer-events-none"
                                     aria-hidden="true"
                                >
                                    &ldquo;
                                </div>
                                <div className="relative flex gap-0.5 mb-3.5 text-rose-500" aria-label="5 z 5 gwiazdek">
                                    {Array.from({length: 5}).map((_, j) => (
                                        <StarIcon key={j} />
                                    ))}
                                </div>
                                <p className="relative text-sm leading-relaxed text-graphite-900 mb-5">
                                    {review.text.replace(/^PLACEHOLDER:\s*/, "")}
                                </p>
                                <footer className="pt-3.5 border-t border-border-soft">
                                    <div className="text-[13px] font-medium text-graphite-900">{review.author}</div>
                                    <div className="text-[11px] text-graphite-400 mt-0.5 tracking-wide">{review.source}</div>
                                </footer>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    )
}