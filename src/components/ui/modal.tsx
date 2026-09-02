// src/components/ui/modal.tsx
"use client"

import {useEffect, useId, useRef} from "react"
import {createPortal} from "react-dom"
import {AnimatePresence, motion} from "motion/react"
import {X} from "lucide-react"
import {cn} from "@/lib/cn"

type Size = "sm" | "md" | "lg"

const sizeClasses: Record<Size, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-2xl",
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

interface ModalProps {
	open: boolean
	onClose: () => void
	title?: string
	children: React.ReactNode
	footer?: React.ReactNode
	size?: Size
	closeOnBackdrop?: boolean
	closeOnEscape?: boolean
	// Gdy false, X close button w headerze jest ukryty. Użyteczne dla
	// dialogów które blokują dismissal podczas async confirm (vide
	// ConfirmDialog z `closeOnBackdrop={!isBusy}`).
	showClose?: boolean
	className?: string
}

export function Modal({
	open,
	onClose,
	title,
	children,
	footer,
	size = "md",
	closeOnBackdrop = true,
	closeOnEscape = true,
	showClose = true,
	className,
}: ModalProps) {
	const titleId = useId()
	const panelRef = useRef<HTMLDivElement>(null)
	const previouslyFocused = useRef<HTMLElement | null>(null)

	useEffect(() => {
		if (!open) return
		previouslyFocused.current = document.activeElement as HTMLElement | null
		const t = window.setTimeout(() => {
			const panel = panelRef.current
			if (!panel) return
			const target = panel.querySelector<HTMLElement>("[data-autofocus]")
				?? panel.querySelector<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				)
			target?.focus()
		}, 0)
		return () => {
			window.clearTimeout(t)
			previouslyFocused.current?.focus()
		}
	}, [open])

	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = "hidden"
		return () => {
			document.body.style.overflow = prev
		}
	}, [open])

	useEffect(() => {
		if (!open) return
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape" && closeOnEscape) {
				e.stopPropagation()
				onClose()
				return
			}
			if (e.key !== "Tab") return
			const panel = panelRef.current
			if (!panel) return
			const focusable = panel.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
	}, [open, closeOnEscape, onClose])

	if (typeof document === "undefined") return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<div
					className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
					role="dialog"
					aria-modal="true"
					aria-labelledby={title ? titleId : undefined}
				>
					<motion.div
						className="absolute inset-0 bg-ink-900/40"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						transition={{duration: 0.2, ease: EASE_OUT_QUINT}}
						onClick={closeOnBackdrop ? onClose : undefined}
						aria-hidden="true"
					/>
					<motion.div
						ref={panelRef}
						className={cn(
							"relative w-full bg-surface rounded-lg shadow-xl border border-border-subtle",
							"flex flex-col max-h-[calc(100dvh-2rem)]",
							sizeClasses[size],
							className,
						)}
						initial={{opacity: 0, y: 12, scale: 0.98}}
						animate={{
							opacity: 1,
							y: 0,
							scale: 1,
							transition: {duration: 0.24, ease: EASE_OUT_QUINT},
						}}
						exit={{
							opacity: 0,
							y: 8,
							scale: 0.98,
							transition: {duration: 0.2, ease: EASE_IN_CUBIC},
						}}
					>
						{title && (
							<div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
								<h3
									id={titleId}
									className="font-display text-[20px] leading-tight text-primary text-balance"
								>
									{title}
								</h3>
								{showClose && (
									<button
										className={cn(
											"shrink-0 -mr-2 inline-flex items-center justify-center w-9 h-9 rounded-full text-secondary",
											"transition-[background-color,color] duration-150 ease-out",
											"hover-supported:hover:bg-surface-muted hover-supported:hover:text-primary",
											"active:scale-[0.94]",
										)}
										type="button"
										aria-label="Zamknij okno"
										onClick={onClose}
									>
										<X size={18} />
									</button>
								)}
							</div>
						)}
						<div
							className={cn(
								"px-6 overflow-y-auto",
								title ? "pt-1 pb-5" : "py-6",
							)}
						>
							{children}
						</div>
						{footer && (
							<div className="px-6 py-4 border-t border-border-subtle bg-paper-300/50 rounded-b-2xl">
								{footer}
							</div>
						)}
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	)
}
