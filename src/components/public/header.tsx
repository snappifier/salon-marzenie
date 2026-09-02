// src/components/public/header.tsx
"use client"

import {useEffect, useRef, useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {AnimatePresence, motion} from "motion/react"
import {site} from "@/lib/content"
import {cn} from "@/lib/cn"

export interface HeaderCustomer {
	firstName: string
	lastName: string
}

interface Props {
	customer: HeaderCustomer | null
}

const NAV_LINKS = [
	{href: "/#oferta", label: "Oferta"},
	{href: "/#cennik", label: "Cennik"},
	{href: "/#opinie", label: "Opinie"},
	{href: "/#faq", label: "FAQ"},
]

function initials(c: HeaderCustomer): string {
	return `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase()
}

export function PublicHeader({customer}: Props) {
	const [menuOpen, setMenuOpen] = useState(false)
	const pathname = usePathname()
	const triggerRef = useRef<HTMLButtonElement>(null)
	const headerRef = useRef<HTMLElement>(null)

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
			if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false)
		}
		document.addEventListener("pointerdown", onPointerDown)
		return () => document.removeEventListener("pointerdown", onPointerDown)
	}, [menuOpen])

	return (
		<header ref={headerRef} className="sticky top-1 z-50 w-full px-[7%] pt-3">
			<div className="relative">
				<div className="w-full flex items-center justify-between px-8 py-2 rounded-[12px] bg-paper-400/60 backdrop-blur-md backdrop-saturate-150 shadow-xs">
					<Link
						href="/"
						className="font-display text-[25px] tracking-tight shrink-0 text-primary"
						aria-label={`${site.salonName} - strona główna`}
					>
						{site.salonName}
					</Link>

					<nav className="hidden md:flex gap-10 items-center text-sm tracking-tight" aria-label="Główna nawigacja">
						{NAV_LINKS.map((l) => (
							<Link
								key={l.href}
								href={l.href}
								className="py-3 text-primary transition-[color] duration-200 ease-out hover-supported:hover:text-interactive"
							>
								{l.label}
							</Link>
						))}
					</nav>

					<div className="hidden md:flex items-center gap-6">
						{customer ? (
							<Link
								href="/konto"
								className={cn(
									"inline-flex items-center gap-3 pl-1 pr-5 py-1 rounded-full",
									"text-sm text-primary border border-border-subtle bg-surface",
									"transition-[color,background-color,border-color] duration-200 ease-out",
									"hover-supported:hover:border-interactive hover-supported:hover:text-interactive",
								)}
								aria-label={`Konto: ${customer.firstName} ${customer.lastName}`}
							>
								<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-interactive text-white font-display text-[11px]">
									{initials(customer)}
								</span>
								{customer.firstName}
							</Link>
						) : (
							<Link
								href="/logowanie"
								className="py-3 text-sm text-primary transition-[color] duration-200 ease-out hover-supported:hover:text-interactive"
							>
								Zaloguj się
							</Link>
						)}

						<Link
							href="/rezerwacja"
							className="px-7 py-3 rounded-full bg-interactive text-paper-200 text-sm transition-[background-color] duration-200 ease-out hover-supported:hover:bg-interactive-hover"
						>
							Zarezerwuj wizytę
						</Link>
					</div>

					<button
						ref={triggerRef}
						type="button"
						onClick={() => setMenuOpen((v) => !v)}
						aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
						aria-expanded={menuOpen}
						aria-controls="mobile-nav"
						className="md:hidden flex flex-col justify-center items-center gap-3 w-18 h-18 shrink-0 bg-transparent border-none cursor-pointer"
					>
						<span className={cn("block h-px w-10 bg-primary transition-transform duration-200", menuOpen && "translate-y-[6.5px] rotate-45")} />
						<span className={cn("block h-px w-10 bg-primary transition-opacity duration-200", menuOpen && "opacity-0")} />
						<span className={cn("block h-px w-10 bg-primary transition-transform duration-200", menuOpen && "-translate-y-[6.5px] -rotate-45")} />
					</button>
				</div>

				<AnimatePresence>
					{menuOpen && (
						<motion.nav
							id="mobile-nav"
							aria-label="Główna nawigacja"
							className="md:hidden absolute inset-x-0 top-full mt-4 rounded-[12px] bg-surface border border-border-subtle shadow-lg p-6 flex flex-col gap-2 overflow-hidden"
							initial={{opacity: 0, y: -8}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: -8}}
							transition={{duration: 0.22, ease: [0.23, 1, 0.32, 1]}}
						>
							{NAV_LINKS.map((l) => (
								<Link
									key={l.href}
									href={l.href}
									className="px-6 py-5 rounded-md text-primary transition-[background-color] duration-150 hover-supported:hover:bg-surface-muted"
								>
									{l.label}
								</Link>
							))}

							<Link
								href={customer ? "/konto" : "/logowanie"}
								className="px-6 py-5 rounded-md text-primary transition-[background-color] duration-150 hover-supported:hover:bg-surface-muted"
							>
								{customer ? `Twoje konto · ${customer.firstName}` : "Zaloguj się"}
							</Link>

							<Link
								href="/rezerwacja"
								className="mt-4 px-8 py-5 rounded-full bg-interactive text-paper-200 text-sm text-center transition-[background-color] duration-200 ease-out hover-supported:hover:bg-interactive-hover"
							>
								Zarezerwuj wizytę
							</Link>
						</motion.nav>
					)}
				</AnimatePresence>
			</div>
		</header>
	)
}
