"use server"

import {hash} from "bcryptjs"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"
import {dateToIsoDay, isoDayToDate} from "@/lib/date"
import {findSlotsForServices} from "./slots"
import type {SlotProposal} from "./types"
import {createBookingSchema, type CreateBookingInput, type CreateBookingResult} from "./booking-schema"
import {revalidateTag, unstable_cache} from "next/cache"

export interface DayWithSlotCount {
    dateIso: string
    slotsCount: number
}

export interface AvailabilityResult {
    days: DayWithSlotCount[]
    slotsByDay: Record<string, SlotProposal[]>
}

async function fetchAvailabilityImpl(
    requests: Array<{serviceId: string; staffPreference: string}>,
    startDateIso: string,
    daysAhead: number,
): Promise<AvailabilityResult> {
    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) throw new Error("Settings not found")

    const earliest = new Date(Date.now() + settings.minBookingHoursAhead * 60 * 60 * 1000)
    const startDate = isoDayToDate(startDateIso)

    const perDay = await Promise.all(
        Array.from({length: daysAhead}, async (_, i) => {
            const day = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
            const allSlots = await findSlotsForServices(requests, day)
            const slots = allSlots.filter((s) => s.startAt >= earliest)
            return {dateIso: dateToIsoDay(day), slots}
        }),
    )

    const days: DayWithSlotCount[] = perDay.map((d) => ({
        dateIso: d.dateIso,
        slotsCount: d.slots.length,
    }))

    const slotsByDay: Record<string, SlotProposal[]> = {}
    for (const d of perDay) {
        slotsByDay[d.dateIso] = d.slots
    }

    return {days, slotsByDay}
}

const cachedFetchAvailability = unstable_cache(
    fetchAvailabilityImpl,
    ["fetchAvailability"],
    {revalidate: 300, tags: ["bookings"]},
)

function rehydrateSlot(slot: SlotProposal): SlotProposal {
    return {
        startAt: new Date(slot.startAt),
        endAt: new Date(slot.endAt),
        assignments: slot.assignments.map((a) => ({
            ...a,
            startAt: new Date(a.startAt),
            endAt: new Date(a.endAt),
        })),
    }
}

export async function fetchAvailability(
    requests: Array<{serviceId: string; staffPreference: string}>,
    startDateIso: string,
    daysAhead: number = 14,
): Promise<AvailabilityResult> {
    const cached = await cachedFetchAvailability(requests, startDateIso, daysAhead)
    const slotsByDay: Record<string, SlotProposal[]> = {}
    for (const dateIso in cached.slotsByDay) {
        slotsByDay[dateIso] = cached.slotsByDay[dateIso].map(rehydrateSlot)
    }
    return {days: cached.days, slotsByDay}
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

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
    const parsed = createBookingSchema.safeParse(input)
    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0]
        return {success: false, error: firstIssue?.message ?? "Nieprawidłowe dane formularza"}
    }

    const {requests, dateIso, startIso, customer} = parsed.data
    const desiredStart = new Date(startIso)

    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) throw new Error("Settings not found")

    const day = isoDayToDate(dateIso)
    const slots = await findSlotsForServices(requests, day)
    const matchingSlot = slots.find((s) => s.startAt.getTime() === desiredStart.getTime())

    if (!matchingSlot) {
        return {success: false, error: "Wybrany termin nie jest już dostępny. Wybierz inny."}
    }

    const session = await auth()
    const loggedInCustomerId = session?.user?.role === "customer" ? session.user.id : null

    try {
        const result = await prisma.$transaction(async (tx) => {
            let customerRecord = loggedInCustomerId
                ? await tx.customer.findUnique({where: {id: loggedInCustomerId}})
                : await tx.customer.findUnique({where: {phone: customer.phone}})

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
                    // Status zależny od Settings.requireConfirmation — PENDING gdy klient
                    // potwierdza przez magic link, CONFIRMED gdy salon nie wymaga (default).
                    status: settings.requireConfirmation ? "PENDING" : "CONFIRMED",
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