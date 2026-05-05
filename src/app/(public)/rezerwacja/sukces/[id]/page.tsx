import {notFound} from "next/navigation"
import Link from "next/link"
import {prisma} from "@/lib/prisma"
import {formatDate, formatTime} from "@/lib/date"
import {formatMoney} from "@/lib/money"

type Props = {
    params: Promise<{id: string}>
    searchParams: Promise<{token?: string}>
}

export default async function BookingSuccessPage({params, searchParams}: Props) {
    const {id} = await params
    const {token} = await searchParams

    const booking = await prisma.booking.findUnique({
        where: {id},
        include: {
            customer: true,
            items: {
                include: {service: true, staff: true},
                orderBy: {order: "asc"},
            },
        },
    })

    if (!booking || booking.manageToken !== token) {
        notFound()
    }

    const totalPrice = booking.items.reduce((sum, i) => sum + i.priceGr, 0)
    const firstItem = booking.items[0]
    const lastItem = booking.items[booking.items.length - 1]

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="border border-green-300 bg-green-50 rounded p-4">
                <h1 className="text-2xl font-bold text-green-900 mb-1">
                    Wizyta zarezerwowana
                </h1>
                <p className="text-sm text-green-800">
                    Wysłaliśmy SMS z potwierdzeniem na {booking.customer.phone}.
                </p>
            </div>

            <section className="border rounded p-4 space-y-3">
                <div>
                    <div className="text-sm text-gray-500">Termin</div>
                    <div className="font-medium">
                        {firstItem && `${formatDate(firstItem.startAt)}, ${formatTime(firstItem.startAt)} - ${formatTime(lastItem.endAt)}`}
                    </div>
                </div>

                <div className="border-t pt-3">
                    <div className="text-sm text-gray-500 mb-2">Zabiegi</div>
                    <ul className="space-y-2">
                        {booking.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-sm">
                                <div>
									<span className="font-medium">
										{formatTime(item.startAt)} - {formatTime(item.endAt)}
									</span>
                                    <span className="ml-2">{item.service.name}</span>
                                    <span className="text-gray-500 ml-2">
										({item.staff.firstName} {item.staff.lastName})
									</span>
                                </div>
                                <div>{formatMoney(item.priceGr)}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-t pt-3 flex justify-between font-medium">
                    <div>Razem</div>
                    <div>{formatMoney(totalPrice)}</div>
                </div>
            </section>

            <section className="border rounded p-4 space-y-2">
                <div className="text-sm text-gray-500">Klient</div>
                <div>{booking.customer.firstName} {booking.customer.lastName}</div>
                <div className="text-sm">{booking.customer.phone}</div>
                {booking.customer.email && <div className="text-sm">{booking.customer.email}</div>}
            </section>

            <div className="space-y-2">
                <Link
                    href={`/moja-wizyta/${booking.manageToken}`}
                    className="block w-full text-center px-4 py-2 border rounded"
                >
                    Zarządzaj wizytą (anuluj, sprawdź szczegóły)
                </Link>
                <Link
                    href="/"
                    className="block w-full text-center px-4 py-2 text-gray-600"
                >
                    Wróć na stronę główną
                </Link>
            </div>
        </div>
    )
}