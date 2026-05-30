// src/components/admin-shell/admin-top-bar.tsx
"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState} from "react"
import {motion} from "motion/react"
import {Calendar, LayoutDashboard, Menu, Sparkles, Users, Wrench} from "lucide-react"
import {cn} from "@/lib/cn"
import {autoInitials} from "@/lib/initials"
import {UserMenu} from "./user-menu"
import {MobileSlideOver} from "./mobile-slide-over"

interface AdminTopBarProps {
	userName: string
	userInitials?: string
	className?: string
}

interface NavSection {
	href: string
	label: string
	icon: React.ReactNode
}

const NAV_SECTIONS: NavSection[] = [
	{href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />},
	{href: "/admin/kalendarz", label: "Kalendarz", icon: <Calendar size={18} />},
	{href: "/admin/klienci", label: "Klienci", icon: <Users size={18} />},
	{href: "/admin/oferta", label: "Oferta", icon: <Sparkles size={18} />},
	{href: "/admin/zespol", label: "Zespół", icon: <Wrench size={18} />},
]

function isSectionActive(pathname: string, href: string): boolean {
	if (href === "/admin") return pathname === "/admin"
	return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminTopBar({userName, userInitials, className}: AdminTopBarProps) {
	const pathname = usePathname()
	const [mobileOpen, setMobileOpen] = useState(false)
	const initials = userInitials ?? autoInitials(userName)

	return (
		<>
			<header
				className={cn(
					"sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-soft",
					className,
				)}
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="flex items-center justify-between gap-3 h-16">
						<div className="flex items-center gap-2 lg:gap-8 min-w-0">
							<button
								type="button"
								className={cn(
									"lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-graphite-700",
									"transition-[background-color,color] duration-150 ease-out",
									"hover-supported:hover:bg-graphite-100 hover-supported:hover:text-graphite-900",
									"active:scale-[0.94]",
								)}
								aria-label="Otwórz menu"
								aria-expanded={mobileOpen}
								onClick={() => setMobileOpen(true)}
							>
								<Menu size={20} />
							</button>

							<Link
								className="font-serif italic font-medium text-xl sm:text-2xl text-graphite-900 leading-none tracking-tight whitespace-nowrap"
								href="/admin"
								aria-label="Salon Marzenie - panel administracyjny"
							>
								Salon Marzenie
							</Link>

							<nav
								className="hidden lg:flex items-center gap-1 ml-2"
								aria-label="Nawigacja admin"
							>
								{NAV_SECTIONS.map((section) => {
									const isActive = isSectionActive(pathname, section.href)
									return (
										<Link
											key={section.href}
											className={cn(
												"relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap",
												"transition-[color] duration-150 ease-out",
												isActive
													? "text-rose-600"
													: "text-graphite-700 hover-supported:hover:text-graphite-900",
											)}
											href={section.href}
											aria-current={isActive ? "page" : undefined}
										>
											<span>{section.label}</span>
											{isActive && (
												<motion.span
													className="absolute left-2 right-2 -bottom-[17px] h-[2px] bg-rose-600 rounded-full"
													layoutId="admin-nav-underline"
													transition={{duration: 0.24, ease: [0.22, 1, 0.36, 1]}}
													aria-hidden="true"
												/>
											)}
										</Link>
									)
								})}
							</nav>
						</div>

						<div className="flex items-center gap-2 sm:gap-3 shrink-0">
							<UserMenu userName={userName} userInitials={initials} />
						</div>
					</div>
				</div>
			</header>

			<MobileSlideOver
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				userName={userName}
				userInitials={initials}
				links={NAV_SECTIONS}
			/>
		</>
	)
}
