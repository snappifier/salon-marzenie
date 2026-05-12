import {Award} from "lucide-react"
import {landing} from "@/lib/content"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {Reveal} from "@/components/ui/reveal"

export function Certs() {
    return (
        <section className="py-16 md:py-24 bg-warm">
            <Container>
                <Reveal className="max-w-[640px] mb-12">
                    <Eyebrow className="mb-3">Certyfikaty</Eyebrow>
                    <Heading level="h2" className="mb-3">
                        Z jakimi szkoleniami{" "}
                        <span className="italic font-normal text-rose-600">pracujemy profesjonalnie</span>
                    </Heading>
                    <p className="text-base text-graphite-600 leading-relaxed">
                        Stale szkolimy się z producentami profesjonalnych marek. Wiedza, która przekłada się na efekty.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {landing.certs.map((cert, i) => (
                        <Reveal key={cert.name} delay={i * 0.08}>
                            <div className="flex gap-4 items-center bg-white border border-border-soft rounded-lg p-6 transition-[border-color,box-shadow] duration-200 ease-out hover-supported:hover:border-rose-200 hover-supported:hover:shadow-sm">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <Award size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-graphite-400 mb-1">
                                        Certyfikat
                                    </div>
                                    <div className="font-serif font-medium text-base text-graphite-900 leading-tight mb-1">
                                        {cert.name}
                                    </div>
                                    <div className="text-xs text-graphite-600 leading-relaxed">
                                        {cert.desc}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    )
}