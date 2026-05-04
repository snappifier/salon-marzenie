import {prisma} from "@/lib/prisma"
import Holidays from "date-holidays"
import {getDayOfWeekInSalonTz, minutesToUtcDate, SALON_TIMEZONE} from "@/lib/date";
import {toZonedTime} from "date-fns-tz";
import {subtractRange, type TimeRange} from "./range-utils"

export type {TimeRange} from "./range-utils"

const polishHolidays = new Holidays("PL")


export async function getStaffAvailability(staffId: string, date: Date): Promise<TimeRange[]> {
    const closed = await isSalonClosedOnDate(date)
    if(closed) return []

    const dayOfWeek = getDayOfWeekInSalonTz(date)
    const workingHours = await prisma.workingHours.findUnique({
        where: {staffId_dayOfWeek: {staffId, dayOfWeek}},
    })

    if (!workingHours) return []

    const workStart = minutesToUtcDate(date, workingHours.startMin)
    const workEnd = minutesToUtcDate(date, workingHours.endMin)

    let availableRanges: TimeRange[] = [{start: workStart, end: workEnd}]

    const timeOffs = await prisma.timeOff.findMany({
        where: {
            staffId,
            startAt: {lt: workEnd},
            endAt: {gt: workStart},
        },
    })

    for (const off of timeOffs) {
        availableRanges = subtractRange(availableRanges, off.startAt, off.endAt)
    }

    const bookingItems = await prisma.bookingItem.findMany({
        where: {
            staffId,
            startAt: {lt: workEnd},
            endAt: {gt: workStart},
            booking: {status: {not: "CANCELLED"}},
        },
    })

    for (const item of bookingItems) {
        const bufferedEnd = new Date(item.endAt.getTime() + item.bufferAfterMin * 60000)
        availableRanges = subtractRange(availableRanges, item.startAt, bufferedEnd)
    }

    return availableRanges
}

export async function isSalonClosedOnDate(date: Date): Promise<boolean> {
    const zonedDate = toZonedTime(date, SALON_TIMEZONE)
    const dateOnly = new Date(zonedDate.getFullYear(), zonedDate.getMonth(), zonedDate.getDate())

    const closedDay = await prisma.salonClosedDay.findFirst({
        where: {
            date: {
                gte: dateOnly,
                lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
            },
        },
    })

    if (closedDay) return true

    const holiday = polishHolidays.isHoliday(zonedDate)
    if (holiday && Array.isArray(holiday)) {
        return holiday.some((h) => h.type === "public")
    }

    return false

}