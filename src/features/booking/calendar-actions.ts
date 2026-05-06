"use server"

import {auth} from "@/lib/auth"
import {getBookingsInRange} from "./calendar-queries"

async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

export interface CalendarEvent {
    id: string
    bookingId: string
    resourceId: string
    title: string
    start: string
    end: string
    backgroundColor: string
    borderColor: string
    extendedProps: {
        serviceName: string
        staffName: string
        customerName: string
        customerPhone: string
        bookingId: string
        bufferAfterMin: number
    }
}

export async function fetchCalendarEvents(startIso: string, endIso: string): Promise<CalendarEvent[]> {
    await requireAdmin()

    const items = await getBookingsInRange(new Date(startIso), new Date(endIso))

    return items.map((item) => ({
        id: item.id,
        bookingId: item.bookingId,
        resourceId: item.staffId,
        title: `${item.booking.customer.firstName} ${item.booking.customer.lastName} - ${item.service.name}`,
        start: item.startAt.toISOString(),
        end: item.endAt.toISOString(),
        backgroundColor: item.staff.color,
        borderColor: item.staff.color,
        extendedProps: {
            serviceName: item.service.name,
            staffName: `${item.staff.firstName} ${item.staff.lastName}`,
            customerName: `${item.booking.customer.firstName} ${item.booking.customer.lastName}`,
            customerPhone: item.booking.customer.phone,
            bookingId: item.bookingId,
            bufferAfterMin: item.bufferAfterMin,
        },
    }))
}