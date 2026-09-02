// src/components/ui/toast.tsx
"use client"

import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react"
import {AnimatePresence, motion} from "motion/react"
import {Check, Info, X, AlertTriangle} from "lucide-react"
import {cn} from "@/lib/cn"

type ToastVariant = "success" | "error" | "info" | "warning"

interface ToastItem {
	id: string
	variant: ToastVariant
	message: string
	duration: number
}

interface ToastOptions {
	duration?: number
}

interface ToastApi {
	success: (message: string, options?: ToastOptions) => string
	error: (message: string, options?: ToastOptions) => string
	info: (message: string, options?: ToastOptions) => string
	warning: (message: string, options?: ToastOptions) => string
	dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const DEFAULT_DURATION = 4000
const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

const variantStyles: Record<ToastVariant, {wrapper: string; icon: string; iconBg: string; Icon: typeof Check}> = {
	success: {
		wrapper: "border-l-success",
		icon: "text-success",
		iconBg: "bg-success-bg",
		Icon: Check,
	},
	error: {
		wrapper: "border-l-error",
		icon: "text-error",
		iconBg: "bg-error-bg",
		Icon: X,
	},
	info: {
		wrapper: "border-l-interactive",
		icon: "text-interactive",
		iconBg: "bg-surface-muted",
		Icon: Info,
	},
	warning: {
		wrapper: "border-l-warning",
		icon: "text-warning",
		iconBg: "bg-warning-bg",
		Icon: AlertTriangle,
	},
}

function genId() {
	return `t-${Math.random().toString(36).slice(2, 10)}`
}

export function ToastProvider({children}: {children: React.ReactNode}) {
	const [items, setItems] = useState<ToastItem[]>([])
	const timersRef = useRef<Map<string, number>>(new Map())

	const dismiss = useCallback((id: string) => {
		setItems((prev) => prev.filter((t) => t.id !== id))
		const timers = timersRef.current
		const handle = timers.get(id)
		if (handle !== undefined) {
			window.clearTimeout(handle)
			timers.delete(id)
		}
	}, [])

	const push = useCallback(
		(variant: ToastVariant, message: string, options?: ToastOptions) => {
			const id = genId()
			const duration = options?.duration ?? DEFAULT_DURATION
			setItems((prev) => [...prev, {id, variant, message, duration}])
			if (duration > 0) {
				const handle = window.setTimeout(() => dismiss(id), duration)
				timersRef.current.set(id, handle)
			}
			return id
		},
		[dismiss],
	)

	useEffect(() => {
		const timers = timersRef.current
		return () => {
			timers.forEach((h) => window.clearTimeout(h))
			timers.clear()
		}
	}, [])

	const api = useMemo<ToastApi>(
		() => ({
			success: (m, o) => push("success", m, o),
			error: (m, o) => push("error", m, o),
			info: (m, o) => push("info", m, o),
			warning: (m, o) => push("warning", m, o),
			dismiss,
		}),
		[push, dismiss],
	)

	return (
		<ToastContext.Provider value={api}>
			{children}
			<ToastViewport items={items} onDismiss={dismiss} />
		</ToastContext.Provider>
	)
}

function ToastViewport({items, onDismiss}: {items: ToastItem[]; onDismiss: (id: string) => void}) {
	return (
		<div
			className={cn(
				"pointer-events-none fixed z-[60] flex flex-col gap-2 px-4",
				"top-4 left-1/2 -translate-x-1/2 w-full max-w-sm",
				"sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 sm:translate-x-0 sm:max-w-[22rem]",
			)}
			aria-live="polite"
			aria-atomic="false"
		>
			<AnimatePresence initial={false}>
				{items.map((t) => (
					<ToastItemView key={t.id} item={t} onDismiss={() => onDismiss(t.id)} />
				))}
			</AnimatePresence>
		</div>
	)
}

function ToastItemView({item, onDismiss}: {item: ToastItem; onDismiss: () => void}) {
	const styles = variantStyles[item.variant]
	const Icon = styles.Icon
	const role = item.variant === "error" ? "alert" : "status"

	return (
		<motion.div
			className={cn(
				"pointer-events-auto rounded-lg bg-surface border border-border-subtle shadow-lg overflow-hidden",
				"border-l-4",
				styles.wrapper,
			)}
			initial={{opacity: 0, y: -12, scale: 0.98}}
			animate={{opacity: 1, y: 0, scale: 1, transition: {duration: 0.24, ease: EASE_OUT_QUINT}}}
			exit={{opacity: 0, y: -8, scale: 0.98, transition: {duration: 0.2, ease: EASE_IN_CUBIC}}}
			layout
			role={role}
		>
			<div className="flex items-start gap-3 p-3 pr-2">
				<div
					className={cn(
						"shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full",
						styles.iconBg,
						styles.icon,
					)}
					aria-hidden="true"
				>
					<Icon size={16} strokeWidth={2.25} />
				</div>
				<p className="flex-1 min-w-0 text-sm text-primary leading-snug pt-1.5 pb-1.5 break-words">
					{item.message}
				</p>
				<button
					className={cn(
						"shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-secondary",
						"transition-[background-color,color] duration-150 ease-out",
						"hover-supported:hover:bg-surface-muted hover-supported:hover:text-primary",
						"active:scale-[0.94]",
					)}
					type="button"
					aria-label="Zamknij powiadomienie"
					onClick={onDismiss}
				>
					<X size={14} />
				</button>
			</div>
		</motion.div>
	)
}

export function useToast(): ToastApi {
	const ctx = useContext(ToastContext)
	if (!ctx) {
		throw new Error("useToast must be used within ToastProvider")
	}
	return ctx
}
