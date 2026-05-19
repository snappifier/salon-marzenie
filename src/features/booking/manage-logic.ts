import type {BookingStatus} from "@/generated/prisma/client"

// Pure helpers do polityki anulowania/potwierdzania. Wyciągnięte z manage-actions.ts
// żeby móc testować je bez Prismy (manage-actions.ts to "use server" + dotyka DB).

// Minimalny czas przed wizytą, w którym customer może potwierdzić online.
// Po tym oknie wymaga kontaktu z salonem (telefon).
export const MIN_CONFIRM_HOURS_BEFORE = 72

export function canCancelByStatus(status: BookingStatus): boolean {
    // Po potwierdzeniu wizyty (CONFIRMED) anulowanie online jest zablokowane —
    // user musi zadzwonić. Buduje to commitment i redukuje no-show.
    return status === "PENDING"
}

export function canConfirmByStatus(status: BookingStatus): boolean {
    return status === "PENDING"
}

export function canCancelByPolicy(
    firstItemStart: Date,
    minCancelHoursBefore: number,
    now: Date,
): boolean {
    const deadline = new Date(firstItemStart.getTime() - minCancelHoursBefore * 60 * 60 * 1000)
    return now <= deadline
}

export function canConfirmByPolicy(
    firstItemStart: Date,
    minConfirmHoursBefore: number,
    now: Date,
): boolean {
    const deadline = new Date(firstItemStart.getTime() - minConfirmHoursBefore * 60 * 60 * 1000)
    return now <= deadline
}
