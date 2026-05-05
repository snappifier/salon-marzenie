import {prisma} from "@/lib/prisma"

export async function getStaffWorkingHours(staffId: string) {
    return prisma.workingHours.findMany({
        where: {staffId},
        orderBy: {dayOfWeek: "asc"},
    })
}

export async function getStaffTimeOffs(staffId: string) {
    return prisma.timeOff.findMany({
        where: {
            staffId,
            endAt: {gte: new Date()},
        },
        orderBy: {startAt: "asc"},
    })
}