import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import {getDay} from "date-fns";
import {DayOfWeek} from "@/generated/prisma/client";

export const SALON_TIMEZONE = "Europe/Warsaw"

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
}

export function getDayOfWeekInSalonTz(date: Date): DayOfWeek {
    const zoned = toZonedTime(date, SALON_TIMEZONE)
    return DAY_OF_WEEK_MAP[getDay(zoned)]
}

export function minutesToUtcDate(date: Date, minutesFromMidnight: number): Date {
    const zoned = toZonedTime(date, SALON_TIMEZONE)
    zoned.setHours(0, 0, 0, 0)
    zoned.setMinutes(minutesFromMidnight)
    return fromZonedTime(zoned, SALON_TIMEZONE)
}

export function formatTime(date: Date): string {
    return formatInTimeZone(date, SALON_TIMEZONE, "HH:mm")
}

export function formatDate(date: Date): string {
    return formatInTimeZone(date, SALON_TIMEZONE, "dd.MM.yyyy")
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && bStart < aEnd
}