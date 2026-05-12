import Link from "next/link"
import {ArrowRight} from "lucide-react"
import {landing} from "@/lib/content"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {Reveal} from "@/components/ui/reveal"
import {ButterflyWatermark} from "@/components/public/butterfly-watermark"
import {getNextAvailableSlot} from "@/features/booking/next-slot"
import {formatRelativeSlot} from "@/lib/date"

function StarIcon({size = 11}: {size?: number}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
        </svg>
    )
}

export async function Hero() {
    const nextSlot = await getNextAvailableSlot()

    return (
        <section className="relative overflow-hidden py-16 md:py-24">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none hero-bloom" />

            <Container className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-14 lg:gap-16">
                <Reveal>
                    <Eyebrow className="mb-5">{landing.hero.eyebrow}</Eyebrow>
                    <Heading level="display" className="mb-6">
                        {landing.hero.headline}{" "}
                        <span className="italic font-normal text-rose-600">
							{landing.hero.headlineHighlight}
						</span>
                    </Heading>
                    <p className="text-[clamp(15px,1.6vw,18px)] leading-relaxed text-graphite-600 max-w-[480px] mb-8">
                        {landing.hero.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/rezerwacja" className={buttonStyles({size: "lg"})}>
                            Zarezerwuj online
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/uslugi" className={buttonStyles({size: "lg", variant: "secondary"})}>
                            Zobacz cennik
                        </Link>
                    </div>

                    {nextSlot && (
                        <div className="mt-8 flex items-center gap-3 text-[13px] text-graphite-500">
							<span className="relative flex w-1.5 h-1.5" aria-hidden="true">
								<span className="absolute inline-flex w-full h-full rounded-full bg-success opacity-60 animate-ping" />
								<span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-success" />
							</span>
                            <span>
								Najbliższa wolna wizyta:{" "}
                                <strong className="font-medium text-graphite-900">
									{formatRelativeSlot(nextSlot)}
								</strong>
							</span>
                        </div>
                    )}
                </Reveal>

                <Reveal delay={0.15} className="hidden lg:block relative min-h-[360px]">
                    <ButterflyWatermark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] opacity-60" />

                    <div className=" absolute top-[8%] right-0 -rotate-2 bg-white border border-border-soft rounded-2xl p-5 shadow-md min-w-[180px]">
                        <div className="font-serif font-medium text-[44px] leading-none tracking-[-0.02em] text-graphite-900">
                            12<em className="italic text-[22px] text-rose-500 ml-0.5">+</em>
                        </div>
                        <div className="text-[13px] text-graphite-600 mt-1.5 leading-tight">
                            lat doświadczenia<br />w pielęgnacji
                        </div>
                    </div>

                    <div className=" absolute bottom-[8%] left-0 rotate-2 bg-white border border-border-soft rounded-2xl p-5 shadow-md max-w-[280px]">
                        <p className="text-sm leading-snug text-graphite-900 italic mb-2.5">
                            &bdquo;Zawsze profesjonalnie i z dbałością o szczegóły. Polecam!&rdquo;
                        </p>
                        <div className="flex items-center gap-2 pt-2.5 border-t border-border-soft">
                            <div className="flex gap-px text-rose-500" aria-label="5 z 5 gwiazdek">
                                {Array.from({length: 5}).map((_, i) => (
                                    <StarIcon key={i} />
                                ))}
                            </div>
                            <div className="text-[11px] font-medium text-graphite-600">Anna K., FB</div>
                        </div>
                    </div>
                </Reveal>
            </Container>
        </section>
    )
}