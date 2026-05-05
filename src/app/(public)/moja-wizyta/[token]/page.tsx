import Link from "next/link"
import {notFound} from "next/navigation"
import {getBookingByToken} from "@/features/booking/manage-queries"
import {prisma} from "@/lib/prisma"
import {formatDate, formatTime} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {CancelBookingButton} from "@/components/manage/cancel-booking-button"

type Props = {
    params: Promise<{token: string}>
}

const STATUS_LABELS = {
    PENDING: {label: "oczekująca", color: "bg-yellow-100 text-yellow-900"},
    CONFIRMED: {label: "potwierdzona", color: "bg-green-100 text-green-900"},
    CANCELLED: {label: "anulowana", color: "bg-gray-100 text-gray-700"},
    COMPLETED: {label: "zrealizowana", color: "bg-blue-100 text-blue-900"},
    NO_SHOW: {label: "nieobecność", color: "bg-red-100 text-red-900"},
} as const

export default async function ManageBookingPage({params}: Props) {
    const {token} = await params
    const [booking, settings] = await Promise.all([
        getBookingByToken(token),
        prisma.settings.findUnique({where: {id: "settings"}}),
    ])

    if (!booking || !settings) notFound()

    const totalPrice = booking.items.reduce((sum, i) => sum + i.priceGr, 0)
    const firstItem = booking.items[0]
    const lastItem = booking.items[booking.items.length - 1]

    const isCancellable = booking.status === "PENDING" || booking.status === "CONFIRMED"
    const cancelDeadline = firstItem
        ? new Date(firstItem.startAt.getTime() - settings.minCancelHoursBefore * 60 * 60 * 1000)
        : null
    const canCancelByPolicy = cancelDeadline ? new Date() <= cancelDeadline : false

    const statusInfo = STATUS_LABELS[booking.status]

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold">Twoja wizyta</h1>
                <span className={`px-3 py-1 rounded text-sm ${statusInfo.color}`}>
					{statusInfo.label}
				</span>
            </div>

            {booking.status === "CANCELLED" && (
                <div className="border border-gray-300 bg-gray-50 rounded p-3 text-sm">
                    Wizyta została anulowana
                    {booking.cancelledAt && ` ${formatDate(booking.cancelledAt)}`}.
                </div>
            )}

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
                {booking.customerNote && (
                    <div className="text-sm text-gray-600 mt-2 pt-2 border-t">
                        Notatka: {booking.customerNote}
                    </div>
                )}
            </section>

            {isCancellable && (
                <section className="border rounded p-4 space-y-3">
                    <h2 className="font-semibold">Anulowanie</h2>
                    {canCancelByPolicy ? (
                        <>
                            <p className="text-sm text-gray-600">
                                Możesz anulować tę wizytę najpóźniej {settings.minCancelHoursBefore}h przed jej rozpoczęciem.
                            </p>
                            <CancelBookingButton token={token} />
                        </>
                    ) : (
                        <p className="text-sm text-red-600">
                            Termin anulowania online minął ({settings.minCancelHoursBefore}h przed wizytą).
                            Skontaktuj się z salonem telefonicznie.
                        </p>
                    )}
                </section>
            )}

            <div className="pt-4">
                <Link
                    href="/"
                    className="text-sm text-gray-500 hover:underline"
                >
                    ← Powrót na stronę główną
                </Link>
            </div>
        </div>
    )
}