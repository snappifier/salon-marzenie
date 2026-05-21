// src/components/admin-shell/sticky-save-bar.tsx
"use client"

import {AnimatePresence, motion} from "motion/react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/cn"

interface StickySaveBarProps {
	open: boolean
	onDiscard?: () => void
	onSave: () => void
	saving?: boolean
	message?: string
	saveLabel?: string
	discardLabel?: string
}

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_IN_CUBIC: [number, number, number, number] = [0.4, 0, 1, 1]

export function StickySaveBar({
	open,
	onDiscard,
	onSave,
	saving,
	message = "Niezapisane zmiany",
	saveLabel = "Zapisz zmiany",
	discardLabel = "Odrzuć",
}: StickySaveBarProps) {
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className={cn(
						"fixed bottom-0 inset-x-0 z-30",
						"bg-rose-50/95 backdrop-blur-md border-t border-rose-200/60 shadow-lg",
					)}
					initial={{y: 80, opacity: 0}}
					animate={{y: 0, opacity: 1, transition: {duration: 0.26, ease: EASE_OUT_QUINT}}}
					exit={{y: 80, opacity: 0, transition: {duration: 0.18, ease: EASE_IN_CUBIC}}}
					role="region"
					aria-label="Niezapisane zmiany"
				>
					<div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
						<div className="flex items-center gap-2.5 min-w-0">
							<span className="hidden sm:inline-flex items-center justify-center w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
							<span className="text-sm font-medium text-graphite-900 truncate">{message}</span>
						</div>
						<div className="flex gap-2 shrink-0">
							{onDiscard && (
								<Button variant="secondary" size="sm" type="button" onClick={onDiscard} disabled={saving}>
									{discardLabel}
								</Button>
							)}
							<Button size="sm" type="button" onClick={onSave} disabled={saving}>
								{saving ? "Zapisywanie..." : saveLabel}
							</Button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
