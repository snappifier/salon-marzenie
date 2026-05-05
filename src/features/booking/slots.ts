import { isRangeWithinAvailability } from "@/features/availability/range-utils"
import { getStaffAvailability } from "@/features/availability/logic"
import { resolveDuration, resolveBuffer, resolvePrice } from "./logic"
import { prisma } from "@/lib/prisma"
import { minutesToUtcDate } from "@/lib/date"
import type {
    ResolvedServiceRequest,
    ServiceAssignment,
    ServiceCandidate,
    ServiceRequest,
    SlotProposal,
} from "./types"


interface FindSlotsPureInput {
    requests: ResolvedServiceRequest[]
    candidateStartTimes: Date[]
}

export function findSlotsPure(input: FindSlotsPureInput): SlotProposal[] {
    const {requests, candidateStartTimes} = input
    const results: SlotProposal[] = []

    for (const startTime of candidateStartTimes) {
        const assignments = tryAssign(requests, 0, startTime, [])
        if (assignments) {
            const last = assignments[assignments.length - 1]
            results.push({
                startAt: assignments[0].startAt,
                endAt: last.endAt,
                assignments,
            })
        }
    }
    return results
}

function tryAssign(
    requests: ResolvedServiceRequest[],
    index: number,
    currentTime: Date,
    soFar: ServiceAssignment[],
): ServiceAssignment[] | null {
    if (index >= requests.length) {
        return soFar
    }

    const request = requests[index]

    for (const candidate of request.candidates) {
        const endAt = new Date(currentTime.getTime() + candidate.durationMin * 60000)

        if (!isRangeWithinAvailability(candidate.availability, currentTime, endAt)) {
            continue
        }

        const assignment: ServiceAssignment = {
            serviceId: request.serviceId,
            staffId: candidate.staffId,
            startAt: currentTime,
            endAt,
            durationMin: candidate.durationMin,
            bufferAfterMin: candidate.bufferAfterMin,
            priceGr: candidate.priceGr,
        }

        const nextTime = new Date(endAt.getTime() + candidate.bufferAfterMin * 60000)
        const result = tryAssign(requests, index + 1, nextTime, [...soFar, assignment])

        if (result) {
            return result
        }

    }

    return null
}

export async function findSlotsForServices(
    requests: ServiceRequest[],
    date: Date,
): Promise<SlotProposal[]> {
    if (requests.length === 0) return []

    const settings = await prisma.settings.findUnique({where: {id: "settings"}})
    if (!settings) throw new Error("Settings not found - run seed first")

    const resolvedRequests: ResolvedServiceRequest[] = await Promise.all(
        requests.map((req) => resolveCandidates(req, date)),
    )

    if (resolvedRequests.some((r) => r.candidates.length === 0)) {
        return []
    }

    const candidateStartTimes = generateCandidateStartTimes(date, settings)
    return findSlotsPure({requests: resolvedRequests, candidateStartTimes})

}

async function resolveCandidates(request: ServiceRequest, date: Date): Promise<ResolvedServiceRequest> {
    let staffIds: string[]

    if (request.staffPreference === "any") {
        const assignments = await prisma.staffService.findMany({
            where: {
                serviceId: request.serviceId,
                staff: {active: true, acceptsAnyAssignment: true},
            },
            select: {staffId: true},
        })
        staffIds = assignments.map((a) => a.staffId)
    } else {
        const assignment = await prisma.staffService.findUnique({
            where: {staffId_serviceId: {staffId: request.staffPreference, serviceId: request.serviceId}},
        })
        staffIds = assignment ? [request.staffPreference] : []
    }

    const candidates: ServiceCandidate[] = await Promise.all(
        staffIds.map(async (staffId): Promise<ServiceCandidate> => {
            const [durationMin, bufferAfterMin, priceGr, availability] = await Promise.all([
                resolveDuration(request.serviceId, staffId),
                resolveBuffer(request.serviceId, staffId),
                resolvePrice(request.serviceId, staffId),
                getStaffAvailability(staffId, date),
            ])
            return { staffId, durationMin, bufferAfterMin, priceGr, availability }
        })
    )
    return { serviceId: request.serviceId, candidates }
}

function generateCandidateStartTimes(
    date: Date,
    settings: { slotIntervalMin: number; salonOpenMin: number | null; salonCloseMin: number | null },
): Date[] {
    const startMin = settings.salonOpenMin ?? 6 * 60
    const endMin = settings.salonCloseMin ?? 22 * 60
    const interval = settings.slotIntervalMin

    const times: Date[] = []
    for (let m = startMin; m < endMin; m += interval) {
        times.push(minutesToUtcDate(date, m))
    }
    return times
}