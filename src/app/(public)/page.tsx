import {getSettings} from "@/features/settings/queries"
import {toPublicSalonInfo} from "@/lib/dto"
import {Hero} from "@/components/public/landing/hero"
import {Categories} from "@/components/public/landing/categories"
import {TrustBand} from "@/components/public/landing/trust-band"
import {Reviews} from "@/components/public/landing/reviews"
import {Certs} from "@/components/public/landing/certs"
import {FinalCta} from "@/components/public/landing/final-cta"

export default async function HomePage() {
    const settings = await getSettings()
    const salon = toPublicSalonInfo(settings)

    return (
        <>
            <Hero />
            <Categories />
            <TrustBand />
            <Reviews />
            <Certs />
            <FinalCta salon={salon} />
        </>
    )
}