"use client"

import {useEffect, useMemo} from "react"
import {motion} from "motion/react"
import {ArrowLeft, ArrowRight, Check, Minus, Sparkles, AlertCircle} from "lucide-react"
import {useWizardStore, type StaffOption} from "./wizard-store"
import {groupVariants, itemVariants} from "./animations"
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
    allStaffByService: Record<string, StaffOption[]>
}

interface StaffCoverage {
    staff: StaffOption
    canDoIds: string[]
    cantDoIds: string[]
    fullCoverage: boolean
}

export function StepStaff({groupedServices, allStaffByService}: Props) {
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const preferredStaffId = useWizardStore((s) => s.preferredStaffId)
    const setPreferredStaffId = useWizardStore((s) => s.setPreferredStaffId)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    function serviceName(id: string): string {
        for (const group of groupedServices) {
            const svc = group.services.find((s) => s.id === id)
            if (svc) return svc.name
        }
        return "Usługa"
    }

    const staffWithCoverage = useMemo<StaffCoverage[]>(() => {
        // Zbierz unikalnych pracowników którzy umieją ≥1 wybraną usługę
        const allStaff = new Map<string, StaffOption>()
        for (const id of selectedServices) {
            for (const staff of allStaffByService[id] ?? []) {
                allStaff.set(staff.id, staff)
            }
        }

        const result: StaffCoverage[] = Array.from(allStaff.values()).map((staff) => {
            const canDoIds = selectedServices.filter((id) =>
                (allStaffByService[id] ?? []).some((s) => s.id === staff.id),
            )
            const cantDoIds = selectedServices.filter((id) => !canDoIds.includes(id))
            return {
                staff,
                canDoIds,
                cantDoIds,
                fullCoverage: cantDoIds.length === 0,
            }
        })

        result.sort((a, b) => {
            if (a.fullCoverage !== b.fullCoverage) return a.fullCoverage ? -1 : 1
            if (a.canDoIds.length !== b.canDoIds.length) return b.canDoIds.length - a.canDoIds.length
            return a.staff.firstName.localeCompare(b.staff.firstName, "pl")
        })

        return result
    }, [allStaffByService, selectedServices])

    const noStaffAtAll = staffWithCoverage.length === 0

    // Auto-reset preferredStaffId do "any" jeśli wybrany pracownik nie umie
    // już żadnej z aktualnych usług (np. user zmienił usługi).
    useEffect(() => {
        if (preferredStaffId === "any") return
        const stillValid = staffWithCoverage.some((c) => c.staff.id === preferredStaffId)
        if (!stillValid) setPreferredStaffId("any")
    }, [preferredStaffId, staffWithCoverage, setPreferredStaffId])

    return (
        <motion.div className="space-y-7" variants={groupVariants}>
            <motion.div variants={itemVariants}>
                <Heading level="h3" className="mb-1">Preferowany pracownik</Heading>
                <p className="text-sm text-graphite-600 leading-relaxed">
                    Wybierz osobę, którą lubisz najbardziej. Jeśli któraś z wybranych usług nie jest przez nią wykonywana — dobierzemy innego pracownika.
                </p>
            </motion.div>

            {noStaffAtAll && (
                <motion.div
                    className="flex items-start gap-3 rounded-lg border border-error/30 bg-error-bg px-4 py-3"
                    variants={itemVariants}
                >
                    <AlertCircle size={18} strokeWidth={1.8} className="shrink-0 mt-0.5 text-error" />
                    <p className="text-sm text-error leading-relaxed">
                        Brak dostępnych pracowników dla wybranych usług. Skontaktuj się z salonem telefonicznie.
                    </p>
                </motion.div>
            )}

            <motion.fieldset className="space-y-2" variants={groupVariants}>
                <legend className="sr-only">Wybierz preferowanego pracownika</legend>

                <motion.div variants={itemVariants}>
                    <StaffPickerRow
                        checked={preferredStaffId === "any"}
                        name="preferred-staff"
                        onSelect={() => setPreferredStaffId("any")}
                    >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="shrink-0 w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mt-0.5">
                                <Sparkles size={16} strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-graphite-900 text-[14px] leading-tight">Obojętnie kto</div>
                                <div className="text-xs text-graphite-500 mt-1">
                                    Dobierzemy najszybciej dostępnych pracowników do każdego zabiegu.
                                </div>
                            </div>
                        </div>
                    </StaffPickerRow>
                </motion.div>

                {staffWithCoverage.map(({staff, canDoIds, cantDoIds, fullCoverage}) => (
                    <motion.div key={staff.id} variants={itemVariants}>
                        <StaffPickerRow
                            checked={preferredStaffId === staff.id}
                            name="preferred-staff"
                            onSelect={() => setPreferredStaffId(staff.id)}
                        >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <Avatar firstName={staff.firstName} lastName={staff.lastName} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="font-medium text-graphite-900 text-[14px] leading-tight">
                                            {staff.firstName} {staff.lastName}
                                        </div>
                                        {fullCoverage && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success uppercase tracking-[0.1em]">
                                                <Check size={11} strokeWidth={3} />
                                                wszystko
                                            </span>
                                        )}
                                    </div>
                                    {fullCoverage ? (
                                        <div className="text-xs text-graphite-500">
                                            Wykona wszystkie wybrane zabiegi.
                                        </div>
                                    ) : (
                                        <ul className="space-y-0.5">
                                            {canDoIds.map((id) => (
                                                <li key={id} className="flex items-center gap-1.5 text-xs text-graphite-700">
                                                    <Check size={11} strokeWidth={2.5} className="text-rose-500 shrink-0" />
                                                    <span className="truncate">{serviceName(id)}</span>
                                                </li>
                                            ))}
                                            {cantDoIds.map((id) => (
                                                <li key={id} className="flex items-center gap-1.5 text-xs text-graphite-400">
                                                    <Minus size={11} strokeWidth={2.5} className="text-graphite-300 shrink-0" />
                                                    <span className="truncate">
                                                        {serviceName(id)}
                                                        <span className="italic"> (inny pracownik)</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </StaffPickerRow>
                    </motion.div>
                ))}
            </motion.fieldset>

            <motion.div
                className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 pt-4 pb-2 bg-white/95 backdrop-blur-sm border-t border-border-soft"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between gap-3">
                    <Button variant="secondary" type="button" onClick={prevStep}>
                        <ArrowLeft size={16} />
                        Wstecz
                    </Button>
                    <Button type="button" onClick={nextStep} disabled={noStaffAtAll}>
                        Dalej
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}

interface StaffPickerRowProps {
    checked: boolean
    name: string
    onSelect: () => void
    children: React.ReactNode
}

function StaffPickerRow({checked, name, onSelect, children}: StaffPickerRowProps) {
    return (
        <label
            className={cn(
                "flex items-center gap-3 p-3.5 border rounded-lg bg-white cursor-pointer",
                "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
                checked
                    ? "border-rose-500 bg-rose-50 shadow-[0_0_0_1px_var(--color-rose-500)]"
                    : "border-border-default hover-supported:hover:border-rose-300",
            )}
        >
            <input
                className="sr-only"
                type="radio"
                name={name}
                checked={checked}
                onChange={onSelect}
            />
            <div
                className={cn(
                    "shrink-0 w-[20px] h-[20px] rounded-full bg-white mt-1",
                    "transition-[border-color,border-width] duration-150 ease-out",
                    checked
                        ? "border-[6px] border-rose-500"
                        : "border-[1.5px] border-graphite-200",
                )}
                aria-hidden="true"
            />
            {children}
        </label>
    )
}

function Avatar({firstName, lastName}: {firstName: string; lastName: string}) {
    const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
    return (
        <div
            className="shrink-0 w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-medium text-xs mt-0.5"
            aria-hidden="true"
        >
            {initials}
        </div>
    )
}
