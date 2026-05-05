import {StaffForm} from "@/components/staff/staff-form"
import {createStaff} from "@/features/staff/actions"

export default function NewStaffPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Nowy pracownik</h1>
            <StaffForm action={createStaff} />
        </div>
    )
}