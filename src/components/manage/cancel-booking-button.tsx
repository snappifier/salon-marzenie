"use client"

import {useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {AlertCircle, X} from "lucide-react"
import {cancelBooking} from "@/features/booking/manage-actions"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/cn"

type Props = {
    token: string
}

export function CancelBookingButton({token}: Props) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const submittingRef = useRef(false)

    async function handleCancel() {
        if (submittingRef.current) return
        if (!confirm("Czy na pewno chcesz anulować tę wizytę? Tej operacji nie można cofnąć.")) {
            return
        }

        submittingRef.current = true
        setSubmitting(true)

        const result = await cancelBooking(token)

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
                className={cn(
                    "min-w-[180px]",
                    "bg-transparent border border-error/40 text-error",
                    "hover-supported:hover:bg-error-bg hover-supported:hover:border-error",
                )}
                type="button"
                onClick={handleCancel}
                disabled={submitting}
            >
                {submitting ? "Anulowanie..." : (
                    <>
                        <X size={16} />
                        Anuluj wizytę
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
