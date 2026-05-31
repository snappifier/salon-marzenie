// src/features/booking/manage-logic.ts
import type {BookingStatus} from "@/generated/prisma/client"

// Pure helpers do polityki anulowania. Wyciągnięte z manage-actions.ts żeby
// móc testować je bez Prismy (manage-actions.ts to "use server" + dotyka DB).

export function canCancelByStatus(status: BookingStatus, requireConfirmation: boolean): boolean {
	if (status === "PENDING") return true
	if (status === "CONFIRMED") return !requireConfirmation
	return false
}

export function canCancelByPolicy(
	firstItemStart: Date,
	minCancelHoursBefore: number,
	now: Date,
): boolean {
	const deadline = new Date(firstItemStart.getTime() - minCancelHoursBefore * 60 * 60 * 1000)
	return now <= deadline
}

export function canConfirmByStatus(status: BookingStatus): boolean {
	return status === "PENDING"
}

export type ConfirmPolicyResult = "ok" | "too_early" | "too_late"

export function canConfirmByPolicy(
	startAt: Date,
	minHoursBefore: number,
	maxHoursBefore: number,
	now: Date,
): ConfirmPolicyResult {
	const minMs = minHoursBefore * 3600 * 1000
	const maxMs = maxHoursBefore * 3600 * 1000
	const tooEarlyDeadline = new Date(startAt.getTime() - maxMs)
	const tooLateDeadline = new Date(startAt.getTime() - minMs)
	if (now < tooEarlyDeadline) return "too_early"
	if (now > tooLateDeadline) return "too_late"
	return "ok"
}
