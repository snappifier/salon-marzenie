// src/components/admin-shell/mobile-slide-over.tsx
"use client"

import Link from "next/link"
import {useEffect, useRef} from "react"
import {createPortal} from "react-dom"
import {usePathname} from "next/navigation"
import {AnimatePresence, motion} from "motion/react"
import {LogOut, Settings, X} from "lucide-react"
import {cn} from "@/lib/cn"
import {logoutAction} from "./actions"

interface NavLink {
	href: string
	label: string
	icon?: React.ReactNode
}

interface MobileSlideOverProps {
	open: boolean
	onClose: () => void
	userName: string
	userInitials: string
	links: NavLink[]
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

export function MobileSlideOver({open, onClose, userName, userInitials, links}: MobileSlideOverProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const previouslyFocused = useRef<HTMLElement | null>(null)
	const pathname = usePathname()

	useEffect(() => {
		if (!open) return
		previouslyFocused.current = document.activeElement as HTMLElement | null
		const t = window.setTimeout(() => {
			const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
				'button, [href], [tabindex]:not([tabindex="-1"])',
			)
			firstFocusable?.focus()
		}, 0)
		return () => {
			window.clearTimeout(t)
			previouslyFocused.current?.focus()
		}
	}, [open])

	useEffect(() => {
		if (open) onClose()
	}, [pathname])

	useEffect(() => {
		if (!open) return
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onClose()
				return
			}
			if (e.key !== "Tab") return
			const panel = panelRef.current
			if (!panel) return
			const focusable = panel.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
			)
			if (focusable.length === 0) return
			const first = focusable[0]
			const last = focusable[focusable.length - 1]
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first.focus()
			}
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [open, onClose])

	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = "hidden"
		return () => {
			document.body.style.overflow = prev
		}
	}, [open])

	if (typeof document === "undefined") return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu nawigacji">
					<motion.div
						className="absolute inset-0 bg-graphite-900/40"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						transition={{duration: 0.2, ease: EASE_OUT_QUINT}}
						onClick={onClose}
						aria-hidden="true"
					/>
					<motion.div
						ref={panelRef}
						className={cn(
							"absolute left-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-cream",
							"flex flex-col shadow-xl",
						)}
						initial={{x: "-100%"}}
						animate={{x: 0, transition: {duration: 0.24, ease: EASE_OUT_QUINT}}}
						exit={{x: "-100%", transition: {duration: 0.2, ease: EASE_IN_CUBIC}}}
					>
						<div className="flex items-center justify-between px-5 h-16 border-b border-border-soft">
							<span className="font-serif italic font-medium text-xl text-graphite-900 leading-none">
								Salon Marzenie
							</span>
							<button
								className={cn(
									"inline-flex items-center justify-center w-9 h-9 -mr-1 rounded-full text-graphite-600",
									"transition-[background-color,color] duration-150 ease-out",
									"hover-supported:hover:bg-graphite-100 hover-supported:hover:text-graphite-900",
									"active:scale-[0.94]",
								)}
								type="button"
								aria-label="Zamknij menu"
								onClick={onClose}
							>
								<X size={18} />
							</button>
						</div>

						<nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Nawigacja admin">
							<ul className="flex flex-col gap-0.5">
								{links.map((link) => {
									const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
									return (
										<li key={link.href}>
											<Link
												className={cn(
													"flex items-center gap-3 px-3 h-14 rounded-xl text-[15px] font-medium",
													"transition-[background-color,color] duration-150 ease-out",
													isActive
														? "bg-rose-50 text-rose-700"
														: "text-graphite-900 hover-supported:hover:bg-graphite-100/60",
												)}
												href={link.href}
												aria-current={isActive ? "page" : undefined}
											>
												{link.icon && (
													<span
														className={cn(
															"shrink-0",
															isActive ? "text-rose-600" : "text-graphite-500",
														)}
														aria-hidden="true"
													>
														{link.icon}
													</span>
												)}
												<span>{link.label}</span>
											</Link>
										</li>
									)
								})}
							</ul>
						</nav>

						<div className="border-t border-border-soft p-3">
							<div className="flex items-center gap-3 px-2 py-2 mb-1">
								<span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-50 text-rose-700 font-serif font-medium text-sm">
									{userInitials}
								</span>
								<div className="min-w-0">
									<p className="text-[11px] uppercase tracking-[0.18em] text-graphite-400 font-medium">
										Zalogowano
									</p>
									<p className="text-sm font-medium text-graphite-900 truncate">
										{userName}
									</p>
								</div>
							</div>
							<Link
								className={cn(
									"flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-medium text-graphite-900",
									"transition-[background-color] duration-150 ease-out",
									"hover-supported:hover:bg-graphite-100/60",
								)}
								href="/admin/ustawienia"
							>
								<Settings size={16} className="text-graphite-500" aria-hidden="true" />
								<span>Ustawienia</span>
							</Link>
							<form action={logoutAction}>
								<button
									className={cn(
										"w-full flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-medium text-graphite-900 text-left",
										"transition-[background-color] duration-150 ease-out",
										"hover-supported:hover:bg-graphite-100/60",
									)}
									type="submit"
								>
									<LogOut size={16} className="text-graphite-500" aria-hidden="true" />
									<span>Wyloguj się</span>
								</button>
							</form>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	)
}
