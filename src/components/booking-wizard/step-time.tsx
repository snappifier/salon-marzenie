"use client"

import {useEffect, useState} from "react"
import {useWizardStore} from "./wizard-store"
import {fetchSlotsForDay} from "@/features/booking/public-actions"
import {formatTime, formatDate, isoDayToDate} from "@/lib/date"
import type {SlotProposal} from "@/features/booking/types"

type SlotForUi = {
    startIso: string
    startLabel: string
    endLabel: string
    assignments: SlotProposal["assignments"]
}

export function StepTime() {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const selectedDate = useWizardStore((s) => s.selectedDate)
    const selectedSlotStartIso = useWizardStore((s) => s.selectedSlotStartIso)
    const setSelectedSlot = useWizardStore((s) => s.setSelectedSlot)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const [slots, setSlots] = useState<SlotForUi[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!selectedDate) return

        const requests = selectedServices.map((s) => ({
            serviceId: s.serviceId,
            staffPreference: s.staffPreference,
        }))

        setLoading(true)
        fetchSlotsForDay(requests, selectedDate)
            .then((data) => {
                const mapped: SlotForUi[] = data.map((s) => ({
                    startIso: s.startAt.toISOString(),
                    startLabel: formatTime(s.startAt),
                    endLabel: formatTime(s.endAt),
                    assignments: s.assignments,
                }))
                setSlots(mapped)
            })
            .finally(() => setLoading(false))
    }, [selectedDate, selectedServices])

    if (!selectedDate) {
        return <div>Najpierw wybierz dzień.</div>
    }

    if (loading) {
        return <div>Ładowanie godzin...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Wybierz godzinę</h2>
                <p className="text-sm text-gray-600 capitalize">
                    {formatDate(isoDayToDate(selectedDate))}
                </p>
            </div>

            {slots.length === 0 ? (
                <p className="text-gray-500">Brak wolnych terminów na ten dzień. Wybierz inny dzień.</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {slots.map((slot) => {
                        const isSelected = selectedSlotStartIso === slot.startIso
                        return (
                            <button
                                key={slot.startIso}
                                type="button"
                                onClick={() => setSelectedSlot(slot.startIso)}
                                className={`p-2 border rounded text-center
									${isSelected ? "border-black bg-gray-50" : "hover:border-black"}`}
                            >
                                <div className="font-medium">{slot.startLabel}</div>
                                <div className="text-xs text-gray-500">do {slot.endLabel}</div>
                            </button>
                        )
                    })}
                </div>
            )}

            <div className="flex justify-between pt-4 border-t">
                <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border rounded"
                >
                    Wstecz
                </button>
                <button
                    type="button"
                    onClick={nextStep}
                    disabled={!selectedSlotStartIso}
                    className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                    Dalej
                </button>
            </div>
        </div>
    )
}