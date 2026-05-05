"use client"

import {useWizardStore} from "./wizard-store"
import {formatMoney} from "@/lib/money"

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

export function StepServices({groupedServices}: Props) {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const addService = useWizardStore((s) => s.addService)
    const removeService = useWizardStore((s) => s.removeService)
    const nextStep = useWizardStore((s) => s.nextStep)

    const isSelected = (id: string) =>
        selectedServices.some((s) => s.serviceId === id)

    const totalDuration = selectedServices.reduce((sum, sel) => {
        for (const group of groupedServices) {
            const svc = group.services.find((s) => s.id === sel.serviceId)
            if (svc) return sum + svc.defaultDurationMin
        }
        return sum
    }, 0)

    const totalPrice = selectedServices.reduce((sum, sel) => {
        for (const group of groupedServices) {
            const svc = group.services.find((s) => s.id === sel.serviceId)
            if (svc) return sum + svc.defaultPriceGr
        }
        return sum
    }, 0)

    function handleToggle(serviceId: string) {
        if (isSelected(serviceId)) {
            removeService(serviceId)
        } else {
            addService(serviceId)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Wybierz usługi</h2>
            <p className="text-sm text-gray-600">
                Możesz wybrać kilka usług - wykonamy je w jednej wizycie.
            </p>

            {groupedServices.map((group) => (
                <section key={group.categoryName}>
                    <h3 className="font-medium text-gray-700 mb-2">{group.categoryName}</h3>
                    <div className="space-y-2">
                        {group.services.map((service) => {
                            const selected = isSelected(service.id)
                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => handleToggle(service.id)}
                                    className={`w-full text-left p-3 border rounded flex items-center justify-between
										${selected ? "border-black bg-gray-50" : ""}`}
                                >
                                    <div>
                                        <div className="font-medium">{service.name}</div>
                                        {service.description && (
                                            <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                                        )}
                                        <div className="text-sm text-gray-500 mt-1">
                                            {service.defaultDurationMin} min
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatMoney(service.defaultPriceGr)}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {selected ? "Wybrano" : "Wybierz"}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </section>
            ))}

            {selectedServices.length > 0 && (
                <div className="border-t pt-4 sticky bottom-0 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-sm text-gray-500">Wybrane usługi: {selectedServices.length}</div>
                            <div className="font-medium">
                                Razem: {totalDuration} min, {formatMoney(totalPrice)}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-2 bg-black text-white rounded"
                        >
                            Dalej
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}