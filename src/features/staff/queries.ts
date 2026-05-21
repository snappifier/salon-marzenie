import {prisma} from "@/lib/prisma"
import type {Prisma} from "@/generated/prisma/client"

export interface StaffListRow {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    color: string
    active: boolean
    serviceCount: number
    workingDays: number
}

interface StaffListOptions {
    q?: string
    filter?: "all" | "active" | "inactive"
}

export async function getAllStaff(options: StaffListOptions = {}): Promise<StaffListRow[]> {
    const q = options.q?.trim() ?? ""
    const filter = options.filter ?? "all"

    const where: Prisma.StaffWhereInput = {}
    if (q) {
        where.OR = [
            {firstName: {contains: q, mode: "insensitive"}},
            {lastName: {contains: q, mode: "insensitive"}},
            {email: {contains: q, mode: "insensitive"}},
        ]
    }
    if (filter === "active") where.active = true
    if (filter === "inactive") where.active = false

    const rows = await prisma.staff.findMany({
        where,
        include: {
            _count: {select: {staffServices: true, workingHours: true}},
        },
        orderBy: [{active: "desc"}, {firstName: "asc"}],
    })

    return rows.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        color: s.color,
        active: s.active,
        serviceCount: s._count.staffServices,
        workingDays: s._count.workingHours,
    }))
}

export async function getStaffById(id: string) {
    return prisma.staff.findUnique({
        where: {id},
    })
}

export interface StaffServiceAssignment {
    serviceId: string
    name: string
    categoryName: string
    defaultDurationMin: number
    defaultBufferAfterMin: number
    defaultPriceGr: number
    assigned: boolean
    durationOverrideMin: number | null
    bufferOverrideMin: number | null
    priceOverrideGr: number | null
}

export async function getStaffServiceAssignments(staffId: string): Promise<StaffServiceAssignment[]> {
    const [services, assignments] = await Promise.all([
        prisma.service.findMany({
            where: {active: true},
            include: {category: true},
            orderBy: [{category: {order: "asc"}}, {name: "asc"}],
        }),
        prisma.staffService.findMany({where: {staffId}}),
    ])
    const byService = new Map(assignments.map((a) => [a.serviceId, a]))
    return services.map((s) => {
        const a = byService.get(s.id)
        return {
            serviceId: s.id,
            name: s.name,
            categoryName: s.category.name,
            defaultDurationMin: s.defaultDurationMin,
            defaultBufferAfterMin: s.defaultBufferAfterMin,
            defaultPriceGr: s.defaultPriceGr,
            assigned: Boolean(a),
            durationOverrideMin: a?.durationOverrideMin ?? null,
            bufferOverrideMin: a?.bufferOverrideMin ?? null,
            priceOverrideGr: a?.priceOverrideGr ?? null,
        }
    })
}