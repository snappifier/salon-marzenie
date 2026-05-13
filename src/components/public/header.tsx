"use client"

import {useEffect, useRef, useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {AnimatePresence, motion, useMotionValueEvent, useScroll} from "motion/react"
import {Menu, X} from "lucide-react"
import {site} from "@/lib/content"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {cn} from "@/lib/cn"

const NAV_LINKS = [
    {href: "/uslugi", label: "Usługi"},
    {href: "/kontakt", label: "Kontakt"},
]

export function PublicHeader() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()
    const triggerRef = useRef<HTMLButtonElement>(null)
    const headerRef = useRef<HTMLElement>(null)
    const {scrollY} = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 8)
    })

    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!menuOpen) return
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setMenuOpen(false)
                triggerRef.current?.focus()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [menuOpen])

    useEffect(() => {
        if (!menuOpen) return
        function onPointerDown(e: PointerEvent) {
            if (!headerRef.current?.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [menuOpen])

    return (
        <header
            ref={headerRef}
            className={cn(
                "sticky top-0 z-50 backdrop-blur-md backdrop-saturate-150 bg-cream/85 transition-[border-color] duration-150 ease-out border-b",
                scrolled ? "border-border-soft" : "border-transparent",
            )}
        >
            <Container>
                <div className="flex items-center justify-between py-3.5">
                    <Link href="/" className="group" aria-label={`${site.salonName} - strona główna`}>
                        <div className="font-serif italic font-medium text-2xl text-graphite-900 leading-none tracking-tight">
                            {site.salonName}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.18em] text-graphite-400 font-medium mt-0.5">
                            {site.tagline}
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8" aria-label="Główna nawigacja">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-graphite-600 hover:text-rose-600 transition-[color] duration 150 ease-out"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/rezerwacja" className={buttonStyles({size: "sm"})}>
                            Zarezerwuj
                        </Link>
                    </nav>

                    <button
                        ref={triggerRef}
                        type="button"
                        className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-graphite-900 rounded-md hover-supported:hover:bg-rose-50 transition-[background-color] duration-150 ease-out"
                        aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </Container>

            <AnimatePresence>
                {menuOpen && (
                    <motion.nav
                        id="mobile-nav"
                        aria-label="Główna nawigacja"
                        className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-border-soft shadow-md overflow-hidden"
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: "auto", transition: {duration: 0.22, ease: [0.23, 1, 0.32, 1]},}}
                        exit={{opacity: 0, height: 0}}
                        transition={{duration: 0.15, ease: [0.23, 1, 0.32, 1]}}
                    >
                        <Container className="py-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block py-3.5 text-sm font-medium text-graphite-900 border-b border-border-soft last:border-0 hover:text-rose-600 transition-[color] duration-150 ease-out"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 pb-2">
                                <Link
                                    href="/rezerwacja"
                                    className={cn(buttonStyles({size: "md"}), "w-full")}
                                >
                                    Zarezerwuj wizytę
                                </Link>
                            </div>
                        </Container>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    )
}