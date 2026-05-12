import Link from "next/link"
import {site} from "@/lib/content"
import type {PublicSalonInfo} from "@/lib/dto"
import {Container} from "@/components/ui/container"

const HOURS = [
    {day: "Pn - Pt", time: "9:00 - 19:00"},
    {day: "Sobota", time: "9:00 - 15:00"},
    {day: "Niedziela", time: "zamknięte"},
]

interface Props {
    salon: PublicSalonInfo
}

export function PublicFooter({salon}: Props) {
    const phoneDisplay = formatPhone(salon.salonPhone)

    return (
        <footer id="kontakt" className="bg-graphite-900 text-graphite-100 pt-16 pb-6 mt-auto">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-12">
                    <div>
                        <div className="font-serif italic font-medium text-[28px] text-rose-100 leading-none">
                            {site.salonName}
                        </div>
                        <div className="text-xs uppercase tracking-[0.16em] text-graphite-400 mt-1 mb-5">
                            {site.tagline}
                        </div>
                        <p className="text-sm leading-relaxed text-graphite-200 max-w-[320px]">
                            Profesjonalna pielęgnacja w kameralnej atmosferze. Manicure, pedicure, brwi, kosmetyka twarzy i zabiegi specjalistyczne.
                        </p>
                        <div className="flex gap-2 mt-4">
                            {site.socials.facebook && (
                                <SocialLink href={site.socials.facebook} label="Facebook">
                                    <FacebookIcon />
                                </SocialLink>
                            )}
                            {site.socials.instagram && (
                                <SocialLink href={site.socials.instagram} label="Instagram">
                                    <InstagramIcon />
                                </SocialLink>
                            )}
                        </div>
                    </div>

                    <FooterCol title="Kontakt">
                        {salon.salonPhone && phoneDisplay && (
                            <FooterLink href={`tel:${salon.salonPhone}`}>{phoneDisplay}</FooterLink>
                        )}
                        {salon.salonEmail && (
                            <FooterLink href={`mailto:${salon.salonEmail}`}>{salon.salonEmail}</FooterLink>
                        )}
                    </FooterCol>

                    <FooterCol title="Adres">
                        {salon.salonAddress && (
                            <p className="text-sm text-graphite-200 leading-relaxed">{salon.salonAddress}</p>
                        )}
                    </FooterCol>

                    <FooterCol title="Godziny otwarcia">
                        {HOURS.map(({day, time}) => (
                            <div key={day} className="flex justify-between items-baseline gap-3 text-sm py-0.5">
                                <span className="text-graphite-400">{day}</span>
                                <span className="text-graphite-100">{time}</span>
                            </div>
                        ))}
                    </FooterCol>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 justify-between items-center text-xs text-graphite-400">
                    <div>© {new Date().getFullYear()} {site.salonName} - {site.tagline}</div>
                    <div className="flex gap-5">
                        <Link href="/regulamin" className="hover:text-rose-200 transition-[color] duration-150 ease-out">
                            Regulamin
                        </Link>
                        <Link href="/polityka-prywatnosci" className="hover:text-rose-200 transition-[color] duration-150 ease-out">
                            Polityka prywatności
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    )
}

function FooterCol({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <div>
            <h4 className="font-serif font-medium text-[15px] text-rose-100 mb-4">{title}</h4>
            <div className="space-y-1">{children}</div>
        </div>
    )
}

function FooterLink({href, children}: {href: string; children: React.ReactNode}) {
    return (
        <a href={href} className="block text-sm text-graphite-200 py-0.5 hover:text-rose-200 transition-[color] duration-150 ease-out">
            {children}
        </a>
    )
}

function SocialLink({href, label, children}: {href: string; label: string; children: React.ReactNode}) {
    return (
        <a
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-graphite-200 hover-supported:hover:bg-rose-500 hover-supported:hover:text-white transition-[background-color] duration-200 ease-out"
        >
            {children}
        </a>
)
}

function formatPhone(phone: string | null): string | null {
    if (!phone) return null
    return phone.replace(/^\+48/, "+48 ").replace(/(\d{3})(?=\d)/g, "$1 ").trim()
}

function FacebookIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
        </svg>
    )
}

function InstagramIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    )
}