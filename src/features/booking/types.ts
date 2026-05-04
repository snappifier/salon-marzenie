import type {TimeRange} from "@/features/availability/range-utils";

export interface ServiceRequest {
    serviceId: string
    staffPreference: string | "any"
}

export interface ServiceAssignment {
    serviceId: string
    staffId: string
    startAt: Date
    endAt: Date
    durationMin: number
    bufferAfterMin: number
    priceGr: number
}

export interface SlotProposal {
    startAt: Date
    endAt: Date
    assignments: ServiceAssignment[]
}

export interface ServiceCandidate {
    staffId: string
    durationMin: number
    bufferAfterMin: number
    priceGr: number
    availability: TimeRange[]
}

export interface ResolvedServiceRequest {
    serviceId: string
    candidates: ServiceCandidate[]
}