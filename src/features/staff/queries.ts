import {prisma} from "@/lib/prisma"

export async function getAllStaff() {
    return prisma.staff.findMany({
        include: {
            _count: {
                select: {
                    staffServices: true,
                    workingHours: true,
                },
            },
        },
        orderBy: [
            {active: "desc"},
            {firstName: "asc"},
        ],
    })
}

export async function getStaffById(id: string) {
    return prisma.staff.findUnique({
        where: {id},
    })
}