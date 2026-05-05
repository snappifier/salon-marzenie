import Link from "next/link"
import {notFound} from "next/navigation"
import {getStaffById} from "@/features/staff/queries"
import {getStaffServices, getAllActiveServicesWithCategory} from "@/features/staff/services-queries"
import {StaffServicesForm} from "@/components/staff/staff-services-form"

type Props = {
    params: Promise<{id: string}>
}

export default async function StaffServicesPage({params}: Props) {
    const {id} = await params
    const [staff, allServices, currentAssignments] = await Promise.all([
        getStaffById(id),
        getAllActiveServicesWithCategory(),
        getStaffServices(id),
    ])

    if (!staff) notFound()

    return (
        <div className="p-6 space-y-6">
            <div>
                <Link
                    href="/admin/pracownicy"
                    className="text-sm text-gray-500 hover:underline"
                >
                    ← Powrót do listy
                </Link>
                <h1 className="text-2xl font-bold mt-2">
                    Usługi: {staff.firstName} {staff.lastName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Zaznacz usługi które wykonuje. Pola override możesz zostawić puste -
                    wtedy użyte zostaną wartości domyślne.
                </p>
            </div>

            <StaffServicesForm
                staffId={id}
                allServices={allServices}
                currentAssignments={currentAssignments}
            />
        </div>
    )
}