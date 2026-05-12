"use client"

import {useMemo, useRef, useState} from "react"
import {motion} from "motion/react"
import {useRouter} from "next/navigation"
import {ArrowLeft, ArrowRight, Pencil} from "lucide-react"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {useWizardStore, slotsKey, deriveRequests, type StaffOption} from "./wizard-store"
import {groupVariants, itemVariants} from "./animations"
import {createBooking} from "@/features/booking/public-actions"
import {formatTime, isoDayToDate, SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {Button} from "@/components/ui/button"
import {Heading} from "@/components/ui/heading"
import {cn} from "@/lib/cn"

type StaffName = {id: string; firstName: string; lastName: string}
type ServiceName = {id: string; name: string}

interface Props {
    serviceNames: ServiceName[]
    staffNames: StaffName[]
    allStaffByService: Record<string, StaffOption[]>
}

export function StepSummary({serviceNames, staffNames, allStaffByService}: Props) {
    const router = useRouter()
    const customer = useWizardStore((s) => s.customer)
    const selectedServices = useWizardStore((s) => s.selectedServices)
    const preferredStaffId = useWizardStore((s) => s.preferredStaffId)
    const selectedDate = useWizardStore((s) => s.selectedDate)
    const selectedSlotStartIso = useWizardStore((s) => s.selectedSlotStartIso)
    const setStep = useWizardStore((s) => s.setStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const cacheKey = useMemo(
        () => (selectedDate ? slotsKey(selectedServices, preferredStaffId, selectedDate) : null),
        [selectedServices, preferredStaffId, selectedDate],
    )
    const slots = useWizardStore((s) => (cacheKey ? s.slotsCache[cacheKey] : undefined))

    const slot = useMemo(() => {
        if (!slots || !selectedSlotStartIso) return null
        return slots.find((s) => s.startAt.toISOString() === selectedSlotStartIso) ?? null
    }, [slots, selectedSlotStartIso])

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const submittingRef = useRef(false)

    function getServiceName(id: string) {
        return serviceNames.find((s) => s.id === id)?.name ?? "Usługa"
    }

    function getStaffName(id: string) {
        const s = staffNames.find((s) => s.id === id)
        return s ? `${s.firstName} ${s.lastName}` : "Pracownik"
    }

    async function handleSubmit() {
        // Synchronous gate: zapobiega podwójnemu submitowi gdy user
        // klika szybciej niż zdąży zaaplikować się disabled state.
        if (submittingRef.current) return
        if (!selectedDate || !selectedSlotStartIso) return

        submittingRef.current = true
        setSubmitting(true)
        // Nie kasujemy `error` na początku — gdyby ten sam błąd wrócił
        // (np. user nie zmienił danych), wartość się nie zmieni i DOM
        // nie będzie się przemontowywał, więc nic nie miga.

        const requests = deriveRequests(selectedServices, preferredStaffId, allStaffByService)

        const result = await createBooking({
            requests,
            dateIso: selectedDate,
            startIso: selectedSlotStartIso,
            customer,
        })

        if (!result.success) {
            setError(result.error)
            setSubmitting(false)
            submittingRef.current = false
            return
        }

        setError(null)
        // Wizard unmount cleanup resetuje state - nie wywołujemy reset() tutaj
        // bo to spowodowałoby błysk kroku 1 przed nawigacją.
        router.push(`/rezerwacja/sukces/${result.bookingId}?token=${result.manageToken}`)
    }

    if (slots === undefined) {
        return (
            <div className="space-y-7" aria-busy="true">
                <div>
                    <Heading level="h3" className="mb-1">Podsumowanie</Heading>
                    <p className="text-sm text-graphite-600">Sprawdzamy dostępność wybranego terminu...</p>
                </div>
                <div className="h-[280px] bg-graphite-50 border border-border-soft rounded-2xl animate-pulse" aria-hidden="true" />
                <span className="sr-only">Ładowanie podsumowania</span>
            </div>
        )
    }

    if (!slot) {
        return (
            <div className="space-y-7">
                <Heading level="h3">Termin niedostępny</Heading>
                <p className="text-sm text-error px-4 py-3 rounded-lg bg-error-bg border border-error/30">
                    Wybrany termin nie jest już dostępny. Wybierz inny.
                </p>
                <Button variant="secondary" type="button" onClick={() => setStep(4)}>
                    <ArrowLeft size={16} />
                    Wybierz inny termin
                </Button>
            </div>
        )
    }

    const totalPrice = slot.assignments.reduce((sum, a) => sum + a.priceGr, 0)
    const totalDuration = slot.assignments.reduce((sum, a) => sum + a.durationMin, 0)
    const dateLabel = formatInTimeZone(slot.startAt, SALON_TIMEZONE, "EEEE, d MMMM", {locale: pl})

    return (
        <motion.div className="space-y-7" variants={groupVariants}>
            <motion.div variants={itemVariants}>
                <Heading level="h3" className="mb-1">Podsumowanie</Heading>
                <p className="text-sm text-graphite-600 leading-relaxed">
                    Sprawdź dane i potwierdź rezerwację.
                </p>
            </motion.div>

            <motion.div
                className="bg-white border border-border-soft rounded-2xl overflow-hidden"
                variants={itemVariants}
            >
                <div className="px-5 py-4 bg-rose-50 border-b border-border-soft">
                    <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-rose-600 mb-1">
                        Termin
                    </div>
                    <div className="font-serif font-medium text-[22px] leading-tight text-graphite-900 capitalize mb-1">
                        {dateLabel}
                    </div>
                    <div className="text-sm text-rose-700 font-medium tabular-nums">
                        {formatTime(slot.startAt)} – {formatTime(slot.endAt)} ({totalDuration} min)
                    </div>
                </div>

                <SummarySection
                    title="Zabiegi"
                    onEdit={() => setStep(1)}
                >
                    <ul className="space-y-2">
                        {slot.assignments.map((a) => (
                            <li key={`${a.serviceId}-${a.staffId}-${a.startAt.toISOString()}`} className="flex items-baseline justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <span className="font-medium text-graphite-900">{getServiceName(a.serviceId)}</span>
                                    <span className="text-graphite-400 text-xs ml-2 whitespace-nowrap">
                                        {formatTime(a.startAt)} • {getStaffName(a.staffId)}
                                    </span>
                                </div>
                                <div className="font-serif font-medium text-graphite-900 tabular-nums whitespace-nowrap">
                                    {formatMoney(a.priceGr)}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-border-soft">
                        <div className="text-xs text-graphite-600">Razem</div>
                        <div className="font-serif font-medium text-[20px] text-graphite-900 tabular-nums">
                            {formatMoney(totalPrice)}
                        </div>
                    </div>
                </SummarySection>

                <SummarySection
                    title="Klient"
                    onEdit={() => setStep(5)}
                >
                    <div className="text-sm text-graphite-900 space-y-0.5">
                        <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                        <div className="text-graphite-600">{customer.phone}</div>
                        {customer.email && <div className="text-graphite-600">{customer.email}</div>}
                        {customer.customerNote && (
                            <div className="text-xs text-graphite-600 leading-relaxed mt-2 pt-2 border-t border-border-soft">
                                <span className="text-graphite-400">Notatka:</span> {customer.customerNote}
                            </div>
                        )}
                        {customer.createAccount && (
                            <div className="text-xs text-graphite-600 mt-2 pt-2 border-t border-border-soft">
                                Konto zostanie założone na ten email
                            </div>
                        )}
                    </div>
                </SummarySection>
            </motion.div>

            {error && (
                <motion.div
                    className="text-sm text-error px-4 py-3 rounded-lg bg-error-bg border border-error/30"
                    variants={itemVariants}
                    role="alert"
                >
                    {error}
                </motion.div>
            )}

            <motion.div
                className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 pt-4 pb-2 bg-white/95 backdrop-blur-sm border-t border-border-soft"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between gap-3">
                    <Button variant="secondary" type="button" onClick={prevStep} disabled={submitting}>
                        <ArrowLeft size={16} />
                        Wstecz
                    </Button>
                    <Button
                        className="min-w-[200px]"
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "Rezerwowanie..." : "Potwierdź rezerwację"}
                        {!submitting && <ArrowRight size={16} />}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}

interface SummarySectionProps {
    title: string
    onEdit: () => void
    children: React.ReactNode
}

function SummarySection({title, onEdit, children}: SummarySectionProps) {
    return (
        <div className="px-5 py-4 border-b border-border-soft last:border-0">
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-graphite-400">
                    {title}
                </div>
                <button
                    className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium text-rose-600",
                        "transition-[color] duration-150 ease-out",
                        "hover-supported:hover:text-rose-700",
                    )}
                    type="button"
                    onClick={onEdit}
                >
                    <Pencil size={11} strokeWidth={2} />
                    Zmień
                </button>
            </div>
            {children}
        </div>
    )
}
