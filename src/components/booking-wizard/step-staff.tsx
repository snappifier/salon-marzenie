"use client"

import {useEffect, useState} from "react"
import {useWizardStore} from "./wizard-store"
import {fetchStaffForServices} from "@/features/booking/public-actions"

type StaffOption = {
    id: string
    firstName: string
    lastName: string
    acceptsAnyAssignment: boolean
}

type GroupedService = {
    categoryName: string
    services: Array<{
        id: string
        name: string
        description: string | null
        defaultDurationMin: number
        defaultBufferAfterMin: number
        defaultPriceGr: number
        categoryId: string
    }>
}

type Props = {
    groupedServices: GroupedService[]
}

export function StepStaff({groupedServices}: Props) {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const setStaffPreference = useWizardStore((s) => s.setStaffPreference)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const [staffByService, setStaffByService] = useState<Record<string, StaffOption[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const ids = selectedServices.map((s) => s.serviceId)
        setLoading(true)
        fetchStaffForServices(ids)
            .then((data) => setStaffByService(data))
            .finally(() => setLoading(false))
    }, [selectedServices])

    function findServiceName(serviceId: string): string {
        for (const group of groupedServices) {
            const svc = group.services.find((s) => s.id === serviceId)
            if (svc) return svc.name
        }
        return "Usługa"
    }

    if (loading) {
        return <div>Ładowanie pracowników...</div>
    }

    const hasMissingStaff = selectedServices.some(
        (s) => (staffByService[s.serviceId]?.length ?? 0) === 0,
    )

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Wybierz pracownika</h2>
            <p className="text-sm text-gray-600">
                Dla każdej usługi możesz wybrać konkretnego pracownika lub pozwolić nam dobrać dostępnego.
            </p>

            {hasMissingStaff && (
                <div className="p-3 border border-red-300 bg-red-50 rounded text-sm text-red-700">
                    Niektóre usługi nie mają obecnie dostępnych pracowników. Skontaktuj się z salonem telefonicznie.
                </div>
            )}

            <div className="space-y-4">
                {selectedServices.map((sel) => {
                    const options = staffByService[sel.serviceId] ?? []
                    const anyAvailable = options.some((s) => s.acceptsAnyAssignment)

                    return (
                        <div key={sel.serviceId} className="border rounded p-3">
                            <div className="font-medium mb-2">{findServiceName(sel.serviceId)}</div>

                            {options.length === 0 ? (
                                <p className="text-sm text-red-600">Brak dostępnych pracowników</p>
                            ) : (
                                <div className="space-y-2">
                                    {anyAvailable && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`staff-${sel.serviceId}`}
                                                checked={sel.staffPreference === "any"}
                                                onChange={() => setStaffPreference(sel.serviceId, "any")}
                                            />
                                            <span>Obojętnie kto (najszybciej dostępny)</span>
                                        </label>
                                    )}
                                    {options.map((staff) => (
                                        <label key={staff.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`staff-${sel.serviceId}`}
                                                checked={sel.staffPreference === staff.id}
                                                onChange={() => setStaffPreference(sel.serviceId, staff.id)}
                                            />
                                            <span>{staff.firstName} {staff.lastName}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
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
                <button
                    type="button"
                    onClick={nextStep}
                    disabled={hasMissingStaff}
                    className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                    Dalej
                </button>
            </div>
        </div>
    )
}