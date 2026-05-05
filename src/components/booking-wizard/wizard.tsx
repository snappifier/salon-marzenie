"use client"

import {useEffect, useState} from "react"
import {useWizardStore} from "./wizard-store"
import {StepServices} from "./step-services"
import {StepStaff} from "./step-staff"
import {StepDate} from "./step-date"
import {StepTime} from "./step-time"
import {StepDetails} from "./step-details"
import {StepSummary} from "./step-summary"

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

type StaffName = {id: string; firstName: string; lastName: string}

type Props = {
    groupedServices: GroupedService[]
    staffNames: StaffName[]
}

const STEP_LABELS = [
    "Usługi",
    "Pracownik",
    "Data",
    "Godzina",
    "Dane",
    "Podsumowanie",
]

export function Wizard({groupedServices, staffNames}: Props) {
    const step = useWizardStore((s) => s.step)
    const reset = useWizardStore((s) => s.reset)

    useEffect(() => {
        return () => reset()
    }, [reset])

    const serviceNames = groupedServices.flatMap((g) =>
        g.services.map((s) => ({id: s.id, name: s.name})),
    )

    return (
        <div className="space-y-6">
            <StepIndicator currentStep={step} />
            <div className="border rounded p-6">
                {step === 1 && <StepServices groupedServices={groupedServices} />}
                {step === 2 && <StepStaff groupedServices={groupedServices} />}
                {step === 3 && <StepDate />}
                {step === 4 && <StepTime />}
                {step === 5 && <StepDetails />}
                {step === 6 && <StepSummary serviceNames={serviceNames} staffNames={staffNames} />}
            </div>
        </div>
    )
}

function StepIndicator({currentStep}: {currentStep: number}) {
    return (
        <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, i) => {
                const stepNum = i + 1
                const isCurrent = stepNum === currentStep
                const isPast = stepNum < currentStep
                return (
                    <div key={label} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
							${isCurrent ? "bg-black text-white" : isPast ? "bg-gray-300" : "bg-gray-100"}`}>
                            {stepNum}
                        </div>
                        <div className={`text-xs mt-1 ${isCurrent ? "font-semibold" : "text-gray-500"}`}>
                            {label}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}