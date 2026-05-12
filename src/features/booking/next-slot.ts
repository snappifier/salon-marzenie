import {unstable_cache} from "next/cache"
import {prisma} from "@/lib/prisma"
import {getStaffAvailability} from "@/features/availability/logic"

const MIN_SLOT_MINUTES = 20

async function computeNextAvailableSlot(): Promise<Date | null> {
    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) return null

    const earliest = new Date(Date.now() + settings.minBookingHoursAhead * 60 * 60 * 1000)
    const allStaff = await prisma.staff.findMany({
        where: {active: true},
        select: {id: true},
    })
    if (allStaff.length === 0) return null

    let bestSlot: Date | null = null

    for (let i = 0; i < Math.min(settings.maxBookingDaysAhead, 30); i++) {
        const day = new Date(Date.now() + i * 24 * 60 * 60 * 1000)

        for (const staff of allStaff) {
            const ranges = await getStaffAvailability(staff.id, day)
            for (const range of ranges) {
                const candidate = range.start > earliest ? range.start : earliest
                if (candidate >= range.end) continue

                const minSlotEnd = new Date(candidate.getTime() + MIN_SLOT_MINUTES * 60000)
                if (minSlotEnd > range.end) continue

                if (!bestSlot || candidate < bestSlot) bestSlot = candidate
            }
        }

        if (bestSlot) break
    }

    return bestSlot
}

export const getNextAvailableSlot = unstable_cache(
    computeNextAvailableSlot,
    ["next-available-slot"],
    {revalidate: 300, tags: ["bookings"]},
)