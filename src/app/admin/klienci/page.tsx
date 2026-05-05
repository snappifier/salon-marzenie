import Link from "next/link"
import {getAllCustomers} from "@/features/customers/queries"
import {CustomerRowActions} from "@/components/customers/customer-row-actions"
import {CustomerSearch} from "@/components/customers/customer-search"

type Props = {
    searchParams: Promise<{q?: string}>
}

export default async function CustomersPage({searchParams}: Props) {
    const {q} = await searchParams
    const customers = await getAllCustomers(q)

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Klienci</h1>
                <Link
                    href="/admin/klienci/nowy"
                    className="px-4 py-2 bg-black text-white rounded"
                >
                    Dodaj klienta
                </Link>
            </div>

            <div className="mb-4">
                <CustomerSearch initialQuery={q ?? ""} />
            </div>

            <table className="w-full border-collapse">
                <thead>
                <tr className="border-b text-left">
                    <th className="p-2">Imię i nazwisko</th>
                    <th className="p-2">Telefon</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Wizyt</th>
                    <th className="p-2">Marketing</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {customers.map((c) => (
                    <tr key={c.id} className="border-b">
                        <td className="p-2">{c.firstName} {c.lastName}</td>
                        <td className="p-2">{c.phone}</td>
                        <td className="p-2">{c.email ?? "-"}</td>
                        <td className="p-2">{c._count.bookings}</td>
                        <td className="p-2">{c.marketingConsent ? "tak" : "nie"}</td>
                        <td className="p-2">{c.active ? "aktywny" : "nieaktywny"}</td>
                        <td className="p-2">
                            <CustomerRowActions id={c.id} active={c.active} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {customers.length === 0 && (
                <p className="text-gray-500 mt-4">
                    {q ? "Nie znaleziono klientów dla tego wyszukiwania." : "Brak klientów."}
                </p>
            )}
        </div>
    )
}