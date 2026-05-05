import {prisma} from "@/lib/prisma"

export async function getAllServices() {
    return prisma.service.findMany({
        include: {category: true},
        orderBy: [
            {active: "desc"},
            {category: {order: "asc"}},
            {name: "asc"},
        ],
    })
}

export async function getServiceById(id: string) {
    return prisma.service.findUnique({
        where: {id},
        include: {category: true},
    })
}

export async function getAllCategories() {
    return prisma.category.findMany({
        where: {active: true},
        orderBy: {order: "asc"},
    })
}