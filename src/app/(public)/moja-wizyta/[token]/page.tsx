import Link from "next/link"
import {notFound} from "next/navigation"
import {AlertCircle, ArrowLeft, Calendar, CheckCircle, MapPin, Phone, User, XCircle} from "lucide-react"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import type {BookingStatus} from "@/generated/prisma/client"
import {getBookingByToken} from "@/features/booking/manage-queries"
import {canCancelByPolicy, canCancelByStatus} from "@/features/booking/manage-logic"
import {prisma} from "@/lib/prisma"
import {formatDate, formatTime, SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {CancelBookingButton} from "@/components/manage/cancel-booking-button"
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
                    badgeBg: "bg-graphite-100",
                    badgeText: "text-graphite-600",
                    dotBg: "bg-graphite-400",
                    headingTitle: (
                        <>
                            Wizyta <span className="italic font-normal text-rose-600">minęła</span>
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
                        Wszystko gotowe na <span className="italic font-normal text-rose-600">{relativeDay}</span>
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
                        Wizyta w <span className="italic font-normal text-rose-600">{relativeDay}</span> oczekuje na potwierdzenie
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
                        Wizyta <span className="italic font-normal text-rose-600">anulowana</span>
                    </>
                ),
            }
        case "COMPLETED":
            return {
                label: "zrealizowana",
                badgeBg: "bg-graphite-100",
                badgeText: "text-graphite-600",
                dotBg: "bg-graphite-400",
                headingTitle: (
                    <>
                        Wizyta <span className="italic font-normal text-rose-600">zrealizowana</span>
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
                        Wizyta <span className="italic font-normal text-rose-600">nie odbyła się</span>
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
    const isCancellable = canCancelByStatus(booking.status) && !isPast
    const policyOk = isCancellable && canCancelByPolicy(firstItem.startAt, settings.minCancelHoursBefore, now)

    return (
        <Container size="narrow" className="py-12 md:py-16">
            <div className="mb-10 md:mb-12">
                <Eyebrow className="mb-3">Twoja wizyta</Eyebrow>
                <Heading level="h1" className="mb-4">
                    {info.headingTitle}
                </Heading>
                <div
                    className={cn(
                        "inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.14em]",
                        info.badgeBg,
                        info.badgeText,
                    )}
                >
                    <span className={cn("w-1.5 h-1.5 rounded-full", info.dotBg)} aria-hidden="true" />
                    {info.label}
                </div>
            </div>

            {booking.status === "CANCELLED" && booking.cancelledAt && (
                <div className="flex items-start gap-3 rounded-2xl border border-border-soft bg-warm px-5 py-4 mb-8">
                    <AlertCircle size={18} strokeWidth={1.8} className="shrink-0 mt-0.5 text-graphite-600" />
                    <p className="text-sm text-graphite-700 leading-relaxed">
                        Wizyta została anulowana <strong className="font-medium text-graphite-900">{formatDate(booking.cancelledAt)}</strong>.
                    </p>
                </div>
            )}

            <section className="bg-white border border-border-soft rounded-2xl overflow-hidden mb-8 shadow-sm">
                <div className="px-5 md:px-6 py-5 bg-rose-50 border-b border-border-soft">
                    <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-rose-600 mb-1.5">
                        Termin wizyty
                    </div>
                    <div className="font-serif font-medium text-[clamp(22px,3.5vw,28px)] leading-tight text-graphite-900 mb-1.5">
                        {dateLabelCapitalized}
                    </div>
                    <div className="text-sm text-rose-700 font-medium tabular-nums">
                        {formatTime(firstItem.startAt)} – {formatTime(lastItem.endAt)} · {totalDurationMin} min
                    </div>
                </div>

                <SectionRow
                    label={uniqueStaff.length === 1 ? "Pracownik" : "Pracownicy"}
                    icon={<User size={16} strokeWidth={1.8} />}
                >
                    {staffLabel}
                </SectionRow>

                <div className="px-5 md:px-6 py-4 border-b border-border-soft">
                    <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-graphite-400 mb-3 flex items-center gap-1.5">
                        <Calendar size={11} strokeWidth={2} />
                        Usługi
                    </div>
                    <ul className="space-y-2.5">
                        {booking.items.map((item) => (
                            <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <div className="font-medium text-graphite-900">{item.service.name}</div>
                                    <div className="text-xs text-graphite-400 mt-0.5">
                                        {formatTime(item.startAt)} • {item.staff.firstName} {item.staff.lastName} • {item.durationMin} min
                                    </div>
                                </div>
                                <div className="font-serif font-medium text-graphite-900 tabular-nums whitespace-nowrap">
                                    {formatMoney(item.priceGr)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="px-5 md:px-6 py-4 flex items-baseline justify-between gap-3 border-b border-border-soft">
                    <div>
                        <div className="text-xs text-graphite-600">Razem</div>
                        <div className="text-[11px] text-graphite-400 mt-0.5">
                            Płatne na miejscu
                        </div>
                    </div>
                    <div className="font-serif font-medium text-[24px] text-graphite-900 tabular-nums">
                        {formatMoney(totalPrice)}
                    </div>
                </div>

                {settings.salonAddress && (
                    <SectionRow
                        label="Gdzie"
                        icon={<MapPin size={16} strokeWidth={1.8} />}
                    >
                        <span className="text-sm text-graphite-900">{settings.salonAddress}</span>
                    </SectionRow>
                )}
            </section>

            <section className="flex gap-3 p-4 md:p-5 rounded-2xl bg-white border border-border-soft mb-8">
                <div className="shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <User size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-graphite-400 mb-0.5">
                        Zarezerwowane na
                    </div>
                    <div className="font-medium text-graphite-900 text-sm">
                        {booking.customer.firstName} {booking.customer.lastName}
                    </div>
                    <div className="text-xs text-graphite-600 mt-0.5 flex items-center gap-1.5">
                        <Phone size={11} strokeWidth={1.8} />
                        {booking.customer.phone}
                    </div>
                    {booking.customer.email && (
                        <div className="text-xs text-graphite-600 mt-0.5">{booking.customer.email}</div>
                    )}
                    {booking.customerNote && (
                        <div className="text-xs text-graphite-600 mt-3 pt-3 border-t border-border-soft leading-relaxed">
                            <span className="text-graphite-400">Notatka:</span> {booking.customerNote}
                        </div>
                    )}
                </div>
            </section>

            {isCancellable && (
                <section className="rounded-2xl border border-border-soft bg-white p-5 md:p-6 mb-8">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-warm text-graphite-600 flex items-center justify-center">
                            <XCircle size={18} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-graphite-900 text-sm mb-1">Anulowanie wizyty</div>
                            {policyOk ? (
                                <p className="text-xs text-graphite-600 leading-relaxed">
                                    Możesz anulować tę wizytę najpóźniej{" "}
                                    <strong className="font-medium text-graphite-900">
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

            {booking.status === "COMPLETED" && (
                <section className="rounded-2xl border border-border-soft bg-rose-50 p-5 md:p-6 mb-8 flex items-start gap-3">
                    <CheckCircle size={20} strokeWidth={1.8} className="shrink-0 mt-0.5 text-rose-600" />
                    <div>
                        <div className="font-medium text-graphite-900 text-sm mb-1">Dziękujemy za wizytę!</div>
                        <p className="text-xs text-graphite-600 leading-relaxed">
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
        <div className="px-5 md:px-6 py-4 border-b border-border-soft last:border-0">
            <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-graphite-400 mb-1.5 flex items-center gap-1.5">
                {icon}
                {label}
            </div>
            <div className="font-medium text-graphite-900 text-sm">{children}</div>
        </div>
    )
}
