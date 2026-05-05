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

export function minutesToTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, "0")
    const m = (minutes % 60).toString().padStart(2, "0")
    return `${h}:${m}`
}

export function timeStringToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
}

export function startOfDayInSalonTz(date: Date): Date {
    const zoned = toZonedTime(date, SALON_TIMEZONE)
    zoned.setHours(0, 0, 0, 0)
    return fromZonedTime(zoned, SALON_TIMEZONE)
}

export function dateToIsoDay(date: Date): string {
    return formatInTimeZone(date, SALON_TIMEZONE, "yyyy-MM-dd")
}

export function isoDayToDate(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number)
    const zoned = new Date(y, m - 1, d, 0, 0, 0, 0)
    return fromZonedTime(zoned, SALON_TIMEZONE)
}