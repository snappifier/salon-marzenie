import {notFound} from "next/navigation"
import {StaffForm} from "@/components/staff/staff-form"
import {updateStaff} from "@/features/staff/actions"
import {getStaffById} from "@/features/staff/queries"

type Props = {
    params: Promise<{id: string}>
}

export default async function EditStaffPage({params}: Props) {
    const {id} = await params
    const staff = await getStaffById(id)

    if (!staff) notFound()

    const boundUpdate = updateStaff.bind(null, id)

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Edycja pracownika: {staff.firstName} {staff.lastName}
            </h1>
            <StaffForm action={boundUpdate} initialData={staff} />
        </div>
    )
}