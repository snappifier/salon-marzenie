import {prisma} from "@/lib/prisma"

export async function getActiveServicesGrouped() {
    const services = await prisma.service.findMany({
        where: {active: true},
        include: {category: true},
        orderBy: [
            {category: {order: "asc"}},
            {name: "asc"},
        ],
    })

    const grouped = new Map<string, {categoryName: string; services: typeof services}>()
    for (const service of services) {
        const existing = grouped.get(service.categoryId)
        if (existing) {
            existing.services.push(service)
        } else {
            grouped.set(service.categoryId, {
                categoryName: service.category.name,
                services: [service],
            })
        }
    }

    return Array.from(grouped.values())
}

export async function getStaffForServiceSelection(serviceIds: string[]) {
    if (serviceIds.length === 0) return {}

    const assignments = await prisma.staffService.findMany({
        where: {
            serviceId: {in: serviceIds},
            staff: {active: true},
        },
        include: {
            staff: {
                select: {id: true, firstName: true, lastName: true, acceptsAnyAssignment: true},
            },
        },
    })

    const byService: Record<string, Array<{
        id: string
        firstName: string
        lastName: string
        acceptsAnyAssignment: boolean
    }>> = {}

    for (const a of assignments) {
        if (!byService[a.serviceId]) byService[a.serviceId] = []
        byService[a.serviceId].push(a.staff)
    }

    return byService
}