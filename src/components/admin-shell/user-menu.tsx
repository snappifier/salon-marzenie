// src/components/admin-shell/user-menu.tsx
"use client"

import Link from "next/link"
import {useEffect, useId, useRef, useState} from "react"
import {AnimatePresence, motion} from "motion/react"
import {ChevronDown, LogOut, Settings} from "lucide-react"
import {cn} from "@/lib/cn"
import {logoutAction} from "./actions"

interface UserMenuProps {
	userName: string
	userInitials: string
	className?: string
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

export function UserMenu({userName, userInitials, className}: UserMenuProps) {
	const [open, setOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const menuId = useId()

	useEffect(() => {
		if (!open) return
		function onPointerDown(e: PointerEvent) {
			if (!wrapperRef.current?.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setOpen(false)
				triggerRef.current?.focus()
			}
		}
		document.addEventListener("pointerdown", onPointerDown)
		document.addEventListener("keydown", onKey)
		return () => {
			document.removeEventListener("pointerdown", onPointerDown)
			document.removeEventListener("keydown", onKey)
		}
	}, [open])

	return (
		<div ref={wrapperRef} className={cn("relative", className)}>
			<button
				ref={triggerRef}
				type="button"
				className={cn(
					"inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full",
					"border border-border-soft bg-white",
					"transition-[border-color,background-color] duration-150 ease-out",
					"hover-supported:hover:border-rose-200 hover-supported:hover:bg-rose-50/40",
					"active:scale-[0.97]",
				)}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={() => setOpen((v) => !v)}
			>
				<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-700 font-serif font-medium text-[11px]">
					{userInitials}
				</span>
				<ChevronDown
					className={cn(
						"text-graphite-500 transition-transform duration-150 ease-out",
						open && "rotate-180",
					)}
					size={14}
					aria-hidden="true"
				/>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						id={menuId}
						role="menu"
						aria-label={`Menu użytkownika ${userName}`}
						className={cn(
							"absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-lg border border-border-soft overflow-hidden",
							"origin-top-right",
						)}
						initial={{opacity: 0, scale: 0.95, y: -4}}
						animate={{opacity: 1, scale: 1, y: 0, transition: {duration: 0.2, ease: EASE_OUT_QUINT}}}
						exit={{opacity: 0, scale: 0.96, y: -4, transition: {duration: 0.15, ease: EASE_IN_CUBIC}}}
					>
						<div className="px-3.5 py-3 border-b border-border-soft">
							<p className="text-[11px] uppercase tracking-[0.18em] text-graphite-400 font-medium">
								Zalogowano jako
							</p>
							<p className="text-sm font-medium text-graphite-900 truncate mt-0.5">
								{userName}
							</p>
						</div>
						<nav className="py-1.5">
							<Link
								className={cn(
									"flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-graphite-900 mx-1 rounded-md",
									"transition-[background-color] duration-150 ease-out",
									"hover-supported:hover:bg-rose-50/60",
								)}
								href="/admin/ustawienia"
								role="menuitem"
								onClick={() => setOpen(false)}
							>
								<Settings size={15} className="text-graphite-500" aria-hidden="true" />
								<span>Ustawienia</span>
							</Link>
							<form action={logoutAction}>
								<button
									className={cn(
										"w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-graphite-900 mx-1 rounded-md text-left",
										"transition-[background-color,color] duration-150 ease-out",
										"hover-supported:hover:bg-rose-50/60",
									)}
									type="submit"
									role="menuitem"
								>
									<LogOut size={15} className="text-graphite-500" aria-hidden="true" />
									<span>Wyloguj się</span>
								</button>
							</form>
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
