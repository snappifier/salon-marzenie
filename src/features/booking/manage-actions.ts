"use server"

import {revalidatePath} from "next/cache"
import {prisma} from "@/lib/prisma"

export type CancelBookingResult =
    | {success: true}
    | {success: false; error: string}

export async function cancelBooking(token: string): Promise<CancelBookingResult> {
    const booking = await prisma.booking.findUnique({
        where: {manageToken: token},
        include: {items: {orderBy: {startAt: "asc"}, take: 1}},
    })

    if (!booking) {
        return {success: false, error: "Nie znaleziono rezerwacji."}
    }

    if (booking.status === "CANCELLED") {
        return {success: false, error: "Rezerwacja jest już anulowana."}
    }

    if (booking.status === "COMPLETED" || booking.status === "NO_SHOW") {
        return {success: false, error: "Nie można anulować zakończonej wizyty."}
    }

    const firstItem = booking.items[0]
    if (!firstItem) {
        return {success: false, error: "Rezerwacja nie ma zabiegów - skontaktuj się z salonem."}
    }

    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) throw new Error("Settings not found")

    const minHoursBefore = settings.minCancelHoursBefore
    const earliestCancelDeadline = new Date(firstItem.startAt.getTime() - minHoursBefore * 60 * 60 * 1000)

    if (new Date() > earliestCancelDeadline) {
        return {
            success: false,
            error: `Wizytę można anulować najpóźniej ${minHoursBefore}h przed jej rozpoczęciem. Skontaktuj się z salonem.`,
        }
    }

    await prisma.booking.update({
        where: {id: booking.id},
        data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelledBy: "CUSTOMER",
        },
    })

    revalidatePath(`/moja-wizyta/${token}`)
    return {success: true}
}