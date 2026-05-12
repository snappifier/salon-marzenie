import Link from "next/link"
import {ArrowRight, Phone} from "lucide-react"
import type {PublicSalonInfo} from "@/lib/dto"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {Reveal} from "@/components/ui/reveal"
import {ButterflyWatermark} from "@/components/public/butterfly-watermark"

interface Props {
    salon: PublicSalonInfo
    eyebrow?: string
    heading?: React.ReactNode
    description?: string
}

function formatPhone(phone: string | null): string | null {
    if (!phone) return null
    return phone.replace(/^\+48/, "+48 ").replace(/(\d{3})(?=\d)/g, "$1 ").trim()
}

const defaultHeading = (
    <>
        Gotowa na <span className="italic font-normal text-rose-600">swoją chwilę</span>?
    </>
)

export function FinalCta({
                             salon,
                             eyebrow = "Zarezerwuj wizytę",
                             heading = defaultHeading,
                             description = "Zarezerwuj online w kilka kliknięć - wybierz usługę, pasujący termin i potwierdź. Lub po prostu zadzwoń, dopasujemy termin do Ciebie.",
                         }: Props) {
    const phoneDisplay = formatPhone(salon.salonPhone)

    return (
        <section id="rezerwacja" className="relative overflow-hidden py-16 md:py-24 cta-bloom">
            <ButterflyWatermark className="absolute -bottom-16 -right-10 w-80 opacity-50" />

            <Container>
                <Reveal className="max-w-[720px] mx-auto text-center">
                    <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
                    <Heading level="h2" className="mb-4">
                        {heading}
                    </Heading>
                    <p className="text-[17px] text-graphite-600 leading-relaxed max-w-[540px] mx-auto mb-8">
                        {description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <Link href="/rezerwacja" className={buttonStyles({size: "lg"})}>
                            Zarezerwuj online
                            <ArrowRight size={16} />
                        </Link>
                        {salon.salonPhone && phoneDisplay && (
                            <a
                                href={`tel:${salon.salonPhone}`}
                                className="flex items-center gap-1.5 text-sm text-graphite-600 hover:text-rose-600 transition-[color] duration-150 ease-out"
                            >
                            <Phone size={14} />
                            <span>
                            lub zadzwoń:{" "}
                        <strong className="font-serif font-medium text-base text-graphite-900">
                            {phoneDisplay}
                        </strong>
                    </span>
                </a>
                )}
            </div>
        </Reveal>
</Container>
</section>
)
}