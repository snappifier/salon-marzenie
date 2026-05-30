// src/components/admin-calendar/calendar-format.ts
import {formatInTimeZone} from "date-fns-tz"
import {pl} from "date-fns/locale"
import {isoDayStart} from "./calendar-math"

const DAY_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"] // index = weekdayMonday0

export function polishDayShort(weekdayMon0: number): string {
	return DAY_SHORT[weekdayMon0]
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatMonthTitle(date: Date, tz: string): string {
	return capitalize(formatInTimeZone(date, tz, "LLLL yyyy", {locale: pl}))
}

export function formatDayTitle(date: Date, tz: string): string {
	return capitalize(formatInTimeZone(date, tz, "EEEE, d MMMM yyyy", {locale: pl}))
}

export function formatWeekTitle(start: Date, end: Date, tz: string): string {
	const sameMonth = formatInTimeZone(start, tz, "yyyy-MM") === formatInTimeZone(end, tz, "yyyy-MM")
	if (sameMonth) {
		const startDay = formatInTimeZone(start, tz, "d")
		return `${startDay}-${formatInTimeZone(end, tz, "d MMMM yyyy", {locale: pl})}`
	}
	const sameYear = formatInTimeZone(start, tz, "yyyy") === formatInTimeZone(end, tz, "yyyy")
	const startPart = sameYear
		? formatInTimeZone(start, tz, "d MMMM", {locale: pl})
		: formatInTimeZone(start, tz, "d MMMM yyyy", {locale: pl})
	return `${startPart} - ${formatInTimeZone(end, tz, "d MMMM yyyy", {locale: pl})}`
}

export function formatTimeRange(startIso: string, endIso: string, tz: string): string {
	return `${formatInTimeZone(new Date(startIso), tz, "HH:mm")} - ${formatInTimeZone(new Date(endIso), tz, "HH:mm")}`
}

// Nagłówek dnia w agendzie mobilnej, bez roku, np. "Wtorek, 26 maja"
export function formatAgendaDayHeading(isoDayStr: string, tz: string): string {
	return capitalize(formatInTimeZone(isoDayStart(isoDayStr, tz), tz, "EEEE, d MMMM", {locale: pl}))
}

// Krótki tytuł dnia na mobile (bez dnia tygodnia i roku), np. "26 maja"
export function formatDayTitleShort(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "d MMMM", {locale: pl})
}

// Krótki tytuł tygodnia na mobile (bez roku), np. "26-31 maja" lub "28 kwi - 4 maj"
export function formatWeekTitleShort(start: Date, end: Date, tz: string): string {
	const sameMonth = formatInTimeZone(start, tz, "yyyy-MM") === formatInTimeZone(end, tz, "yyyy-MM")
	if (sameMonth) {
		return `${formatInTimeZone(start, tz, "d")}-${formatInTimeZone(end, tz, "d MMMM", {locale: pl})}`
	}
	return `${formatInTimeZone(start, tz, "d MMM", {locale: pl})} - ${formatInTimeZone(end, tz, "d MMM", {locale: pl})}`
}
