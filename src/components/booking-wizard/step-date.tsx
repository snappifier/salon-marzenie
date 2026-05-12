"use client"

import {useMemo} from "react"
import {motion} from "motion/react"
import {ArrowLeft} from "lucide-react"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {useWizardStore, prefsKey} from "./wizard-store"
import {groupVariants, itemVariants} from "./animations"
import {isoDayToDate, SALON_TIMEZONE} from "@/lib/date"
import {Button} from "@/components/ui/button"
import {Heading} from "@/components/ui/heading"
import {cn} from "@/lib/cn"

export function StepDate() {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const preferredStaffId = useWizardStore((s) => s.preferredStaffId)
    const selectedDate = useWizardStore((s) => s.selectedDate)
    const setSelectedDate = useWizardStore((s) => s.setSelectedDate)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const sPrefsKey = useMemo(
        () => prefsKey(selectedServices, preferredStaffId),
        [selectedServices, preferredStaffId],
    )
    const days = useWizardStore((s) => s.daysCache[sPrefsKey])
    const loading = days === undefined

    function handleSelect(dateIso: string) {
        setSelectedDate(dateIso)
        nextStep()
    }

    if (loading) {
        return (
            <div className="space-y-7" aria-busy="true">
                <div>
                    <Heading level="h3" className="mb-1">Wybierz dzień</Heading>
                    <p className="text-sm text-graphite-600 leading-relaxed">
                        Pokazujemy dostępność na najbliższe 14 dni.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {Array.from({length: 14}).map((_, i) => (
                        <div
                            key={i}
                            className="h-[92px] bg-graphite-50 border border-border-soft rounded-lg animate-pulse"
                            aria-hidden="true"
                        />
                    ))}
                </div>
                <span className="sr-only">Sprawdzanie dostępności</span>
            </div>
        )
    }

    return (
        <motion.div className="space-y-7" variants={groupVariants}>
            <motion.div variants={itemVariants}>
                <Heading level="h3" className="mb-1">Wybierz dzień</Heading>
                <p className="text-sm text-graphite-600 leading-relaxed">
                    Pokazujemy dostępność na najbliższe 14 dni.
                </p>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
                variants={groupVariants}
            >
                {days.map((day) => {
                    const date = isoDayToDate(day.dateIso)
                    const dayName = formatInTimeZone(date, SALON_TIMEZONE, "EEEE", {locale: pl})
                    const dateLabel = formatInTimeZone(date, SALON_TIMEZONE, "d MMM", {locale: pl})
                    const isSelected = selectedDate === day.dateIso
                    const isAvailable = day.slotsCount > 0

                    return (
                        <motion.button
                            key={day.dateIso}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => isAvailable && handleSelect(day.dateIso)}
                            variants={itemVariants}
                            className={cn(
                                "p-3.5 border rounded-lg text-left",
                                "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
                                isSelected && "bg-rose-50 border-rose-500 shadow-[0_0_0_1px_var(--color-rose-500)]",
                                !isSelected && isAvailable && "bg-white border-border-default hover-supported:hover:border-rose-300 active:scale-[0.99]",
                                !isAvailable && "bg-graphite-50 border-transparent cursor-not-allowed",
                            )}
                        >
                            <div
                                className={cn(
                                    "text-[10px] uppercase tracking-[0.14em] font-medium mb-1.5",
                                    isAvailable ? "text-rose-600" : "text-graphite-400",
                                )}
                            >
                                {dayName}
                            </div>
                            <div
                                className={cn(
                                    "font-serif font-medium text-[17px] leading-tight mb-1.5 capitalize",
                                    isAvailable ? "text-graphite-900" : "text-graphite-400",
                                )}
                            >
                                {dateLabel}
                            </div>
                            <div
                                className={cn(
                                    "text-[11px]",
                                    isAvailable ? "text-graphite-400" : "text-graphite-300 italic",
                                )}
                            >
                                {isAvailable
                                    ? `${day.slotsCount} ${pluralTermin(day.slotsCount)}`
                                    : "brak terminów"}
                            </div>
                        </motion.button>
                    )
                })}
            </motion.div>

            <motion.div
                className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 pt-4 pb-2 bg-white/95 backdrop-blur-sm border-t border-border-soft"
                variants={itemVariants}
            >
                <div className="flex items-center gap-3">
                    <Button variant="secondary" type="button" onClick={prevStep}>
                        <ArrowLeft size={16} />
                        Wstecz
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}

function pluralTermin(n: number): string {
    if (n === 1) return "wolny termin"
    const lastDigit = n % 10
    const lastTwo = n % 100
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "wolne terminy"
    return "wolnych terminów"
}
