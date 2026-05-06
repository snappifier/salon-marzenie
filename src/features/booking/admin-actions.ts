"use server"

import {hash} from "bcryptjs"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"
import {findSlotsForServices} from "./slots"
import {plPhoneSchema} from "@/lib/validation"
import {getStaffAvailability, isSalonClosedOnDate} from "@/features/availability/logic"
import {formatTime, getDayOfWeekInSalonTz} from "@/lib/date"


async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

export async function searchCustomers(query: string) {
    await requireAdmin()
    if (!query.trim()) return []

    return prisma.customer.findMany({
        where: {
            active: true,
            OR: [
                {firstName: {contains: query, mode: "insensitive"}},
                {lastName: {contains: query, mode: "insensitive"}},
                {phone: {contains: query}},
                {email: {contains: query, mode: "insensitive"}},
            ],
        },
        select: {id: true, firstName: true, lastName: true, phone: true},
        take: 10,
    })
}

const adminBookingSchema = z.object({
    dateIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startIso: z.string().min(1),
    requests: z.array(z.object({
        serviceId: z.string().min(1),
        staffId: z.string().min(1),
    })).min(1),
    customerId: z.string().min(1).nullable(),
    newCustomer: z.object({
        firstName: z.string().trim().min(1).max(50),
        lastName: z.string().trim().min(1).max(50),
        phone: plPhoneSchema,
        email: z.string().trim().email().max(100).optional().or(z.literal("")),
    }).nullable(),
    adminNote: z.string().trim().max(2000).optional().or(z.literal("")),
}).refine(
    (d) => d.customerId !== null || d.newCustomer !== null,
    {message: "Wybierz klienta lub utwórz nowego"},
)

export type AdminBookingInput = z.infer<typeof adminBookingSchema>

export type AdminBookingResult =
    | {success: true; bookingId: string}
    | {success: false; error: string}

export async function adminCreateBooking(input: AdminBookingInput): Promise<AdminBookingResult> {
    await requireAdmin()

    console.log("[ADMIN] raw input:", JSON.stringify(input, null, 2))

    const parsed = adminBookingSchema.safeParse(input)
    if (!parsed.success) {
        return {success: false, error: "Nieprawidłowe dane"}
    }

    const {dateIso, startIso, requests, customerId, newCustomer, adminNote} = parsed.data
    const desiredStart = new Date(startIso)

    const day = new Date(dateIso + "T00:00:00")
    const slots = await findSlotsForServices(
        requests.map((r) => ({serviceId: r.serviceId, staffPreference: r.staffId})),
        day,
    )

    console.log("[ADMIN BOOKING] Looking for:", desiredStart.toISOString())
    console.log("[ADMIN BOOKING] Available slots:", slots.map(s => s.startAt.toISOString()))
    console.log("[ADMIN BOOKING] dateIso:", dateIso, "day passed:", day.toISOString())

    const matchingSlot = slots.find((s) => s.startAt.getTime() === desiredStart.getTime())

    if (!matchingSlot) {
        if (await isSalonClosedOnDate(day)) {
            return {success: false, error: "Salon jest zamknięty tego dnia."}
        }

        for (const r of requests) {
            const staff = await prisma.staff.findUnique({
                where: {id: r.staffId},
                select: {firstName: true, lastName: true},
            })
            const name = `${staff?.firstName} ${staff?.lastName}`

            const dayOfWeek = getDayOfWeekInSalonTz(day)
            const workingHours = await prisma.workingHours.findUnique({
                where: {staffId_dayOfWeek: {staffId: r.staffId, dayOfWeek}},
            })

            if (!workingHours) {
                return {
                    success: false,
                    error: `${name} nie pracuje w ten dzień tygodnia.`,
                }
            }

            const availability = await getStaffAvailability(r.staffId, day)
            if (availability.length === 0) {
                console.log(`[DEBUG] ${name} availability empty on ${day.toISOString()}`)
                const allBookings = await prisma.bookingItem.findMany({
                    where: {
                        staffId: r.staffId,
                        booking: {status: {not: "CANCELLED"}},
                    },
                    orderBy: {startAt: "asc"},
                })
                console.log(`[DEBUG] All bookings for ${name}:`)
                allBookings.forEach((b) =>
                    console.log(`  - ${b.startAt.toISOString()} to ${b.endAt.toISOString()}, buffer: ${b.bufferAfterMin}min, bookingId: ${b.bookingId}`),
                )

                const allTimeOffs = await prisma.timeOff.findMany({
                    where: {staffId: r.staffId},
                })
                console.log(`[DEBUG] All timeoffs for ${name}:`)
                allTimeOffs.forEach((t) =>
                    console.log(`  - ${t.startAt.toISOString()} to ${t.endAt.toISOString()}: ${t.reason}`),
                )

                return {
                    success: false,
                    error: `${name} ma cały dzień zajęty (wszystkie sloty zarezerwowane lub urlop).`,
                }
            }
        }

        if (slots.length > 0) {
            const examples = slots.slice(0, 3).map((s) => formatTime(s.startAt)).join(", ")
            return {
                success: false,
                error: `Wybrana godzina nie pasuje. Wolne tego dnia: ${examples}...`,
            }
        }

        return {success: false, error: "Brak wolnych terminów na ten dzień dla tej kombinacji."}
    }

    const MAX_ITEM_DURATION_MS = 10 * 60 * 60 * 1000
    for (const a of matchingSlot.assignments) {
        const duration = a.endAt.getTime() - a.startAt.getTime()
        if (duration > MAX_ITEM_DURATION_MS) {
            console.error("Suspicious booking duration:", duration, "for", a.serviceId)
            return {success: false, error: "Nieprawidłowy czas trwania zabiegu - skontaktuj się z administratorem."}
        }
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            let resolvedCustomerId: string

            if (customerId) {
                const existing = await tx.customer.findUnique({where: {id: customerId}})
                if (!existing) throw new Error("CUSTOMER_NOT_FOUND")
                resolvedCustomerId = existing.id
            } else if (newCustomer) {
                const existingByPhone = await tx.customer.findUnique({where: {phone: newCustomer.phone}})
                if (existingByPhone) {
                    resolvedCustomerId = existingByPhone.id
                } else {
                    const created = await tx.customer.create({
                        data: {
                            firstName: newCustomer.firstName,
                            lastName: newCustomer.lastName,
                            phone: newCustomer.phone,
                            email: newCustomer.email || null,
                        },
                    })
                    resolvedCustomerId = created.id
                }
            } else {
                throw new Error("NO_CUSTOMER")
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
                if (conflicts > 0) throw new Error("CONFLICT")
            }

            const booking = await tx.booking.create({
                data: {
                    customerId: resolvedCustomerId,
                    status: "CONFIRMED",
                    adminNote: adminNote || null,
                    createdByAdmin: true,
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

            return {bookingId: booking.id}
        }, {isolationLevel: "Serializable"})

        return {success: true, ...result}
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message === "CONFLICT") {
                return {success: false, error: "Termin został właśnie zarezerwowany. Odśwież i spróbuj ponownie."}
            }
            if (e.message === "CUSTOMER_NOT_FOUND") {
                return {success: false, error: "Klient nie istnieje."}
            }
        }
        console.error("adminCreateBooking failed:", e)
        return {success: false, error: "Coś poszło nie tak."}
    }
}