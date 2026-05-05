import Link from "next/link"
import {getActiveServicesGrouped} from "@/features/booking/public-queries"
import {formatMoney} from "@/lib/money"

export default async function ServicesPage() {
    const groups = await getActiveServicesGrouped()

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Nasza oferta</h1>
                <Link
                    href="/rezerwacja"
                    className="inline-block px-4 py-2 bg-black text-white rounded"
                >
                    Zarezerwuj wizytę
                </Link>
            </div>

            {groups.map((group) => (
                <section key={group.categoryName}>
                    <h2 className="text-xl font-semibold mb-3">{group.categoryName}</h2>
                    <div className="space-y-2">
                        {group.services.map((service) => (
                            <div key={service.id} className="border rounded p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{service.name}</div>
                                    {service.description && (
                                        <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                                    )}
                                    <div className="text-sm text-gray-500 mt-1">{service.defaultDurationMin} min</div>
                                </div>
                                <div className="font-medium">{formatMoney(service.defaultPriceGr)}</div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}