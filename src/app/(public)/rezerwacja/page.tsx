import {prisma} from "@/lib/prisma"
import {getActiveServicesGrouped} from "@/features/booking/public-queries"
import {Wizard} from "@/components/booking-wizard/wizard"

export default async function ReservationPage() {
    const [groupedServices, staffNames] = await Promise.all([
        getActiveServicesGrouped(),
        prisma.staff.findMany({
            where: {active: true},
            select: {id: true, firstName: true, lastName: true},
        }),
    ])

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Rezerwacja wizyty</h1>
            <Wizard groupedServices={groupedServices} staffNames={staffNames} />
        </div>
    )
}