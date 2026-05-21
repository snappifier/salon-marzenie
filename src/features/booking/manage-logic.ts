// src/features/booking/manage-logic.ts
import type {BookingStatus} from "@/generated/prisma/client"

// Pure helpers do polityki anulowania. Wyciągnięte z manage-actions.ts żeby
// móc testować je bez Prismy (manage-actions.ts to "use server" + dotyka DB).

export function canCancelByStatus(status: BookingStatus): boolean {
	return status === "PENDING" || status === "CONFIRMED"
}

export function canCancelByPolicy(
	firstItemStart: Date,
	minCancelHoursBefore: number,
	now: Date,
): boolean {
	const deadline = new Date(firstItemStart.getTime() - minCancelHoursBefore * 60 * 60 * 1000)
	return now <= deadline
}
