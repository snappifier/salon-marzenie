"use server"

import {hash} from "bcryptjs"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {dateToIsoDay, isoDayToDate} from "@/lib/date"
import {getStaffForServiceSelection} from "./public-queries"
import {findSlotsForServices} from "./slots"
import type {SlotProposal} from "./types"
import {plPhoneSchema} from "@/lib/validation";
import {revalidateTag} from "next/cache"

export async function fetchStaffForServices(serviceIds: string[]) {
    return getStaffForServiceSelection(serviceIds)
}

export interface DayWithSlotCount {
    dateIso: string
    slotsCount: number
}

export async function fetchDaysWithSlotCounts(
    requests: Array<{serviceId: string; staffPreference: string}>,
    startDateIso: string,
    daysAhead: number = 14,
): Promise<DayWithSlotCount[]> {
    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) throw new Error("Settings not found")

    const earliest = new Date(Date.now() + settings.minBookingHoursAhead * 60 * 60 * 1000)
    const startDate = isoDayToDate(startDateIso)
    const results: DayWithSlotCount[] = []

    for (let i = 0; i < daysAhead; i++) {
        const day = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const slots = await findSlotsForServices(requests, day)
        const futureSlots = slots.filter((s) => s.startAt >= earliest)

        results.push({
            dateIso: dateToIsoDay(day),
            slotsCount: futureSlots.length,
        })
    }

    return results
}

export async function fetchSlotsForDay(
    requests: Array<{serviceId: string; staffPreference: string}>,
    dateIso: string,
): Promise<SlotProposal[]> {
    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) throw new Error("Settings not found")

    const earliest = new Date(Date.now() + settings.minBookingHoursAhead * 60 * 60 * 1000)
    const day = isoDayToDate(dateIso)
    const slots = await findSlotsForServices(requests, day)

    return slots.filter((s) => s.startAt >= earliest)
}

const createBookingSchema = z.object({
    requests: z.array(z.object({
        serviceId: z.string().min(1),
        staffPreference: z.string().min(1),
    })).min(1),
    dateIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startIso: z.string().min(1),
    customer: z.object({
        firstName: z.string().trim().min(1).max(50),
        lastName: z.string().trim().min(1).max(50),
        phone: plPhoneSchema,
        email: z.string().trim().email().max(100).optional().or(z.literal("")),
        customerNote: z.string().trim().max(2000).optional().or(z.literal("")),
        marketingConsent: z.boolean(),
        createAccount: z.boolean(),
        password: z.string().optional().or(z.literal("")),
    }).refine(
        (c) => !c.createAccount || ((c.email?.length ?? 0) > 0 && (c.password?.length ?? 0) >= 8),
        {message: "Konto wymaga emaila i hasła min. 8 znaków"},
    ),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export type CreateBookingResult =
    | {success: true; bookingId: string; manageToken: string}
    | {success: false; error: string}

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
    const parsed = createBookingSchema.safeParse(input)
    if (!parsed.success) {
        return {success: false, error: "Nieprawidłowe dane formularza"}
    }

    const {requests, dateIso, startIso, customer} = parsed.data
    const desiredStart = new Date(startIso)

    const day = isoDayToDate(dateIso)
    const slots = await findSlotsForServices(requests, day)
    const matchingSlot = slots.find((s) => s.startAt.getTime() === desiredStart.getTime())

    if (!matchingSlot) {
        return {success: false, error: "Wybrany termin nie jest już dostępny. Wybierz inny."}
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            let customerRecord = await tx.customer.findUnique({
                where: {phone: customer.phone},
            })

            if (customerRecord) {
                if (customer.email && !customerRecord.email) {
                    await tx.customer.update({
                        where: {id: customerRecord.id},
                        data: {email: customer.email},
                    })
                }
            } else {
                const passwordHash = customer.createAccount && customer.password
                    ? await hash(customer.password, 10)
                    : null

                customerRecord = await tx.customer.create({
                    data: {
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        phone: customer.phone,
                        email: customer.email || null,
                        marketingConsent: customer.marketingConsent,
                        hasAccount: customer.createAccount,
                        passwordHash,
                    },
                })
            }

            for (const assignment of matchingSlot.assignments) {
                const bufferedEnd = new Date(assignment.endAt.getTime() + assignment.bufferAfterMin * 60000)
                const conflicts = await tx.bookingItem.count({
                    where: {
                        staffId: assignment.staffId,
                        startAt: {lt: bufferedEnd},
                        endAt: {gt: assignment.startAt},
                        booking: {status: {not: "CANCELLED"}},
                    },
                })

                if (conflicts > 0) {
                    throw new Error("CONFLICT")
                }
            }

            const booking = await tx.booking.create({
                data: {
                    customerId: customerRecord.id,
                    status: "PENDING",
                    customerNote: customer.customerNote || null,
                    createdByAdmin: false,
                    items: {
                        create: matchingSlot.assignments.map((a, idx) => ({
                            serviceId: a.serviceId,
                            staffId: a.staffId,
                            startAt: a.startAt,
                            endAt: a.endAt,
                            durationMin: a.durationMin,
                            bufferAfterMin: a.bufferAfterMin,
                            priceGr: a.priceGr,
                            order: idx,
                        })),
                    },
                },
            })

            return {bookingId: booking.id, manageToken: booking.manageToken}
        }, {isolationLevel: "Serializable"})
        revalidateTag("bookings", "max")
        return {success: true, ...result}
    } catch (e: unknown) {
        if (e instanceof Error && e.message === "CONFLICT") {
            return {success: false, error: "Wybrany termin został właśnie zarezerwowany przez kogoś innego. Wybierz inny."}
        }
        console.error("createBooking failed:", e)
        return {success: false, error: "Coś poszło nie tak. Spróbuj ponownie."}
    }
}