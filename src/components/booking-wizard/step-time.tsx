"use client"

import {useMemo} from "react"
import {motion} from "motion/react"
import {ArrowLeft, ArrowRight} from "lucide-react"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {useWizardStore, slotsKey} from "./wizard-store"
import {groupVariants, itemVariants} from "./animations"
import {formatTime, isoDayToDate, SALON_TIMEZONE} from "@/lib/date"
import {Button} from "@/components/ui/button"
import {Heading} from "@/components/ui/heading"
import {cn} from "@/lib/cn"
import type {SlotProposal} from "@/features/booking/types"

type Period = "morning" | "afternoon" | "evening"

const PERIOD_LABELS: Record<Period, string> = {
    morning: "Rano",
    afternoon: "Po południu",
    evening: "Wieczorem",
}

function periodOfSlot(d: Date): Period {
    const hour = parseInt(formatInTimeZone(d, SALON_TIMEZONE, "H"), 10)
    if (hour < 12) return "morning"
    if (hour < 17) return "afternoon"
    return "evening"
}

export function StepTime() {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const preferredStaffId = useWizardStore((s) => s.preferredStaffId)
    const selectedDate = useWizardStore((s) => s.selectedDate)
    const selectedSlotStartIso = useWizardStore((s) => s.selectedSlotStartIso)
    const setSelectedSlot = useWizardStore((s) => s.setSelectedSlot)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const cacheKey = useMemo(
        () => (selectedDate ? slotsKey(selectedServices, preferredStaffId, selectedDate) : null),
        [selectedServices, preferredStaffId, selectedDate],
    )
    const slots = useWizardStore((s) => (cacheKey ? s.slotsCache[cacheKey] : undefined))

    const grouped = useMemo(() => {
        if (!slots) return null
        const groups: Record<Period, SlotProposal[]> = {morning: [], afternoon: [], evening: []}
        for (const slot of slots) {
            groups[periodOfSlot(slot.startAt)].push(slot)
        }
        return groups
    }, [slots])

    if (!selectedDate) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-secondary">Najpierw wybierz dzień.</p>
                <Button variant="secondary" type="button" onClick={prevStep}>
                    <ArrowLeft size={16} />
                    Wstecz
                </Button>
            </div>
        )
    }

    if (!slots) {
        return (
            <div className="space-y-7" aria-busy="true">
                <div>
                    <Heading level="h3" className="mb-1">Wybierz godzinę</Heading>
                    <p className="text-sm text-secondary leading-relaxed capitalize">
                        {formatInTimeZone(isoDayToDate(selectedDate), SALON_TIMEZONE, "EEEE, d MMMM", {locale: pl})}
                    </p>
                </div>
                <div className="space-y-6">
                    {Array.from({length: 2}).map((_, i) => (
                        <section key={i}>
                            <div className="h-3 w-20 bg-surface-muted rounded animate-pulse mb-3" aria-hidden="true" />
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {Array.from({length: 8}).map((__, j) => (
                                    <div
                                        key={j}
                                        className="h-[52px] bg-surface-muted border border-border-subtle rounded-lg animate-pulse"
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
                <span className="sr-only">Ładowanie godzin</span>
            </div>
        )
    }

    if (slots.length === 0) {
        return (
            <div className="space-y-7">
                <div>
                    <Heading level="h3" className="mb-1">Wybierz godzinę</Heading>
                    <p className="text-sm text-secondary leading-relaxed capitalize">
                        {formatInTimeZone(isoDayToDate(selectedDate), SALON_TIMEZONE, "EEEE, d MMMM", {locale: pl})}
                    </p>
                </div>
                <p className="text-sm text-secondary px-4 py-3 rounded-lg bg-paper-300 border border-border-subtle">
                    Brak wolnych terminów na ten dzień. Wybierz inny.
                </p>
                <Button variant="secondary" type="button" onClick={prevStep}>
                    <ArrowLeft size={16} />
                    Wybierz inny dzień
                </Button>
            </div>
        )
    }

    return (
        <motion.div className="space-y-7" variants={groupVariants}>
            <motion.div variants={itemVariants}>
                <Heading level="h3" className="mb-1">Wybierz godzinę</Heading>
                <p className="text-sm text-secondary leading-relaxed capitalize">
                    {formatInTimeZone(isoDayToDate(selectedDate), SALON_TIMEZONE, "EEEE, d MMMM", {locale: pl})}
                </p>
            </motion.div>

            <motion.div className="space-y-6" variants={groupVariants}>
                {(Object.keys(PERIOD_LABELS) as Period[]).map((period) => {
                    const periodSlots = grouped![period]
                    if (periodSlots.length === 0) return null

                    return (
                        <motion.section key={period} variants={itemVariants}>
                            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-interactive mb-3">
                                {PERIOD_LABELS[period]}
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {periodSlots.map((slot) => {
                                    const iso = slot.startAt.toISOString()
                                    const isSelected = selectedSlotStartIso === iso
                                    return (
                                        <button
                                            key={iso}
                                            type="button"
                                            onClick={() => setSelectedSlot(iso)}
                                            className={cn(
                                                "px-2 py-2.5 border rounded-lg text-center bg-surface",
                                                "transition-[border-color,background-color,color,box-shadow] duration-150 ease-out",
                                                "active:scale-[0.97]",
                                                isSelected
                                                    ? "border-interactive bg-interactive text-white shadow-sm"
                                                    : "border-border-subtle text-primary hover-supported:hover:border-accent-100 hover-supported:hover:bg-surface-muted",
                                            )}
                                        >
                                            <div className="font-medium text-sm tabular-nums">{formatTime(slot.startAt)}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.section>
                    )
                })}
            </motion.div>

            <motion.div
                className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 pt-4 pb-2 bg-surface/95 backdrop-blur-sm border-t border-border-subtle"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between gap-3">
                    <Button variant="secondary" type="button" onClick={prevStep}>
                        <ArrowLeft size={16} />
                        Wstecz
                    </Button>
                    <Button type="button" onClick={nextStep} disabled={!selectedSlotStartIso}>
                        Dalej
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}
