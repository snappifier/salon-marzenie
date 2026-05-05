"use client"

import {useEffect, useState} from "react"
import {useWizardStore} from "./wizard-store"
import {fetchDaysWithSlotCounts, type DayWithSlotCount} from "@/features/booking/public-actions"
import {dateToIsoDay, isoDayToDate} from "@/lib/date"
import {formatInTimeZone} from "date-fns-tz"
import {SALON_TIMEZONE} from "@/lib/date"

export function StepDate() {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const selectedDate = useWizardStore((s) => s.selectedDate)
    const setSelectedDate = useWizardStore((s) => s.setSelectedDate)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const [days, setDays] = useState<DayWithSlotCount[]>([])
    const [loading, setLoading] = useState(true)
    const [startDateIso] = useState(() => dateToIsoDay(new Date()))

    useEffect(() => {
        const requests = selectedServices.map((s) => ({
            serviceId: s.serviceId,
            staffPreference: s.staffPreference,
        }))

        setLoading(true)
        fetchDaysWithSlotCounts(requests, startDateIso, 14)
            .then(setDays)
            .finally(() => setLoading(false))
    }, [selectedServices, startDateIso])

    function handleSelect(dateIso: string) {
        setSelectedDate(dateIso)
        nextStep()
    }

    if (loading) {
        return <div>Sprawdzanie dostępności...</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Wybierz dzień</h2>
            <p className="text-sm text-gray-600">
                Pokazujemy dostępność na najbliższe 14 dni.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {days.map((day) => {
                    const date = isoDayToDate(day.dateIso)
                    const dayLabel = formatInTimeZone(date, SALON_TIMEZONE, "EEEE")
                    const dateLabel = formatInTimeZone(date, SALON_TIMEZONE, "d MMMM")
                    const isSelected = selectedDate === day.dateIso
                    const isAvailable = day.slotsCount > 0

                    return (
                        <button
                            key={day.dateIso}
                            type="button"
                            onClick={() => isAvailable && handleSelect(day.dateIso)}
                            disabled={!isAvailable}
                            className={`p-3 border rounded text-left disabled:opacity-40 disabled:cursor-not-allowed
								${isSelected ? "border-black bg-gray-50" : ""}
								${isAvailable ? "hover:border-black cursor-pointer" : ""}`}
                        >
                            <div className="font-medium capitalize">{dayLabel}</div>
                            <div className="text-sm text-gray-500">{dateLabel}</div>
                            <div className="text-xs mt-1">
                                {isAvailable ? `${day.slotsCount} wolnych terminów` : "brak terminów"}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="flex justify-between pt-4 border-t">
                <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border rounded"
                >
                    Wstecz
                </button>
            </div>
        </div>
    )
}