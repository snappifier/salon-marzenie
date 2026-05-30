import {prisma} from "@/lib/prisma"

export async function getSettings() {
    const settings = await prisma.settings.findUnique({
        where: {id: "settings"},
    })

    if (!settings) {
        throw new Error("Settings not found - run seed first")
    }

    return settings
}

export async function getClosedDays() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return prisma.salonClosedDay.findMany({
        where: {date: {gte: today}},
        orderBy: {date: "asc"},
    })
}