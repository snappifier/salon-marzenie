import Link from "next/link"
import {getAllServices} from "@/features/services/queries"
import {formatMoney} from "@/lib/money"
import {ServiceRowActions} from "@/components/services/service-row-actions"

export default async function ServicesPage() {
    const services = await getAllServices()

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Usługi</h1>
                <Link
                    href="/admin/uslugi/nowa"
                    className="px-4 py-2 bg-black text-white rounded"
                >
                    Dodaj usługę
                </Link>
            </div>

            <table className="w-full border-collapse">
                <thead>
                <tr className="border-b text-left">
                    <th className="p-2">Nazwa</th>
                    <th className="p-2">Kategoria</th>
                    <th className="p-2">Czas</th>
                    <th className="p-2">Bufor</th>
                    <th className="p-2">Cena</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {services.map((s) => (
                    <tr key={s.id} className="border-b">
                        <td className="p-2">{s.name}</td>
                        <td className="p-2">{s.category.name}</td>
                        <td className="p-2">{s.defaultDurationMin} min</td>
                        <td className="p-2">{s.defaultBufferAfterMin} min</td>
                        <td className="p-2">{formatMoney(s.defaultPriceGr)}</td>
                        <td className="p-2">
                            {s.active ? "aktywna" : "nieaktywna"}
                        </td>
                        <td className="p-2">
                            <ServiceRowActions id={s.id} active={s.active} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {services.length === 0 && (
                <p className="text-gray-500 mt-4">Brak usług. Dodaj pierwszą.</p>
            )}
        </div>
    )
}