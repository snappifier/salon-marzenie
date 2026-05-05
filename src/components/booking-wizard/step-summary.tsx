"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {useWizardStore} from "./wizard-store"
import {fetchSlotsForDay, createBooking} from "@/features/booking/public-actions"
import {formatDate, formatTime} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import type {SlotProposal} from "@/features/booking/types"

type StaffName = {id: string; firstName: string; lastName: string}
type ServiceName = {id: string; name: string}

type Props = {
    serviceNames: ServiceName[]
    staffNames: StaffName[]
}

export function StepSummary({serviceNames, staffNames}: Props) {
    const router = useRouter()
    const customer = useWizardStore((s) => s.customer)
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const selectedDate = useWizardStore((s) => s.selectedDate)
    const selectedSlotStartIso = useWizardStore((s) => s.selectedSlotStartIso)
    const prevStep = useWizardStore((s) => s.prevStep)
    const reset = useWizardStore((s) => s.reset)

    const [slot, setSlot] = useState<SlotProposal | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!selectedDate || !selectedSlotStartIso) return

        const requests = selectedServices.map((s) => ({
            serviceId: s.serviceId,
            staffPreference: s.staffPreference,
        }))

        fetchSlotsForDay(requests, selectedDate)
            .then((slots) => {
                const found = slots.find((s) => s.startAt.toISOString() === selectedSlotStartIso)
                setSlot(found ?? null)
            })
            .finally(() => setLoading(false))
    }, [selectedDate, selectedSlotStartIso, selectedServices])

    function getServiceName(id: string) {
        return serviceNames.find((s) => s.id === id)?.name ?? "Usługa"
    }

    function getStaffName(id: string) {
        const s = staffNames.find((s) => s.id === id)
        return s ? `${s.firstName} ${s.lastName}` : "Pracownik"
    }

    async function handleSubmit() {
        if (!selectedDate || !selectedSlotStartIso) return

        setSubmitting(true)
        setError(null)

        const result = await createBooking({
            requests: selectedServices,
            dateIso: selectedDate,
            startIso: selectedSlotStartIso,
            customer,
        })

        if (!result.success) {
            setError(result.error)
            setSubmitting(false)
            return
        }

        // Sukces - przekierowujemy na stronę sukcesu z manageToken w URL
        const token = result.manageToken
        const id = result.bookingId
        reset()
        router.push(`/rezerwacja/sukces/${id}?token=${token}`)
    }

    if (loading) {
        return <div>Ładowanie podsumowania...</div>
    }

    if (!slot) {
        return (
            <div className="space-y-4">
                <p className="text-red-600">Wybrany termin nie jest już dostępny.</p>
                <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border rounded"
                >
                    Wybierz inny termin
                </button>
            </div>
        )
    }

    const totalPrice = slot.assignments.reduce((sum, a) => sum + a.priceGr, 0)
    const totalDuration = slot.assignments.reduce((sum, a) => sum + a.durationMin, 0)

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Podsumowanie</h2>

            <section className="border rounded p-4 space-y-3">
                <div>
                    <div className="text-sm text-gray-500">Data i godzina</div>
                    <div className="font-medium">
                        {formatDate(slot.startAt)}, {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Łączny czas wizyty: {totalDuration} min
                    </div>
                </div>

                <div className="border-t pt-3">
                    <div className="text-sm text-gray-500 mb-2">Zabiegi</div>
                    <ul className="space-y-2">
                        {slot.assignments.map((a, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm">
                                <div>
									<span className="font-medium">
										{formatTime(a.startAt)} - {formatTime(a.endAt)}
									</span>
                                    <span className="ml-2">{getServiceName(a.serviceId)}</span>
                                    <span className="text-gray-500 ml-2">
										({getStaffName(a.staffId)})
									</span>
                                </div>
                                <div>{formatMoney(a.priceGr)}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-t pt-3 flex justify-between font-medium">
                    <div>Razem</div>
                    <div>{formatMoney(totalPrice)}</div>
                </div>
            </section>

            <section className="border rounded p-4">
                <div className="text-sm text-gray-500 mb-2">Twoje dane</div>
                <div className="text-sm space-y-1">
                    <div>{customer.firstName} {customer.lastName}</div>
                    <div>{customer.phone}</div>
                    {customer.email && <div>{customer.email}</div>}
                    {customer.customerNote && (
                        <div className="mt-2 text-gray-600">Notatka: {customer.customerNote}</div>
                    )}
                    {customer.createAccount && (
                        <div className="mt-2 text-gray-600">Konto zostanie założone na ten email.</div>
                    )}
                </div>
            </section>

            {error && (
                <p className="text-red-600">{error}</p>
            )}

            <div className="flex justify-between pt-4 border-t">
                <button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Wstecz
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                    {submitting ? "Rezerwowanie..." : "Potwierdź rezerwację"}
                </button>
            </div>
        </div>
    )
}