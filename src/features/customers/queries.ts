import {prisma} from "@/lib/prisma"

export async function getAllCustomers(search?: string) {
    return prisma.customer.findMany({
        where: search
            ? {
                OR: [
                    {firstName: {contains: search, mode: "insensitive"}},
                    {lastName: {contains: search, mode: "insensitive"}},
                    {phone: {contains: search}},
                    {email: {contains: search, mode: "insensitive"}},
                ],
            }
            : undefined,
        include: {
            _count: {select: {bookings: true}},
        },
        orderBy: [
            {active: "desc"},
            {lastName: "asc"},
            {firstName: "asc"},
        ],
        take: 100,
    })
}

export async function getCustomerById(id: string) {
    return prisma.customer.findUnique({
        where: {id},
    })
}

export async function getCustomerBookings(customerId: string) {
    return prisma.booking.findMany({
        where: {customerId},
        include: {
            items: {
                include: {
                    service: true,
                    staff: true,
                },
                orderBy: {order: "asc"},
            },
        },
        orderBy: {createdAt: "desc"},
        take: 50,
    })
}