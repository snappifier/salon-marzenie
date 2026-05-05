"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {cancelBooking} from "@/features/booking/manage-actions"

type Props = {
    token: string
}

export function CancelBookingButton({token}: Props) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleCancel() {
        if (!confirm("Czy na pewno chcesz anulować tę wizytę? Tej operacji nie można cofnąć.")) {
            return
        }

        setSubmitting(true)
        setError(null)

        const result = await cancelBooking(token)

        if (!result.success) {
            setError(result.error)
            setSubmitting(false)
            return
        }

        router.refresh()
    }

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 border border-red-300 text-red-700 rounded disabled:opacity-50"
            >
                {submitting ? "Anulowanie..." : "Anuluj wizytę"}
            </button>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}