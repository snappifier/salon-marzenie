import {prisma} from "@/lib/prisma"

export async function getAllCategories() {
    return prisma.category.findMany({
        include: {
            _count: {select: {services: true}},
        },
        orderBy: [
            {active: "desc"},
            {order: "asc"},
        ],
    })
}

export async function getCategoryById(id: string) {
    return prisma.category.findUnique({
        where: {id},
    })
}