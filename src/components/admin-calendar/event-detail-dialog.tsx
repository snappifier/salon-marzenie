"use client"

import Link from "next/link"

type EventProps = {
    serviceName: string
    staffName: string
    customerName: string
    customerPhone: string
    bookingId: string
    bufferAfterMin: number
}

type Props = {
    event: EventProps
    onClose: () => void
}

export function EventDetailDialog({event, onClose}: Props) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold">Szczegóły wizyty</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-2 text-sm">
                    <div>
                        <div className="text-gray-500">Klient</div>
                        <div className="font-medium">{event.customerName}</div>
                        <div>{event.customerPhone}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Zabieg</div>
                        <div>{event.serviceName}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Pracownik</div>
                        <div>{event.staffName}</div>
                    </div>
                    {event.bufferAfterMin > 0 && (
                        <div className="text-xs text-gray-500">
                            Bufor po zabiegu: {event.bufferAfterMin} min
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t flex gap-2">
                    <Link
                        href={`/admin/klienci`}
                        className="px-3 py-2 border rounded text-sm"
                    >
                        Zobacz klienta
                    </Link>
                </div>
            </div>
        </div>
    )
}