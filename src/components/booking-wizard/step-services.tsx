"use client"

import {ArrowRight, Check} from "lucide-react"
import {motion} from "motion/react"
import {useWizardStore} from "./wizard-store"
import {groupVariants, itemVariants} from "./animations"
import {formatMoney} from "@/lib/money"
import {Button} from "@/components/ui/button"
import {Heading} from "@/components/ui/heading"
import {cn} from "@/lib/cn"

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

interface Props {
    groupedServices: GroupedService[]
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`
}

function pluralUsluga(n: number): string {
    if (n === 1) return "usługa"
    const lastDigit = n % 10
    const lastTwo = n % 100
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "usługi"
    return "usług"
}

export function StepServices({groupedServices}: Props) {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const addService = useWizardStore((s) => s.addService)
    const removeService = useWizardStore((s) => s.removeService)
    const nextStep = useWizardStore((s) => s.nextStep)

    const allServices = groupedServices.flatMap((g) => g.services)
    const isSelected = (id: string) => selectedServices.includes(id)

    const totalDuration = selectedServices.reduce((sum, id) => {
        const svc = allServices.find((s) => s.id === id)
        return svc ? sum + svc.defaultDurationMin : sum
    }, 0)
    const totalPrice = selectedServices.reduce((sum, id) => {
        const svc = allServices.find((s) => s.id === id)
        return svc ? sum + svc.defaultPriceGr : sum
    }, 0)

    const count = selectedServices.length

    return (
        <motion.div className="space-y-7" variants={groupVariants}>
            <motion.div variants={itemVariants}>
                <Heading level="h3" className="mb-1">Wybierz usługi</Heading>
                <p className="text-sm text-graphite-600 leading-relaxed">
                    Możesz wybrać kilka usług — wykonamy je w jednej wizycie.
                </p>
            </motion.div>

            <motion.div className="space-y-6" variants={groupVariants}>
                {groupedServices.map((group) => (
                    <motion.section key={group.categoryName} variants={itemVariants}>
                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-rose-600 mb-3">
                            {group.categoryName}
                        </div>
                        <ul className="space-y-2">
                            {group.services.map((service) => {
                                const selected = isSelected(service.id)
                                return (
                                    <li key={service.id}>
                                        <button
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3.5 border rounded-lg text-left bg-white",
                                                "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
                                                "active:scale-[0.995]",
                                                selected
                                                    ? "border-rose-500 bg-rose-50 shadow-[0_0_0_1px_var(--color-rose-500)]"
                                                    : "border-border-default hover-supported:hover:border-rose-300",
                                            )}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => selected ? removeService(service.id) : addService(service.id)}
                                        >
                                            <div className={cn(
                                                "shrink-0 w-[22px] h-[22px] rounded-md border-[1.5px] flex items-center justify-center",
                                                "transition-[background-color,border-color] duration-150 ease-out",
                                                selected
                                                    ? "bg-rose-500 border-rose-500 text-white"
                                                    : "bg-white border-graphite-200",
                                            )}>
                                                <Check
                                                    className={cn(
                                                        "transition-[opacity] duration-150 ease-out",
                                                        selected ? "opacity-100" : "opacity-0",
                                                    )}
                                                    size={14}
                                                    strokeWidth={3}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-graphite-900 text-[14px] leading-tight mb-0.5">{service.name}</div>
                                                <div className="text-xs text-graphite-400">
                                                    {formatDuration(service.defaultDurationMin)}
                                                </div>
                                            </div>
                                            <div className="font-serif font-medium text-base text-graphite-900 ml-3 shrink-0 tabular-nums">
                                                {formatMoney(service.defaultPriceGr)}
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </motion.section>
                ))}
            </motion.div>

            <motion.div
                className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 pt-4 pb-2 bg-white/95 backdrop-blur-sm border-t border-border-soft"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm">
                        {count > 0 ? (
                            <>
                                <div className="text-graphite-600">{count} {pluralUsluga(count)}</div>
                                <div className="font-serif font-medium text-graphite-900 tabular-nums">
                                    {formatDuration(totalDuration)} • {formatMoney(totalPrice)}
                                </div>
                            </>
                        ) : (
                            <div className="text-graphite-400">Wybierz przynajmniej jedną usługę</div>
                        )}
                    </div>
                    <Button type="button" onClick={nextStep} disabled={count === 0}>
                        Dalej
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}
