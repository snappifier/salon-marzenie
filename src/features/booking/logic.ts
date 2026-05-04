import {prisma} from "@/lib/prisma"


export async function resolveDuration(serviceId: string, staffId: string): Promise<number> {
    const [staffService, service] = await Promise.all([
        prisma.staffService.findUnique({
            where: {staffId_serviceId: {staffId, serviceId}},
        }),
        prisma.service.findUnique({where: {id: serviceId}}),
    ])

    if (!service) throw new Error(`Service ${serviceId} not found`)

    return staffService?.durationOverrideMin ?? service.defaultDurationMin
}

export async function resolveBuffer(serviceId: string, staffId: string): Promise<number> {
    const [staffService, service] = await Promise.all([
        prisma.staffService.findUnique({
            where: {staffId_serviceId: {staffId, serviceId}},
        }),
        prisma.service.findUnique({where: {id: serviceId}}),
    ])

    if (!service) throw new Error(`Service ${serviceId} not found`)

    return staffService?.bufferOverrideMin ?? service.defaultBufferAfterMin
}

export async function resolvePrice(serviceId: string, staffId: string): Promise<number> {
    const [staffService, service] = await Promise.all([
        prisma.staffService.findUnique({
            where: {staffId_serviceId: {staffId, serviceId}},
        }),
        prisma.service.findUnique({where: {id: serviceId}}),
    ])

    if (!service) throw new Error(`Service ${serviceId} not found`)

    return staffService?.priceOverrideGr ?? service.defaultPriceGr
}

export async function canStaffPerformService(staffId: string, serviceId: string): Promise<boolean> {
    const assignment = await prisma.staffService.findUnique({
        where: {staffId_serviceId: {staffId, serviceId}},
        })
    return assignment !== null
}