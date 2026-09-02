import Link from "next/link"
import {notFound} from "next/navigation"
import {AlertCircle, ArrowLeft, Calendar, Check, CheckCircle, MapPin, Phone, User, XCircle} from "lucide-react"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import type {BookingStatus} from "@/generated/prisma/client"
import {getBookingByToken} from "@/features/booking/manage-queries"
import {canCancelByPolicy, canCancelByStatus, canConfirmByPolicy, canConfirmByStatus} from "@/features/booking/manage-logic"
import {prisma} from "@/lib/prisma"
import {formatDate, formatTime, SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {CancelBookingButton} from "@/components/manage/cancel-booking-button"
import {ConfirmBookingButton} from "@/components/manage/confirm-booking-button"
import {cn} from "@/lib/cn"

type Props = {
    params: Promise<{token: string}>
}

export const metadata = {
    title: "Twoja wizyta",
    robots: {index: false, follow: false},
}

interface StatusInfo {
    label: string
    badgeBg: string
    badgeText: string
    dotBg: string
    headingTitle: React.ReactNode
}

function statusInfo(status: BookingStatus, firstItemStart: Date, isPast: boolean): StatusInfo {
    const relativeDay = formatInTimeZone(firstItemStart, SALON_TIMEZONE, "EEEE", {locale: pl})

    switch (status) {
        case "CONFIRMED":
            if (isPast) {
                return {
                    label: "minęła",
                    badgeBg: "bg-surface-muted",
                    badgeText: "text-secondary",
                    dotBg: "bg-secondary",
                    headingTitle: (
                        <>
                            Wizyta <span className="italic font-normal text-interactive">minęła</span>
                        </>
                    ),
                }
            }
            return {
                label: "potwierdzona",
                badgeBg: "bg-success-bg",
                badgeText: "text-success",
                dotBg: "bg-success",
                headingTitle: (
                    <>
                        Wszystko gotowe na <span className="italic font-normal text-interactive">{relativeDay}</span>
                    </>
                ),
            }
        case "PENDING":
            return {
                label: "oczekuje",
                badgeBg: "bg-warning-bg",
                badgeText: "text-warning",
                dotBg: "bg-warning",
                headingTitle: (
                    <>
                        Wizyta w <span className="italic font-normal text-interactive">{relativeDay}</span> oczekuje na potwierdzenie
                    </>
                ),
            }
        case "CANCELLED":
            return {
                label: "anulowana",
                badgeBg: "bg-error-bg",
                badgeText: "text-error",
                dotBg: "bg-error",
                headingTitle: (
                    <>
                        Wizyta <span className="italic font-normal text-interactive">anulowana</span>
                    </>
                ),
            }
        case "COMPLETED":
            return {
                label: "zrealizowana",
                badgeBg: "bg-surface-muted",
                badgeText: "text-secondary",
                dotBg: "bg-secondary",
                headingTitle: (
                    <>
                        Wizyta <span className="italic font-normal text-interactive">zrealizowana</span>
                    </>
                ),
            }
        case "NO_SHOW":
            return {
                label: "nieobecność",
                badgeBg: "bg-error-bg",
                badgeText: "text-error",
                dotBg: "bg-error",
                headingTitle: (
                    <>
                        Wizyta <span className="italic font-normal text-interactive">nie odbyła się</span>
                    </>
                ),
            }
    }
}

export default async function ManageBookingPage({params}: Props) {
    const {token} = await params
    const [booking, settings] = await Promise.all([
        getBookingByToken(token),
        prisma.settings.findUnique({where: {id: "settings"}}),
    ])

    if (!booking || !settings) notFound()

    const firstItem = booking.items[0]
    const lastItem = booking.items[booking.items.length - 1]
    if (!firstItem || !lastItem) notFound()

    const now = new Date()
    const isPast = lastItem.endAt < now

    const totalPrice = booking.items.reduce((sum, i) => sum + i.priceGr, 0)
    const totalDurationMin = Math.round(
        (lastItem.endAt.getTime() - firstItem.startAt.getTime()) / 60000,
    )

    const uniqueStaff = Array.from(
        new Map(booking.items.map((i) => [i.staffId, i.staff])).values(),
    )
    const staffLabel = uniqueStaff
        .map((s) => `${s.firstName} ${s.lastName}`)
        .join(", ")

    const dateLabel = formatInTimeZone(firstItem.startAt, SALON_TIMEZONE, "EEEE, d MMMM yyyy", {locale: pl})
    const dateLabelCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

    const info = statusInfo(booking.status, firstItem.startAt, isPast)
    const isCancellable = canCancelByStatus(booking.status, settings.requireConfirmation) && !isPast
    const policyOk = isCancellable && canCancelByPolicy(firstItem.startAt, settings.minCancelHoursBefore, now)

    const confirmStatusOk = canConfirmByStatus(booking.status)
    const confirmPolicy = confirmStatusOk && !isPast
        ? canConfirmByPolicy(firstItem.startAt, settings.confirmWindowMinHours, settings.confirmWindowMaxHours, now)
        : null
    const confirmAvail = confirmPolicy === "ok"

    return (
        <Container size="narrow" className="py-12 md:py-16">
            <div className="mb-10 md:mb-12">
                <Eyebrow className="mb-3">Twoja wizyta</Eyebrow>
                <Heading level="h1" className="mb-4">
                    {info.headingTitle}
                </Heading>
                <div
                    className={cn(
                        "inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.18em]",
                        info.badgeBg,
                        info.badgeText,
                    )}
                >
                    <span className={cn("w-1.5 h-1.5 rounded-full", info.dotBg)} aria-hidden="true" />
                    {info.label}
                </div>
            </div>

            {booking.status === "CANCELLED" && booking.cancelledAt && (
                <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-paper-300 px-5 py-4 mb-8">
                    <AlertCircle size={18} strokeWidth={1.8} className="shrink-0 mt-0.5 text-secondary" />
                    <p className="text-sm text-primary leading-relaxed">
                        Wizyta została anulowana <strong className="font-medium text-primary">{formatDate(booking.cancelledAt)}</strong>.
                    </p>
                </div>
            )}

            <section className="bg-surface border border-border-subtle rounded-lg overflow-hidden mb-8 shadow-sm">
                <div className="px-5 md:px-6 py-5 bg-surface-muted border-b border-border-subtle">
                    <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-interactive mb-1.5">
                        Termin wizyty
                    </div>
                    <div className="font-display font-medium text-[clamp(22px,3.5vw,28px)] leading-tight text-primary mb-1.5">
                        {dateLabelCapitalized}
                    </div>
                    <div className="text-sm text-interactive-hover font-medium tabular-nums">
                        {formatTime(firstItem.startAt)} – {formatTime(lastItem.endAt)} · {totalDurationMin} min
                    </div>
                </div>

                <SectionRow
                    label={uniqueStaff.length === 1 ? "Pracownik" : "Pracownicy"}
                    icon={<User size={16} strokeWidth={1.8} />}
                >
                    {staffLabel}
                </SectionRow>

                <div className="px-5 md:px-6 py-4 border-b border-border-subtle">
                    <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-secondary mb-3 flex items-center gap-1.5">
                        <Calendar size={11} strokeWidth={2} />
                        Usługi
                    </div>
                    <ul className="space-y-2.5">
                        {booking.items.map((item) => (
                            <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <div className="font-medium text-primary">{item.service.name}</div>
                                    <div className="text-xs text-secondary mt-0.5">
                                        {formatTime(item.startAt)} • {item.staff.firstName} {item.staff.lastName} • {item.durationMin} min
                                    </div>
                                </div>
                                <div className="font-display font-medium text-primary tabular-nums whitespace-nowrap">
                                    {formatMoney(item.priceGr)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="px-5 md:px-6 py-4 flex items-baseline justify-between gap-3 border-b border-border-subtle">
                    <div>
                        <div className="text-xs text-secondary">Razem</div>
                        <div className="text-[11px] text-secondary mt-0.5">
                            Płatne na miejscu
                        </div>
                    </div>
                    <div className="font-display font-medium text-[24px] text-primary tabular-nums">
                        {formatMoney(totalPrice)}
                    </div>
                </div>

                {settings.salonAddress && (
                    <SectionRow
                        label="Gdzie"
                        icon={<MapPin size={16} strokeWidth={1.8} />}
                    >
                        <span className="text-sm text-primary">{settings.salonAddress}</span>
                    </SectionRow>
                )}
            </section>

            <section className="flex gap-3 p-4 md:p-5 rounded-lg bg-surface border border-border-subtle mb-8">
                <div className="shrink-0 w-10 h-10 rounded-full bg-surface-muted text-interactive flex items-center justify-center">
                    <User size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-secondary mb-0.5">
                        Zarezerwowane na
                    </div>
                    <div className="font-medium text-primary text-sm">
                        {booking.customer.firstName} {booking.customer.lastName}
                    </div>
                    <div className="text-xs text-secondary mt-0.5 flex items-center gap-1.5">
                        <Phone size={11} strokeWidth={1.8} />
                        {booking.customer.phone}
                    </div>
                    {booking.customer.email && (
                        <div className="text-xs text-secondary mt-0.5">{booking.customer.email}</div>
                    )}
                    {booking.customerNote && (
                        <div className="text-xs text-secondary mt-3 pt-3 border-t border-border-subtle leading-relaxed">
                            <span className="text-secondary">Notatka:</span> {booking.customerNote}
                        </div>
                    )}
                </div>
            </section>

            {confirmStatusOk && !isPast && (
                <section className="rounded-lg border border-border-subtle bg-surface p-5 md:p-6 mb-8">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-muted text-interactive flex items-center justify-center">
                            <Check size={18} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-primary text-sm mb-1">Potwierdzenie wizyty</div>
                            {confirmPolicy === "ok" && (
                                <p className="text-xs text-secondary leading-relaxed">
                                    Potwierdź swoją obecność — pomaga nam zaplanować dzień.
                                </p>
                            )}
                            {confirmPolicy === "too_early" && (
                                <p className="text-xs text-secondary leading-relaxed">
                                    Możesz potwierdzić wizytę najwcześniej{" "}
                                    <strong className="font-medium text-primary">
                                        {settings.confirmWindowMaxHours}h
                                    </strong>{" "}
                                    przed jej rozpoczęciem.
                                </p>
                            )}
                            {confirmPolicy === "too_late" && (
                                <p className="text-xs text-error leading-relaxed">
                                    Okno potwierdzenia minęło. Skontaktuj się z salonem telefonicznie.
                                </p>
                            )}
                        </div>
                    </div>

                    {confirmAvail && (
                        <div className="pl-13">
                            <ConfirmBookingButton token={token} />
                        </div>
                    )}

                    {confirmPolicy === "too_late" && settings.salonPhone && (
                        <div className="pl-13">
                            <a
                                className={buttonStyles({size: "sm", variant: "secondary"})}
                                href={`tel:${settings.salonPhone}`}
                            >
                                <Phone size={14} />
                                Zadzwoń
                            </a>
                        </div>
                    )}
                </section>
            )}

            {isCancellable && (
                <section className="rounded-lg border border-border-subtle bg-surface p-5 md:p-6 mb-8">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-paper-300 text-secondary flex items-center justify-center">
                            <XCircle size={18} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-primary text-sm mb-1">Anulowanie wizyty</div>
                            {policyOk ? (
                                <p className="text-xs text-secondary leading-relaxed">
                                    Możesz anulować tę wizytę najpóźniej{" "}
                                    <strong className="font-medium text-primary">
                                        {settings.minCancelHoursBefore}h
                                    </strong>{" "}
                                    przed jej rozpoczęciem.
                                </p>
                            ) : (
                                <p className="text-xs text-error leading-relaxed">
                                    Termin anulowania online minął ({settings.minCancelHoursBefore}h przed wizytą).
                                    Skontaktuj się z salonem telefonicznie, jeśli musisz zrezygnować.
                                </p>
                            )}
                        </div>
                    </div>

                    {policyOk && (
                        <div className="pl-13">
                            <CancelBookingButton token={token} />
                        </div>
                    )}

                    {!policyOk && settings.salonPhone && (
                        <div className="pl-13">
                            <a
                                className={buttonStyles({size: "sm", variant: "secondary"})}
                                href={`tel:${settings.salonPhone}`}
                            >
                                <Phone size={14} />
                                Zadzwoń
                            </a>
                        </div>
                    )}
                </section>
            )}

            {booking.status === "CONFIRMED" && settings.requireConfirmation && !isPast && settings.salonPhone && (
                <section className="rounded-lg border border-border-subtle bg-surface p-5 md:p-6 mb-8">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-paper-300 text-secondary flex items-center justify-center">
                            <Phone size={18} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-primary text-sm mb-1">Zmiana wizyty</div>
                            <p className="text-xs text-secondary leading-relaxed">
                                Wizyta jest potwierdzona. Aby zmienić plany lub odwołać, skontaktuj się z salonem telefonicznie.
                            </p>
                        </div>
                    </div>
                    <div className="pl-13">
                        <a
                            className={buttonStyles({size: "sm", variant: "secondary"})}
                            href={`tel:${settings.salonPhone}`}
                        >
                            <Phone size={14} />
                            Zadzwoń
                        </a>
                    </div>
                </section>
            )}

            {booking.status === "COMPLETED" && (
                <section className="rounded-lg border border-border-subtle bg-surface-muted p-5 md:p-6 mb-8 flex items-start gap-3">
                    <CheckCircle size={20} strokeWidth={1.8} className="shrink-0 mt-0.5 text-interactive" />
                    <div>
                        <div className="font-medium text-primary text-sm mb-1">Dziękujemy za wizytę!</div>
                        <p className="text-xs text-secondary leading-relaxed">
                            Zapraszamy ponownie. Możesz zarezerwować kolejną wizytę online.
                        </p>
                    </div>
                </section>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                {(isPast || booking.status === "CANCELLED") && (
                    <Link href="/rezerwacja" className={buttonStyles({size: "lg"})}>
                        Zarezerwuj kolejną wizytę
                    </Link>
                )}
                <Link
                    className={buttonStyles({size: "lg", variant: "secondary"})}
                    href="/"
                >
                    <ArrowLeft size={16} />
                    Strona główna
                </Link>
            </div>
        </Container>
    )
}

interface SectionRowProps {
    label: string
    icon: React.ReactNode
    children: React.ReactNode
}

function SectionRow({label, icon, children}: SectionRowProps) {
    return (
        <div className="px-5 md:px-6 py-4 border-b border-border-subtle last:border-0">
            <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-secondary mb-1.5 flex items-center gap-1.5">
                {icon}
                {label}
            </div>
            <div className="font-medium text-primary text-sm">{children}</div>
        </div>
    )
}
