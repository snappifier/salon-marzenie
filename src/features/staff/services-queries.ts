import {prisma} from "@/lib/prisma"

export async function getStaffServices(staffId: string) {
    return prisma.staffService.findMany({
        where: {staffId},
    })
}

export async function getAllActiveServicesWithCategory() {
    return prisma.service.findMany({
        where: {active: true},
        include: {category: true},
        orderBy: [
            {category: {order: "asc"}},
            {name: "asc"},
        ],
    })
}