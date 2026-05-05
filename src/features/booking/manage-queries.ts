import {prisma} from "@/lib/prisma"

export async function getBookingByToken(token: string) {
    return prisma.booking.findUnique({
        where: {manageToken: token},
        include: {
            customer: true,
            items: {
                include: {service: true, staff: true},
                orderBy: {order: "asc"},
            },
        },
    })
}