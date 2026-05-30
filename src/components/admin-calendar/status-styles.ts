// src/components/admin-calendar/status-styles.ts
import type {BookingStatus} from "@/generated/prisma/client"
import type {StatusVariant} from "@/components/ui/status-badge"

// Kolor wizyty niesie informację o PRACOWNIKU (staff.color), nie o statusie.
// Status pokazujemy subtelnie: ikoną w rogu, przekreśleniem (anulowane),
// przygaszeniem (anulowane) lub przerywanym paskiem (oczekuje).
export interface EventStatusStyle {
	strike: boolean // przekreślony tekst
	dimmed: boolean // ignoruj kolor pracownika, pokaż na szaro (wizyta nieaktywna)
	pending: boolean // przerywany/półprzezroczysty pasek pracownika
	icon: "clock" | "check" | "alert" | null // wskaźnik w prawym górnym rogu
	iconClass: string // kolor ikony
	badge: StatusVariant // wariant StatusBadge w dialogu szczegółów
	label: string
}

export const STATUS_STYLES: Record<BookingStatus, EventStatusStyle> = {
	CONFIRMED: {
		strike: false,
		dimmed: false,
		pending: false,
		icon: null,
		iconClass: "",
		badge: "confirmed",
		label: "Potwierdzona",
	},
	PENDING: {
		strike: false,
		dimmed: false,
		pending: true,
		icon: "clock",
		iconClass: "text-warning",
		badge: "pending",
		label: "Oczekuje",
	},
	CANCELLED: {
		strike: true,
		dimmed: true,
		pending: false,
		icon: null,
		iconClass: "",
		badge: "cancelled",
		label: "Anulowana",
	},
	COMPLETED: {
		strike: false,
		dimmed: false,
		pending: false,
		icon: "check",
		iconClass: "text-success",
		badge: "completed",
		label: "Zakończona",
	},
	NO_SHOW: {
		strike: false,
		dimmed: false,
		pending: false,
		icon: "alert",
		iconClass: "text-error",
		badge: "no_show",
		label: "Nieobecność",
	},
}
