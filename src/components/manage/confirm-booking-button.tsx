// src/components/manage/confirm-booking-button.tsx
"use client"

import {useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {AlertCircle, Check} from "lucide-react"
import {confirmBooking} from "@/features/booking/manage-actions"
import {Button} from "@/components/ui/button"

type Props = {
	token: string
}

export function ConfirmBookingButton({token}: Props) {
	const router = useRouter()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const submittingRef = useRef(false)

	async function handleConfirm() {
		if (submittingRef.current) return
		if (!confirm("Czy na pewno chcesz potwierdzić tę wizytę?")) {
			return
		}

		submittingRef.current = true
		setSubmitting(true)

		const result = await confirmBooking(token)

		if (!result.success) {
			setError(result.error)
			setSubmitting(false)
			submittingRef.current = false
			return
		}

		setError(null)
		router.refresh()
	}

	return (
		<div className="space-y-2">
			<Button
				className="min-w-[180px]"
				variant="primary"
				type="button"
				onClick={handleConfirm}
				disabled={submitting}
			>
				{submitting ? "Potwierdzanie..." : (
					<>
						<Check size={16} />
						Potwierdź wizytę
					</>
				)}
			</Button>
			{error && (
				<div className="flex items-start gap-2 text-sm text-error" role="alert">
					<AlertCircle size={14} strokeWidth={1.8} className="shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}
		</div>
	)
}
