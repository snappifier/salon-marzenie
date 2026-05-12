import {prisma} from "@/lib/prisma"
import {getActiveServicesGrouped, getAllStaffByService} from "@/features/booking/public-queries"
import {Wizard} from "@/components/booking-wizard/wizard"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"

export const metadata = {
    title: "Rezerwacja wizyty",
    description: "Umów wizytę online w studiu Marzenie - wybierz zabieg, pracownika i pasujący termin.",
}

type Props = {
    searchParams: Promise<{service?: string | string[]}>
}

export default async function ReservationPage({searchParams}: Props) {
    const sp = await searchParams
    const [groupedServices, staffNames, allStaffByService] = await Promise.all([
        getActiveServicesGrouped(),
        prisma.staff.findMany({
            where: {active: true},
            select: {id: true, firstName: true, lastName: true},
        }),
        getAllStaffByService(),
    ])

    const validIds = new Set(groupedServices.flatMap((g) => g.services.map((s) => s.id)))
    const requested = Array.isArray(sp.service) ? sp.service : sp.service ? [sp.service] : []
    const initialServiceIds = requested.filter((id) => validIds.has(id))

    return (
        <Container size="narrow" className="py-12 md:py-16">
            <div className="mb-8 md:mb-10">
                <Eyebrow className="mb-3">Rezerwacja</Eyebrow>
                <Heading level="h1" className="mb-3">
                    Umów <span className="italic font-normal text-rose-600">swoją wizytę</span>
                </Heading>
                <p className="text-base text-graphite-600 leading-relaxed max-w-[520px]">
                    Wybierz zabiegi, pasującego pracownika i termin. Potwierdzenie dostaniesz SMS-em.
                </p>
            </div>
            <Wizard
                groupedServices={groupedServices}
                staffNames={staffNames}
                allStaffByService={allStaffByService}
                initialServiceIds={initialServiceIds}
            />
        </Container>
    )
}
