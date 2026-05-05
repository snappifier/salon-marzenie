import Link from "next/link"
import {getAllStaff} from "@/features/staff/queries"
import {StaffRowActions} from "@/components/staff/staff-row-actions"

export default async function StaffPage() {
    const staff = await getAllStaff()

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Pracownicy</h1>
                <Link
                    href="/admin/pracownicy/nowy"
                    className="px-4 py-2 bg-black text-white rounded"
                >
                    Dodaj pracownika
                </Link>
            </div>

            <table className="w-full border-collapse">
                <thead>
                <tr className="border-b text-left">
                    <th className="p-2">Kolor</th>
                    <th className="p-2">Imię i nazwisko</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Telefon</th>
                    <th className="p-2">Usługi</th>
                    <th className="p-2">Grafik</th>
                    <th className="p-2">"Obojętnie kto"</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {staff.map((s) => (
                    <tr key={s.id} className="border-b">
                        <td className="p-2">
                            <div
                                className="w-6 h-6 rounded"
                                style={{backgroundColor: s.color}}
                            />
                        </td>
                        <td className="p-2">{s.firstName} {s.lastName}</td>
                        <td className="p-2">{s.email ?? "-"}</td>
                        <td className="p-2">{s.phone ?? "-"}</td>
                        <td className="p-2">{s._count.staffServices}</td>
                        <td className="p-2">{s._count.workingHours} dni</td>
                        <td className="p-2">{s.acceptsAnyAssignment ? "tak" : "nie"}</td>
                        <td className="p-2">
                            {s.active ? "aktywny" : "nieaktywny"}
                        </td>
                        <td className="p-2">
                            <StaffRowActions id={s.id} active={s.active} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {staff.length === 0 && (
                <p className="text-gray-500 mt-4">Brak pracowników.</p>
            )}
        </div>
    )
}