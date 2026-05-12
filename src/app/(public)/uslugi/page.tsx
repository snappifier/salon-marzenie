import {getSettings} from "@/features/settings/queries"
import {toPublicSalonInfo} from "@/lib/dto"
import {getCategoriesWithServices} from "@/features/landing/queries"
import {Container} from "@/components/ui/container"
import {ServicesHero} from "@/components/public/services/services-hero"
import {CategoryNav} from "@/components/public/services/category-nav"
import {HintBanner} from "@/components/public/services/hint-banner"
import {CategorySection} from "@/components/public/services/category-section"
import {FinalCta} from "@/components/public/landing/final-cta"

export const metadata = {
    title: "Usługi i cennik",
    description: "Pełna oferta studia kosmetyki estetycznej Marzenie - manicure, pedicure, brwi, rzęsy i więcej.",
}

const servicesCtaHeading = (
    <>
        Wybrałaś <span className="italic font-normal text-rose-600">swoją usługę</span>?
    </>
)

export default async function ServicesPage() {
    const settings = await getSettings()
    const salon = toPublicSalonInfo(settings)
    const categories = await getCategoriesWithServices()

    const navCategories = categories.map((c) => ({id: c.id, name: c.name, slug: c.slug}))

    return (
        <>
            <ServicesHero />
            <CategoryNav categories={navCategories} />
            <Container className="pt-6 md:pt-8">
                <HintBanner />
            </Container>
            <div>
                {categories.map((cat, i) => (
                    <CategorySection key={cat.id} category={cat} index={i} />
                ))}
            </div>
            <FinalCta
                salon={salon}
                heading={servicesCtaHeading}
                description="Zarezerwuj online w kilka kliknięć - wybierz pasujący termin i potwierdź. Lub po prostu zadzwoń, dopasujemy."
            />
        </>
    )
}