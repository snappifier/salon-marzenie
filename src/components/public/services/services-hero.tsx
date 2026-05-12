import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {Reveal} from "@/components/ui/reveal"

export function ServicesHero() {
    return (
        <section className="relative overflow-hidden py-14 md:py-20">
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 600px 400px at 80% 0%, var(--color-rose-50) 0%, transparent 60%)",
                }}
            />

            <Container className="relative">
                <Reveal className="max-w-[720px]">
                    <Eyebrow className="mb-4">Usługi i cennik</Eyebrow>
                    <Heading level="h1" className="mb-4">
                        Pełna oferta <span className="italic font-normal text-rose-600">w jednym miejscu</span>
                    </Heading>
                    <p className="text-[clamp(15px,1.5vw,17px)] leading-relaxed text-graphite-600 max-w-[560px]">
                        Wszystkie zabiegi z cenami i czasami trwania. Klikaj „Zarezerwuj" przy konkretnej usłudze albo skorzystaj z menu kategorii niżej.
                    </p>
                </Reveal>
            </Container>
        </section>
    )
}