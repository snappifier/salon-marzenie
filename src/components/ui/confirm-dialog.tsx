// src/components/ui/confirm-dialog.tsx
"use client"

import {useState} from "react"
import {AlertTriangle, Info} from "lucide-react"
import {Modal} from "@/components/ui/modal"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/cn"

type Variant = "danger" | "warning"

interface ConfirmDialogProps {
	open: boolean
	onClose: () => void
	onConfirm: () => void | Promise<void>
	title: string
	description: string
	confirmLabel?: string
	cancelLabel?: string
	variant?: Variant
	loading?: boolean
}

const iconBg: Record<Variant, string> = {
	danger: "bg-error-bg text-error",
	warning: "bg-warning-bg text-warning",
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = "Usuń",
	cancelLabel = "Anuluj",
	variant = "danger",
	loading,
}: ConfirmDialogProps) {
	const [busy, setBusy] = useState(false)
	const isBusy = loading ?? busy

	async function handleConfirm() {
		if (isBusy) return
		try {
			setBusy(true)
			await onConfirm()
		} finally {
			setBusy(false)
		}
	}

	const Icon = variant === "danger" ? AlertTriangle : Info

	return (
		<Modal
			open={open}
			onClose={isBusy ? () => {} : onClose}
			size="sm"
			closeOnBackdrop={!isBusy}
			closeOnEscape={!isBusy}
		>
			<div className="flex flex-col items-center text-center pt-2">
				<div
					className={cn(
						"inline-flex items-center justify-center w-11 h-11 rounded-full mb-4",
						iconBg[variant],
					)}
					aria-hidden="true"
				>
					<Icon size={20} strokeWidth={2} />
				</div>
				<h3 className="font-serif text-[20px] leading-tight text-graphite-900 text-balance mb-2">
					{title}
				</h3>
				<p className="text-sm text-graphite-600 text-balance max-w-xs">
					{description}
				</p>
				<div className="flex w-full gap-2 mt-6">
					<Button
						className="flex-1"
						variant="secondary"
						type="button"
						onClick={onClose}
						disabled={isBusy}
					>
						{cancelLabel}
					</Button>
					<Button
						className="flex-1"
						variant={variant === "danger" ? "danger" : "primary"}
						type="button"
						data-autofocus
						onClick={handleConfirm}
						disabled={isBusy}
					>
						{isBusy ? (
							<span className="inline-flex items-center gap-2">
								<span
									className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin"
									aria-hidden="true"
								/>
								<span>Czekaj</span>
							</span>
						) : (
							confirmLabel
						)}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
