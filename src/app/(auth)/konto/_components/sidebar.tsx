"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState} from "react"
import {
	Activity,
	Bell,
	Calendar,
	Heart,
	LayoutDashboard,
	LogOut,
	Menu,
	User,
} from "lucide-react"
import {cn} from "@/lib/cn"
import {logoutAction} from "@/app/(auth)/konto/actions"

interface NavItem {
	label: string
	href: string
	icon: React.ReactNode
	badge?: number
}

const mainNavItems: NavItem[] = [
	{label: "Pulpit", href: "/konto", icon: <LayoutDashboard size={18} strokeWidth={1.6} />},
	{label: "Moje wizyty", href: "/konto/wizyty", icon: <Calendar size={18} strokeWidth={1.6} />},
	{label: "Historia", href: "/konto/historia", icon: <Activity size={18} strokeWidth={1.6} />},
	{label: "Ulubione zabiegi", href: "/konto/ulubione", icon: <Heart size={18} strokeWidth={1.6} />},
]

const accountNavItems: NavItem[] = [
	{label: "Dane osobowe", href: "/konto/dane-osobowe", icon: <User size={18} strokeWidth={1.6} />},
	{label: "Powiadomienia", href: "/konto/powiadomienia", icon: <Bell size={18} strokeWidth={1.6} />},
]

interface SidebarProps {
	firstName: string
	lastName: string
	upcomingCount: number
	favoritesCount?: number
}

export function Sidebar({firstName, lastName, upcomingCount, favoritesCount}: SidebarProps) {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

	const items = mainNavItems.map((item) => {
		if (item.label === "Moje wizyty" && upcomingCount > 0) return {...item, badge: upcomingCount}
		if (item.label === "Ulubione zabiegi" && favoritesCount && favoritesCount > 0)
			return {...item, badge: favoritesCount}
		return item
	})

	return (
		<aside
			className={cn(
				"fixed top-0 left-0 z-20 flex flex-col bg-surface",
				"w-full md:w-65",
				"md:h-screen border-b md:border-b-0 md:border-r border-border-subtle",
				"px-4.5 py-4 md:px-5 md:py-7",
				open ? "h-dvh" : "h-auto",
			)}
		>
			<div className={cn("flex items-center justify-between", open ? "mb-7" : "mb-0 md:mb-7")}>
				<Link
					href="/"
					className="font-display italic font-medium text-[22px] text-primary tracking-[-0.01em] leading-none"
				>
					Marzenie
					<span className="block font-body not-italic font-medium text-[8px] uppercase tracking-[0.18em] text-secondary -mt-0.5">
						studio kosmetyki
					</span>
				</Link>
				<button
					onClick={() => setOpen((o) => !o)}
					className={cn(
						"md:hidden inline-flex items-center justify-center p-2 text-primary rounded-sm",
						"transition-[background-color] duration-150 ease-out",
						"hover-supported:hover:bg-surface-muted active:scale-[0.97]",
					)}
					aria-label="Menu"
					aria-expanded={open}
				>
					<Menu size={22} strokeWidth={2} />
				</button>
			</div>

			<nav className={cn("flex-col gap-0.5 flex-1", open ? "flex" : "hidden md:flex")}>
				<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-secondary px-3 pb-1.5 pt-4 md:pt-0">
					Twoje konto
				</p>
				{items.map((item) => (
					<NavLink key={item.label} item={item} active={item.href === pathname} />
				))}

				<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-secondary px-3 pb-1.5 pt-3.5">
					Konto
				</p>
				{accountNavItems.map((item) => (
					<NavLink key={item.label} item={item} active={item.href === pathname} />
				))}

				<form action={logoutAction} className="contents">
					<button
						type="submit"
						className={cn(
							"flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-left",
							"text-secondary [&_svg]:text-secondary",
							"transition-[background-color,color] duration-150 ease-out",
							"hover-supported:hover:bg-surface-muted hover-supported:hover:text-primary hover-supported:hover:[&_svg]:text-interactive",
							"active:scale-[0.99]",
						)}
					>
						<LogOut size={18} strokeWidth={1.6} />
						Wyloguj
					</button>
				</form>
			</nav>

			<div
				className={cn(
					"mt-4 p-3 bg-paper-300 rounded-md items-center gap-2.5",
					open ? "flex" : "hidden md:flex",
				)}
			>
				<div className="shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-accent-100 to-interactive text-white flex items-center justify-center font-display font-medium text-sm">
					{initials}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-[13px] font-medium text-primary truncate">
						{firstName} {lastName}
					</p>
					<p className="text-[11px] text-interactive flex items-center gap-1">
						<span className="inline-block w-1.25 h-1.25 rounded-full bg-interactive" />
						Klient
					</p>
				</div>
			</div>
		</aside>
	)
}

function NavLink({item, active}: {item: NavItem; active: boolean}) {
	if (active) {
		return (
			<Link
				href={item.href}
				className={cn(
					"flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md",
					"relative bg-paper-300 text-primary",
					"transition-[background-color,color] duration-150 ease-out",
					"[&_svg]:text-interactive",
					"before:content-[''] before:absolute before:-left-5 before:top-1/2",
					"before:-translate-y-1/2 before:w-0.75 before:h-4.5",
					"before:bg-interactive before:rounded-r-sm",
				)}
				aria-current="page"
			>
				{item.icon}
				{item.label}
				{item.badge !== undefined && (
					<span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-paper-400 text-interactive-hover font-medium">
						{item.badge}
					</span>
				)}
			</Link>
		)
	}

	return (
		<Link
			href={item.href}
			className={cn(
				"flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md",
				"relative text-secondary [&_svg]:text-secondary",
				"transition-[background-color,color] duration-150 ease-out",
				"hover-supported:hover:bg-surface-muted hover-supported:hover:text-primary hover-supported:hover:[&_svg]:text-interactive",
			)}
		>
			{item.icon}
			{item.label}
			{item.badge !== undefined && (
				<span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-paper-400 text-interactive-hover font-medium">
					{item.badge}
				</span>
			)}
		</Link>
	)
}
