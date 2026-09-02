// src/components/ui/status-badge.tsx
import {cn} from "@/lib/cn"

export type StatusVariant =
	| "confirmed"
	| "pending"
	| "cancelled"
	| "completed"
	| "no_show"
	| "active"
	| "inactive"

interface VariantStyle {
	bg: string
	text: string
	dot: string
	label: string
}

const variants: Record<StatusVariant, VariantStyle> = {
	confirmed: {
		bg: "bg-success-bg",
		text: "text-success",
		dot: "bg-success",
		label: "Potwierdzona",
	},
	pending: {
		bg: "bg-warning-bg",
		text: "text-warning",
		dot: "bg-warning",
		label: "Oczekuje",
	},
	cancelled: {
		bg: "bg-error-bg",
		text: "text-error",
		dot: "bg-error",
		label: "Anulowana",
	},
	completed: {
		bg: "bg-surface-muted",
		text: "text-primary",
		dot: "bg-secondary",
		label: "Zakończona",
	},
	no_show: {
		bg: "bg-error-bg",
		text: "text-error",
		dot: "bg-error",
		label: "Nieobecność",
	},
	active: {
		bg: "bg-surface-muted",
		text: "text-interactive-hover",
		dot: "bg-interactive",
		label: "Aktywny",
	},
	inactive: {
		bg: "bg-surface-muted",
		text: "text-secondary",
		dot: "bg-secondary",
		label: "Nieaktywny",
	},
}

interface StatusBadgeProps {
	className?: string
	variant: StatusVariant
	children?: React.ReactNode
}

export function StatusBadge({className, variant, children}: StatusBadgeProps) {
	const style = variants[variant]
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] whitespace-nowrap",
				style.bg,
				style.text,
				className,
			)}
		>
			<span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} aria-hidden="true" />
			<span>{children ?? style.label}</span>
		</span>
	)
}
