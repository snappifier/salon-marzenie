import {notFound} from "next/navigation"
import {headers} from "next/headers"
import Link from "next/link"
import {ArrowRight, ArrowUpRight, Calendar, Check, Link2, MessageSquare} from "lucide-react"
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {prisma} from "@/lib/prisma"
import {site} from "@/lib/content"
import {formatTime, SALON_TIMEZONE} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {Container} from "@/components/ui/container"
import {Heading} from "@/components/ui/heading"
import {buttonStyles} from "@/components/ui/button"
import {CopyLink} from "@/components/manage/copy-link"

type Props = {
    params: Promise<{id: string}>
    searchParams: Promise<{token?: string}>
}

export const metadata = {
    title: "Wizyta zarezerwowana",
    robots: {index: false, follow: false},
}

function formatPhone(phone: string | null): string {
    if (!phone) return ""
    return phone.replace(/^\+48/, "+48 ").replace(/(\d{3})(?=\d)/g, "$1 ").trim()
}

function googleCalendarUrl(opts: {
    title: string
    startAt: Date
    endAt: Date
    description: string
    location?: string
}): string {
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: opts.title,
        dates: `${fmt(opts.startAt)}/${fmt(opts.endAt)}`,
        details: opts.description,
    })
    if (opts.location) params.set("location", opts.location)
    return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default async function BookingSuccessPage({params, searchParams}: Props) {
    const {id} = await params
    const {token} = await searchParams

    const [booking, settings, h] = await Promise.all([
        prisma.booking.findUnique({
            where: {id},
            include: {
                customer: true,
                items: {
                    include: {service: true, staff: true},
                    orderBy: {order: "asc"},
                },
            },
        }),
        prisma.settings.findUnique({where: {id: "settings"}}),
        headers(),
    ])

    if (!booking || booking.manageToken !== token || !settings) {
        notFound()
    }

    const firstItem = booking.items[0]
    const lastItem = booking.items[booking.items.length - 1]
    if (!firstItem || !lastItem) notFound()

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
    const shortDateRelative = formatInTimeZone(firstItem.startAt, SALON_TIMEZONE, "d MMMM", {locale: pl})
    const startTimeLabel = formatTime(firstItem.startAt)

    const host = h.get("host") ?? "marzenie.pl"
    const protocol = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"
    const manageUrl = `${protocol}://${host}/moja-wizyta/${booking.manageToken}`
    const manageDisplay = `${host}/moja-wizyta/${booking.manageToken.slice(0, 12)}…`

    const calendarUrl = googleCalendarUrl({
        title: `${site.salonName} — ${booking.items.map((i) => i.service.name).join(", ")}`,
        startAt: firstItem.startAt,
        endAt: lastItem.endAt,
        description: `Wizyta w ${site.salonName}.\n\nZabiegi:\n${booking.items
            .map((i) => `- ${i.service.name} (${i.staff.firstName} ${i.staff.lastName})`)
            .join("\n")}\n\nZarządzanie: ${manageUrl}`,
        location: settings.salonAddress ?? undefined,
    })

    return (
        <Container size="narrow" className="py-12 md:py-16">
            <section className="text-center mb-10 md:mb-14">
                <div className="relative inline-flex">
                    <span
                        className="absolute inset-0 rounded-full bg-rose-200 motion-safe:animate-ping opacity-40"
                        aria-hidden="true"
                    />
                    <div className="relative w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Check size={40} strokeWidth={2} />
                    </div>
                </div>
                <Heading level="h1" className="mt-7 mb-3">
                    Wizyta <span className="italic font-normal text-rose-600">zarezerwowana</span>
                </Heading>
                <p className="text-base text-graphite-600 leading-relaxed max-w-[460px] mx-auto">
                    Czekamy na Ciebie {shortDateRelative} o {startTimeLabel}. Wszystkie szczegóły poniżej.
                </p>
            </section>

            <section className="bg-white border border-border-soft rounded-2xl overflow-hidden mb-10 shadow-sm">
                <div className="px-5 md:px-6 py-5 bg-rose-50 border-b border-border-soft">
                    <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-rose-600 mb-1.5">
                        Termin
                    </div>
                    <div className="font-serif font-medium text-[clamp(22px,3.5vw,28px)] leading-tight text-graphite-900 mb-1.5">
                        {dateLabelCapitalized}
                    </div>
                    <div className="text-sm text-rose-700 font-medium tabular-nums">
                        {formatTime(firstItem.startAt)} – {formatTime(lastItem.endAt)} · {totalDurationMin} min
                    </div>
                </div>

                <div className="px-5 md:px-6 py-4 flex items-baseline justify-between gap-3 border-b border-border-soft">
                    <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-graphite-400">
                        {uniqueStaff.length === 1 ? "Pracownik" : "Pracownicy"}
                    </span>
                    <span className="font-medium text-graphite-900 text-sm text-right">
                        {staffLabel}
                    </span>
                </div>

                <div className="px-5 md:px-6 py-4 border-b border-border-soft">
                    <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-graphite-400 mb-3">
                        Usługi
                    </div>
                    <ul className="space-y-2.5">
                        {booking.items.map((item) => (
                            <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <div className="font-medium text-graphite-900">{item.service.name}</div>
                                    <div className="text-xs text-graphite-400 mt-0.5">
                                        {formatTime(item.startAt)} • {item.staff.firstName} {item.staff.lastName}
                                    </div>
                                </div>
                                <div className="font-serif font-medium text-graphite-900 tabular-nums whitespace-nowrap">
                                    {formatMoney(item.priceGr)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="px-5 md:px-6 py-4 flex items-baseline justify-between gap-3">
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
            </section>

            <section className="mb-10">
                <Heading level="h3" className="mb-5">Co teraz?</Heading>

                <div className="space-y-3">
                    <NextStepRow icon={<MessageSquare size={18} strokeWidth={1.8} />} title="Potwierdzenie SMS-em">
                        Wyślemy je za chwilę na numer{" "}
                        <strong className="font-medium text-graphite-900 tabular-nums">
                            {formatPhone(booking.customer.phone)}
                        </strong>
                        . Przypomnienie przyjdzie 24h przed wizytą.
                    </NextStepRow>

                    <NextStepRow icon={<Link2 size={18} strokeWidth={1.8} />} title="Zarządzaj wizytą online">
                        <p className="mb-3">
                            Pod tym linkiem możesz sprawdzić szczegóły lub anulować
                            (do {settings.minCancelHoursBefore}h przed terminem).
                        </p>
                        <CopyLink url={manageUrl} displayLabel={manageDisplay} />
                    </NextStepRow>

                    <a
                        className="group flex gap-4 p-4 md:p-5 rounded-2xl bg-white border border-border-soft transition-[border-color,box-shadow] duration-150 ease-out hover-supported:hover:border-rose-300 hover-supported:hover:shadow-sm"
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Calendar size={18} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-graphite-900 text-sm mb-1">Dodaj do kalendarza</div>
                            <p className="text-xs text-graphite-600 leading-relaxed">
                                Żeby nie zapomnieć — otwórz w Google Calendar i zapisz.
                            </p>
                        </div>
                        <ArrowUpRight
                            className="shrink-0 mt-1 text-graphite-400 transition-[color] duration-150 ease-out group-hover:text-rose-500"
                            size={16}
                        />
                    </a>
                </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/moja-wizyta/${booking.manageToken}`} className={buttonStyles({size: "lg"})}>
                    Zarządzaj wizytą
                    <ArrowRight size={16} />
                </Link>
                <Link href="/" className={buttonStyles({size: "lg", variant: "secondary"})}>
                    Wróć na stronę główną
                </Link>
            </div>
        </Container>
    )
}

interface NextStepRowProps {
    icon: React.ReactNode
    title: string
    children: React.ReactNode
}

function NextStepRow({icon, title, children}: NextStepRowProps) {
    return (
        <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-white border border-border-soft">
            <div className="shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-graphite-900 text-sm mb-1">{title}</div>
                <div className="text-xs text-graphite-600 leading-relaxed">{children}</div>
            </div>
        </div>
    )
}
