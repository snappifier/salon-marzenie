// src/components/admin-shell/row-action-menu.tsx
"use client"

import Link from "next/link"
import {useEffect, useRef, useState} from "react"
import {AnimatePresence, motion} from "motion/react"
import {MoreHorizontal} from "lucide-react"
import {cn} from "@/lib/cn"

export interface RowAction {
	id: string
	label: string
	icon?: React.ReactNode
	href?: string
	onClick?: () => void
	danger?: boolean
	disabled?: boolean
}

interface RowActionMenuProps {
	className?: string
	actions: RowAction[]
	label?: string
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function RowActionMenu({className, actions, label = "Akcje"}: RowActionMenuProps) {
	const [open, setOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (!open) return
		function onPointerDown(e: PointerEvent) {
			if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
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

	function handleClickItem(e: React.MouseEvent, action: RowAction) {
		e.preventDefault()
		e.stopPropagation()
		if (action.disabled) return
		setOpen(false)
		action.onClick?.()
	}

	return (
		<div ref={wrapperRef} className={cn("relative inline-flex", className)}>
			<button
				ref={triggerRef}
				className={cn(
					"inline-flex items-center justify-center w-9 h-9 rounded-full text-graphite-500",
					"transition-[background-color,color] duration-150 ease-out",
					"hover-supported:hover:bg-graphite-100 hover-supported:hover:text-graphite-900",
					"active:scale-[0.94]",
				)}
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={label}
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					setOpen((v) => !v)
				}}
			>
				<MoreHorizontal size={16} />
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-lg border border-border-soft overflow-hidden origin-top-right z-30 py-1"
						role="menu"
						initial={{opacity: 0, scale: 0.96, y: -4}}
						animate={{opacity: 1, scale: 1, y: 0, transition: {duration: 0.16, ease: EASE_OUT_QUINT}}}
						exit={{opacity: 0, scale: 0.96, y: -4, transition: {duration: 0.12, ease: [0.4, 0, 1, 1]}}}
					>
						{actions.map((action) => {
							const className = cn(
								"w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left",
								"transition-[background-color] duration-150 ease-out",
								action.disabled && "opacity-50 cursor-not-allowed",
								action.danger
									? "text-error hover-supported:hover:bg-error-bg/60"
									: "text-graphite-900 hover-supported:hover:bg-rose-50/60",
							)
							if (action.href) {
								return (
									<Link
										key={action.id}
										className={className}
										href={action.href}
										role="menuitem"
										onClick={() => setOpen(false)}
									>
										{action.icon && (
											<span className={cn(action.danger ? "text-error" : "text-graphite-500")} aria-hidden="true">
												{action.icon}
											</span>
										)}
										<span>{action.label}</span>
									</Link>
								)
							}
							return (
								<button
									key={action.id}
									type="button"
									role="menuitem"
									disabled={action.disabled}
									className={className}
									onClick={(e) => handleClickItem(e, action)}
								>
									{action.icon && (
										<span className={cn(action.danger ? "text-error" : "text-graphite-500")} aria-hidden="true">
											{action.icon}
										</span>
									)}
									<span>{action.label}</span>
								</button>
							)
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
