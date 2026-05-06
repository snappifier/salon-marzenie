import {prisma} from "@/lib/prisma"

export async function getBookingsInRange(start: Date, end: Date) {
    return prisma.bookingItem.findMany({
        where: {
            startAt: {gte: start, lt: end},
            booking: {status: {not: "CANCELLED"}},
        },
        include: {
            service: {select: {name: true}},
            staff: {select: {id: true, firstName: true, lastName: true, color: true}},
            booking: {
                include: {
                    customer: {select: {firstName: true, lastName: true, phone: true}},
                },
            },
        },
        orderBy: {startAt: "asc"},
    })
}

export async function getActiveStaffForCalendar() {
    return prisma.staff.findMany({
        where: {active: true},
        select: {
            id: true,
            firstName: true,
            lastName: true,
            color: true,
            workingHours: {
                select: {dayOfWeek: true, startMin: true, endMin: true},
            },
            timeOffs: {
                where: {endAt: {gte: new Date()}},
                select: {id: true, startAt: true, endAt: true, reason: true},
            },
        },
        orderBy: {firstName: "asc"},
    })
}

export async function getServicesForAdminBooking() {
    const services = await prisma.service.findMany({
        where: {active: true},
        include: {category: true},
        orderBy: [{category: {order: "asc"}}, {name: "asc"}],
    })

    return services.map((s) => ({
        id: s.id,
        name: s.name,
        categoryName: s.category.name,
        defaultDurationMin: s.defaultDurationMin,
        defaultPriceGr: s.defaultPriceGr,
    }))
}

export async function getStaffByServiceMap() {
    const assignments = await prisma.staffService.findMany({
        where: {staff: {active: true}},
        include: {staff: {select: {id: true, firstName: true, lastName: true}}},
    })

    const map: Record<string, Array<{id: string; firstName: string; lastName: string}>> = {}
    for (const a of assignments) {
        if (!map[a.serviceId]) map[a.serviceId] = []
        map[a.serviceId].push(a.staff)
    }
    return map
}