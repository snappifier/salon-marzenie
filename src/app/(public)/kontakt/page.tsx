// src/app/(public)/kontakt/page.tsx
import Link from "next/link"
import {ArrowRight, ArrowUpRight, Clock, Mail, MapPin, Phone} from "lucide-react"
import {getSettings} from "@/features/settings/queries"
import {site} from "@/lib/content"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {PageHeading} from "@/components/public/page-heading"
import {buttonStyles} from "@/components/ui/button"

export const metadata = {
    title: "Kontakt",
    description: "Skontaktuj się ze studiem Marzenie — telefon, email, adres salonu i godziny otwarcia.",
}

const HOURS = [
    {day: "Poniedziałek", time: "9:00 – 19:00"},
    {day: "Wtorek", time: "9:00 – 19:00"},
    {day: "Środa", time: "9:00 – 19:00"},
    {day: "Czwartek", time: "9:00 – 19:00"},
    {day: "Piątek", time: "9:00 – 19:00"},
    {day: "Sobota", time: "9:00 – 15:00"},
    {day: "Niedziela", time: "zamknięte", closed: true},
]

function formatPhone(phone: string | null): string | null {
    if (!phone) return null
    return phone.replace(/^\+48/, "+48 ").replace(/(\d{3})(?=\d)/g, "$1 ").trim()
}

export default async function KontaktPage() {
    const settings = await getSettings()
    const phoneDisplay = formatPhone(settings.salonPhone)
    const mapUrl = settings.salonAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.salonAddress)}`
        : null

    return (
        <Container size="narrow" className="pt-[50px] pb-[clamp(48px,7vw,80px)]">
            <PageHeading
                eyebrow="Kontakt"
                title={<>Jak nas <em className="italic text-interactive">znaleźć</em></>}
                description="Zadzwoń, napisz lub wpadnij. Najszybciej rezerwację załatwisz online, ale jeśli wolisz porozmawiać — chętnie odbieramy."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5">
                {settings.salonPhone && phoneDisplay && (
                    <ContactCard
                        href={`tel:${settings.salonPhone}`}
                        icon={<Phone size={20} strokeWidth={1.8} />}
                        label="Telefon"
                        value={phoneDisplay}
                        hint="Pn–Sb w godzinach otwarcia"
                    />
                )}
                {settings.salonEmail && (
                    <ContactCard
                        href={`mailto:${settings.salonEmail}`}
                        icon={<Mail size={20} strokeWidth={1.8} />}
                        label="Email"
                        value={settings.salonEmail}
                        hint="Odpowiadamy w ciągu 24h"
                    />
                )}
            </div>

            {settings.salonAddress && (
                <section className="mb-5 bg-surface border border-border-subtle rounded-lg overflow-hidden shadow-sm">
                    <div className="p-5 md:p-6 flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-muted text-interactive flex items-center justify-center">
                            <MapPin size={20} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-secondary mb-1">
                                Adres
                            </div>
                            <div className="font-display font-medium text-lg text-primary leading-snug whitespace-pre-line">
                                {settings.salonAddress}
                            </div>
                            {mapUrl && (
                                <a
                                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-interactive hover-supported:hover:text-interactive-hover transition-[color] duration-150 ease-out"
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Otwórz w Mapach Google
                                    <ArrowUpRight size={14} strokeWidth={2} />
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <section className="mb-10 bg-surface border border-border-subtle rounded-lg overflow-hidden shadow-sm">
                <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-surface-muted text-interactive flex items-center justify-center">
                        <Clock size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-secondary mb-0.5">
                            Godziny otwarcia
                        </div>
                        <div className="font-display font-medium text-lg text-primary leading-tight">
                            Pn–Sb
                        </div>
                    </div>
                </div>
                <ul className="px-5 md:px-6 py-4 space-y-2">
                    {HOURS.map(({day, time, closed}) => (
                        <li
                            key={day}
                            className="flex items-baseline justify-between gap-3 py-0.5 border-b border-border-subtle last:border-0"
                        >
                            <span className="text-sm text-primary">{day}</span>
                            <span
                                className={
                                    closed
                                        ? "text-sm text-secondary italic tabular-nums"
                                        : "text-sm font-medium text-primary tabular-nums"
                                }
                            >
                                {time}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="relative overflow-hidden py-10 md:py-14 px-5 md:px-8 rounded-lg cta-bloom border border-border-subtle">
                <div className="relative text-center max-w-[560px] mx-auto">
                    <Eyebrow className="mb-3">Najszybciej online</Eyebrow>
                    <Heading level="h2" className="mb-4">
                        Zarezerwuj <span className="italic font-normal text-interactive">w kilka kliknięć</span>
                    </Heading>
                    <p className="text-base text-secondary leading-relaxed mb-7">
                        Sprawdzisz dostępne terminy, wybierzesz pasujący i potwierdzisz — bez telefonu, kiedy Ci wygodnie.
                    </p>
                    <Link href="/rezerwacja" className={buttonStyles({size: "lg"})}>
                        Zarezerwuj online
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <p className="text-center text-xs text-secondary mt-8">
                {site.salonName} · {site.tagline}
            </p>
        </Container>
    )
}

interface ContactCardProps {
    href: string
    icon: React.ReactNode
    label: string
    value: string
    hint?: string
}

function ContactCard({href, icon, label, value, hint}: ContactCardProps) {
    return (
        <a
            className="group flex items-start gap-4 p-5 md:p-6 rounded-lg bg-surface border border-border-subtle shadow-sm transition-[border-color,box-shadow] duration-150 ease-out hover-supported:hover:border-accent-100 hover-supported:hover:shadow-md"
            href={href}
        >
            <div className="shrink-0 w-10 h-10 rounded-full bg-surface-muted text-interactive flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-secondary mb-1">
                    {label}
                </div>
                <div className="font-display font-medium text-lg text-primary leading-tight tabular-nums truncate">
                    {value}
                </div>
                {hint && (
                    <div className="text-xs text-secondary mt-1.5">{hint}</div>
                )}
            </div>
            <ArrowUpRight
                size={16}
                strokeWidth={2}
                className="shrink-0 mt-1 text-secondary transition-[color] duration-150 ease-out group-hover:text-interactive"
            />
        </a>
    )
}
