import {unstable_cache} from "next/cache"
import {prisma} from "@/lib/prisma"

export type StaffOption = {
    id: string
    firstName: string
    lastName: string
    acceptsAnyAssignment: boolean
}

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

    const byService: Record<string, StaffOption[]> = {}

    for (const a of assignments) {
        if (!byService[a.serviceId]) byService[a.serviceId] = []
        byService[a.serviceId].push(a.staff)
    }

    return byService
}

// Fetch staff dla WSZYSTKICH aktywnych usług w jednym query.
// SSR-friendly: na page load /rezerwacja serwer pobiera całą mapę i przekazuje
// do Wizard'a jako prop. Eliminuje client-side fetch w step 2 (instant render).
async function getAllStaffByServiceImpl(): Promise<Record<string, StaffOption[]>> {
    const assignments = await prisma.staffService.findMany({
        where: {
            service: {active: true},
            staff: {active: true},
        },
        include: {
            staff: {
                select: {id: true, firstName: true, lastName: true, acceptsAnyAssignment: true},
            },
        },
    })

    const byService: Record<string, StaffOption[]> = {}
    for (const a of assignments) {
        if (!byService[a.serviceId]) byService[a.serviceId] = []
        byService[a.serviceId].push(a.staff)
    }
    return byService
}

// Cached 5min. Inwalidacja przy admin CRUD staff/services (jeśli kiedyś dodamy taga).
// Bez explicit invalidation max stale = 5min — admin zmiany propagują z opóźnieniem,
// ale dla bookingu klienta to nie problem (staff/services rzadko się zmieniają).
export const getAllStaffByService = unstable_cache(
    getAllStaffByServiceImpl,
    ["all-staff-by-service"],
    {revalidate: 300, tags: ["staff", "services"]},
)