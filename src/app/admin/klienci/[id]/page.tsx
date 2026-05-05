import Link from "next/link"
import {notFound} from "next/navigation"
import {getCustomerById, getCustomerBookings} from "@/features/customers/queries"
import {formatDate, formatTime} from "@/lib/date"
import {formatMoney} from "@/lib/money"

type Props = {
    params: Promise<{id: string}>
}

const STATUS_LABELS = {
    PENDING: "oczekująca",
    CONFIRMED: "potwierdzona",
    CANCELLED: "anulowana",
    COMPLETED: "zrealizowana",
    NO_SHOW: "nie przyszedł",
} as const

export default async function CustomerDetailPage({params}: Props) {
    const {id} = await params
    const [customer, bookings] = await Promise.all([
        getCustomerById(id),
        getCustomerBookings(id),
    ])

    if (!customer) notFound()

    return (
        <div className="p-6 space-y-6">
            <div>
                <Link
                    href="/admin/klienci"
                    className="text-sm text-gray-500 hover:underline"
                >
                    ← Powrót do listy
                </Link>
                <div className="flex items-center justify-between mt-2">
                    <h1 className="text-2xl font-bold">
                        {customer.firstName} {customer.lastName}
                    </h1>
                    <Link
                        href={`/admin/klienci/${id}/edytuj`}
                        className="px-3 py-1 border rounded text-sm"
                    >
                        Edytuj
                    </Link>
                </div>
            </div>

            <section className="border rounded p-4 space-y-2 max-w-xl">
                <h2 className="font-semibold mb-2">Dane kontaktowe</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Telefon:</div>
                    <div>{customer.phone}</div>
                    <div className="text-gray-500">Email:</div>
                    <div>{customer.email ?? "-"}</div>
                    <div className="text-gray-500">Marketing:</div>
                    <div>{customer.marketingConsent ? "tak" : "nie"}</div>
                    <div className="text-gray-500">Status:</div>
                    <div>{customer.active ? "aktywny" : "nieaktywny"}</div>
                </div>
                {customer.notes && (
                    <div className="pt-2 border-t mt-2">
                        <div className="text-gray-500 text-sm mb-1">Notatki:</div>
                        <div className="text-sm whitespace-pre-wrap">{customer.notes}</div>
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-3">
                    Historia wizyt ({bookings.length})
                </h2>

                {bookings.length === 0 ? (
                    <p className="text-gray-500 text-sm">Brak wizyt.</p>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) => {
                            const firstItem = booking.items[0]
                            const lastItem = booking.items[booking.items.length - 1]
                            const totalPrice = booking.items.reduce((sum, i) => sum + i.priceGr, 0)

                            return (
                                <div key={booking.id} className="border rounded p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium">
                                            {firstItem
                                                ? `${formatDate(firstItem.startAt)}, ${formatTime(firstItem.startAt)} - ${formatTime(lastItem.endAt)}`
                                                : "(brak zabiegów)"}
                                        </div>
                                        <div className="text-sm">
											<span className="px-2 py-1 border rounded">
												{STATUS_LABELS[booking.status]}
											</span>
                                        </div>
                                    </div>

                                    <ul className="text-sm space-y-1 ml-4 list-disc">
                                        {booking.items.map((item) => (
                                            <li key={item.id}>
                                                {item.service.name} - {item.staff.firstName} {item.staff.lastName}
                                                <span className="text-gray-500 ml-2">
													({item.durationMin} min, {formatMoney(item.priceGr)})
												</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                                        <div className="text-gray-500">
                                            Utworzono: {formatDate(booking.createdAt)}
                                            {booking.createdByAdmin && " (przez admina)"}
                                        </div>
                                        <div className="font-medium">
                                            Razem: {formatMoney(totalPrice)}
                                        </div>
                                    </div>

                                    {booking.customerNote && (
                                        <div className="text-sm mt-2 text-gray-600">
                                            Notatka klienta: {booking.customerNote}
                                        </div>
                                    )}
                                    {booking.adminNote && (
                                        <div className="text-sm mt-1 text-gray-600">
                                            Notatka admina: {booking.adminNote}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}