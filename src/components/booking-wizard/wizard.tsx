"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import {AnimatePresence, motion, type Variants} from "motion/react"
import {useWizardStore, prefsKey, slotsKey, deriveRequests, type StaffOption} from "./wizard-store"
import {StepIndicator} from "./step-indicator"
import {StepServices} from "./step-services"
import {StepStaff} from "./step-staff"
import {StepDate} from "./step-date"
import {StepTime} from "./step-time"
import {StepDetails} from "./step-details"
import {StepSummary} from "./step-summary"
import {easeOutQuint} from "./animations"
import {fetchAvailability} from "@/features/booking/public-actions"
import {dateToIsoDay} from "@/lib/date"

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

interface Props {
    groupedServices: GroupedService[]
    staffNames: StaffName[]
    allStaffByService: Record<string, StaffOption[]>
    initialServiceIds?: string[]
}

const STEP_LABELS = [
    "Usługi",
    "Pracownik",
    "Data",
    "Godzina",
    "Dane",
    "Podsumowanie",
]
const TOTAL_STEPS = STEP_LABELS.length

const easeInCubic: [number, number, number, number] = [0.4, 0, 1, 1]

const stepVariants: Variants = {
    enter: (direction: 1 | -1) => ({
        opacity: 0,
        x: direction === 1 ? "100%" : "-100%",
    }),
    center: {
        opacity: 1,
        x: 0,
        transition: {duration: 0.25, ease: easeOutQuint},
    },
    exit: (direction: 1 | -1) => ({
        opacity: 0,
        x: direction === 1 ? "-100%" : "100%",
        transition: {duration: 0.2, ease: easeInCubic},
    }),
}

export function Wizard({groupedServices, staffNames, allStaffByService, initialServiceIds}: Props) {
    const step = useWizardStore((s) => s.step)
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const preferredStaffId = useWizardStore((s) => s.preferredStaffId)
    const reset = useWizardStore((s) => s.reset)
    const initWith = useWizardStore((s) => s.initWith)
    const setDaysCache = useWizardStore((s) => s.setDaysCache)
    const setSlotsCache = useWizardStore((s) => s.setSlotsCache)

    useEffect(() => {
        if (initialServiceIds && initialServiceIds.length > 0) {
            initWith({selectedServices: initialServiceIds})
        }
        return () => reset()
    }, [reset, initWith, initialServiceIds])

    const prevStepRef = useRef(step)
    const direction: 1 | -1 = step >= prevStepRef.current ? 1 : -1

    const wizardRef = useRef<HTMLDivElement>(null)
    const firstStepRenderRef = useRef(true)

    useEffect(() => {
        if (firstStepRenderRef.current) {
            firstStepRenderRef.current = false
            return
        }
        wizardRef.current?.scrollIntoView({behavior: "smooth", block: "start"})
    }, [step])

    useEffect(() => {
        prevStepRef.current = step
    })

    const innerRef = useRef<HTMLDivElement>(null)
    const [boxHeight, setBoxHeight] = useState<number | "auto">("auto")

    useEffect(() => {
        const el = innerRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect.height
            if (typeof h === "number") setBoxHeight(h)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Availability prefetch: jeden roundtrip dla 14 dni → daysCache + slotsCache.
    // Staff data jest SSR-fetched i przekazywana jako prop — brak client-side
    // staff fetcha. deriveRequests używa propu bezpośrednio.

    const sPrefsKey = useMemo(
        () => prefsKey(selectedServices, preferredStaffId),
        [selectedServices, preferredStaffId],
    )
    const startDateIso = useMemo(() => dateToIsoDay(new Date()), [])

    useEffect(() => {
        if (!sPrefsKey || selectedServices.length === 0) return
        const current = useWizardStore.getState().daysCache
        if (current[sPrefsKey]) return
        const requests = deriveRequests(selectedServices, preferredStaffId, allStaffByService)
        fetchAvailability(requests, startDateIso, 14)
            .then(({days, slotsByDay}) => {
                setDaysCache(sPrefsKey, days)
                for (const dateIso in slotsByDay) {
                    setSlotsCache(
                        slotsKey(selectedServices, preferredStaffId, dateIso),
                        slotsByDay[dateIso],
                    )
                }
            })
            .catch((err) => console.error("availability prefetch failed:", err))
    }, [sPrefsKey, allStaffByService, selectedServices, preferredStaffId, startDateIso, setDaysCache, setSlotsCache])

    const serviceNames = groupedServices.flatMap((g) =>
        g.services.map((s) => ({id: s.id, name: s.name})),
    )

    const stepLabel = STEP_LABELS[step - 1] ?? ""

    return (
        <div
            className="scroll-mt-20 bg-white border border-border-soft rounded-2xl overflow-hidden shadow-sm"
            ref={wizardRef}
        >
            <header className="px-6 py-5 md:px-8 bg-cream border-b border-border-soft">
                <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} stepLabel={stepLabel} />
            </header>
            <motion.div
                className="relative overflow-hidden"
                animate={{height: boxHeight}}
                initial={false}
                transition={{height: {duration: 0.32, ease: easeOutQuint}}}
            >
                <div className="relative" ref={innerRef}>
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            className="p-6 md:p-8"
                            key={step}
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            style={{willChange: "transform, opacity"}}
                        >
                            {step === 1 && <StepServices groupedServices={groupedServices} />}
                            {step === 2 && <StepStaff groupedServices={groupedServices} allStaffByService={allStaffByService} />}
                            {step === 3 && <StepDate />}
                            {step === 4 && <StepTime />}
                            {step === 5 && <StepDetails />}
                            {step === 6 && <StepSummary serviceNames={serviceNames} staffNames={staffNames} allStaffByService={allStaffByService} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
