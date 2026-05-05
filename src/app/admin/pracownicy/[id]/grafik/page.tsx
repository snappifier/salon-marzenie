import Link from "next/link"
import {notFound} from "next/navigation"
import {getStaffById} from "@/features/staff/queries"
import {getStaffWorkingHours, getStaffTimeOffs} from "@/features/staff/schedule-queries"
import {WorkingHoursForm} from "@/components/staff/working-hours-form"
import {TimeOffSection} from "@/components/staff/time-off-section"

type Props = {
    params: Promise<{id: string}>
}

export default async function StaffSchedulePage({params}: Props) {
    const {id} = await params
    const [staff, workingHours, timeOffs] = await Promise.all([
        getStaffById(id),
        getStaffWorkingHours(id),
        getStaffTimeOffs(id),
    ])

    if (!staff) notFound()

    return (
        <div className="p-6 space-y-8">
            <div>
                <Link
                    href="/admin/pracownicy"
                    className="text-sm text-gray-500 hover:underline"
                >
                    ← Powrót do listy
                </Link>
                <h1 className="text-2xl font-bold mt-2">
                    Grafik: {staff.firstName} {staff.lastName}
                </h1>
            </div>

            <section>
                <h2 className="text-lg font-semibold mb-3">Cykliczny grafik tygodniowy</h2>
                <WorkingHoursForm staffId={id} workingHours={workingHours} />
            </section>

            <section>
                <TimeOffSection staffId={id} timeOffs={timeOffs} />
            </section>
        </div>
    )
}