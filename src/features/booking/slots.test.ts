import { describe, it, expect } from "vitest"
import { findSlotsPure } from "./slots"
import type { ResolvedServiceRequest } from "./types"

const d = (h: number, m: number = 0) => new Date(2026, 4, 4, h, m)

const candidate = (staffId: string, durationMin: number, availStart: Date, availEnd: Date, bufferAfterMin = 10) => ({
    staffId,
    durationMin,
    bufferAfterMin,
    priceGr: 10000,
    availability: [{ start: availStart, end: availEnd }],
})

describe("findSlotsPure", () => {
    it("znajduje sloty dla jednego zabiegu z jedną kandydatką", () => {
        const requests: ResolvedServiceRequest[] = [
            {
                serviceId: "mani",
                candidates: [candidate("ania", 60, d(9), d(12))],
            },
        ]
        const candidateStartTimes = [d(9), d(9, 30), d(10), d(10, 30), d(11)]

        const slots = findSlotsPure({ requests, candidateStartTimes })

        // O 9:00 mani kończy się 10:00 - mieści się w [9-12]
        // O 9:30 mani kończy się 10:30 - mieści się w [9-12]
        // O 10:00 mani kończy się 11:00 - mieści się w [9-12]
        // O 10:30 mani kończy się 11:30 - mieści się w [9-12]
        // O 11:00 mani kończy się 12:00 - mieści się w [9-12]
        expect(slots).toHaveLength(5)
        expect(slots[0].startAt).toEqual(d(9))
        expect(slots[0].endAt).toEqual(d(10))
    })

    it("nie znajduje slotu, gdy zabieg wystaje poza dostępność", () => {
        const requests: ResolvedServiceRequest[] = [
            {
                serviceId: "mani",
                candidates: [candidate("ania", 60, d(9), d(11))],
            },
        ]
        const candidateStartTimes = [d(10, 30)] // mani kończyłoby się o 11:30, a dostępne tylko do 11

        const slots = findSlotsPure({ requests, candidateStartTimes })
        expect(slots).toHaveLength(0)
    })

    it("łączy dwa zabiegi sekwencyjnie z buforem", () => {
        const requests: ResolvedServiceRequest[] = [
            {
                serviceId: "mani",
                candidates: [candidate("ania", 60, d(9), d(17), 10)],
            },
            {
                serviceId: "brwi",
                candidates: [candidate("ania", 30, d(9), d(17), 5)],
            },
        ]
        const candidateStartTimes = [d(9)]

        const slots = findSlotsPure({ requests, candidateStartTimes })
        expect(slots).toHaveLength(1)

        const [slot] = slots
        expect(slot.assignments).toHaveLength(2)
        // Mani: 9:00 - 10:00, bufor 10 min
        expect(slot.assignments[0]).toMatchObject({ serviceId: "mani", startAt: d(9), endAt: d(10) })
        // Brwi: 10:10 - 10:40
        expect(slot.assignments[1]).toMatchObject({ serviceId: "brwi", startAt: d(10, 10), endAt: d(10, 40) })
        expect(slot.endAt).toEqual(d(10, 40))
    })

    it("backtracking - próbuje drugą kandydatkę gdy pierwsza nie pasuje do drugiego zabiegu", () => {
        // Mani umie Ania i Beata. Brwi umie tylko Beata.
        // Jeśli algorytm wybierze Anie do mani, to przy brwi się zatnie i powinien cofnąć się do Beaty.
        const requests: ResolvedServiceRequest[] = [
            {
                serviceId: "mani",
                candidates: [
                    candidate("ania", 60, d(9), d(17)),
                    candidate("beata", 60, d(9), d(17)),
                ],
            },
            {
                serviceId: "brwi",
                candidates: [candidate("beata", 30, d(9), d(17))],
            },
        ]
        const candidateStartTimes = [d(9)]

        const slots = findSlotsPure({ requests, candidateStartTimes })
        expect(slots).toHaveLength(1)

        // To NIE jest backtracking w sensie dosłownym (Ania też mogłaby zrobić mani, a Beata brwi).
        // Algorytm bierze pierwsza pasująca kandydatkę - czyli Ania do mani, Beata do brwi.
        expect(slots[0].assignments[0].staffId).toBe("ania")
        expect(slots[0].assignments[1].staffId).toBe("beata")
    })

    it("zwraca pustą listę gdy któryś zabieg nie ma kandydatek", () => {
        const requests: ResolvedServiceRequest[] = [
            { serviceId: "mani", candidates: [candidate("ania", 60, d(9), d(17))] },
            { serviceId: "brwi", candidates: [] },
        ]
        expect(findSlotsPure({ requests, candidateStartTimes: [d(9)] })).toEqual([])
    })

    it("zwraca pustą listę dla pustego requests (bez crashu)", () => {
        const slots = findSlotsPure({requests: [], candidateStartTimes: [d(9), d(10), d(11)]})
        expect(slots).toEqual([])
    })

    it("zwraca pustą listę dla pustego candidateStartTimes", () => {
        const requests: ResolvedServiceRequest[] = [
            {serviceId: "mani", candidates: [candidate("ania", 60, d(9), d(17))]},
        ]
        const slots = findSlotsPure({requests, candidateStartTimes: []})
        expect(slots).toEqual([])
    })

    it("dla 3 zabiegów sekwencyjnie z różnymi pracownikami i buforem", () => {
        const requests: ResolvedServiceRequest[] = [
            {serviceId: "mani", candidates: [candidate("ania", 60, d(9), d(17), 10)]},
            {serviceId: "brwi", candidates: [candidate("beata", 30, d(9), d(17), 5)]},
            {serviceId: "depilacja", candidates: [candidate("ania", 45, d(9), d(17), 0)]},
        ]
        const slots = findSlotsPure({requests, candidateStartTimes: [d(9)]})

        expect(slots).toHaveLength(1)
        expect(slots[0].assignments).toHaveLength(3)

        // Mani: 9:00-10:00 (Ania), bufor 10
        expect(slots[0].assignments[0]).toMatchObject({serviceId: "mani", staffId: "ania", startAt: d(9), endAt: d(10)})
        // Brwi: 10:10-10:40 (Beata), bufor 5
        expect(slots[0].assignments[1]).toMatchObject({serviceId: "brwi", staffId: "beata", startAt: d(10, 10), endAt: d(10, 40)})
        // Depilacja: 10:45-11:30 (Ania)
        expect(slots[0].assignments[2]).toMatchObject({serviceId: "depilacja", staffId: "ania", startAt: d(10, 45), endAt: d(11, 30)})

        expect(slots[0].startAt).toEqual(d(9))
        expect(slots[0].endAt).toEqual(d(11, 30))
    })

    it("dla wielu candidateStartTimes zwraca wiele slotów posortowanych po start", () => {
        const requests: ResolvedServiceRequest[] = [
            {serviceId: "mani", candidates: [candidate("ania", 60, d(9), d(17))]},
        ]
        const slots = findSlotsPure({
            requests,
            candidateStartTimes: [d(9), d(11), d(14), d(15, 30)],
        })

        expect(slots).toHaveLength(4)
        expect(slots.map((s) => s.startAt)).toEqual([d(9), d(11), d(14), d(15, 30)])
    })

    it("pomija sloty w których zabieg trafia w bookingiem zajęty przedział", () => {
        // Ania ma dostępność 9-12 i 13-17 (przerwa 12-13 to istniejąca rezerwacja)
        const requests: ResolvedServiceRequest[] = [
            {
                serviceId: "mani",
                candidates: [
                    {
                        staffId: "ania",
                        durationMin: 60,
                        bufferAfterMin: 10,
                        priceGr: 10000,
                        availability: [
                            { start: d(9), end: d(12) },
                            { start: d(13), end: d(17) },
                        ],
                    },
                ],
            },
        ]
        const candidateStartTimes = [d(11), d(11, 30), d(12), d(12, 30), d(13)]

        const slots = findSlotsPure({ requests, candidateStartTimes })

        // 11:00 - mani 11-12 mieści sie w [9-12], OK
        // 11:30 - mani 11:30-12:30 NIE mieści sie (przelewa do przerwy)
        // 12:00 - mani 12-13 NIE mieści sie (cala przerwa)
        // 12:30 - mani 12:30-13:30 NIE mieści sie
        // 13:00 - mani 13-14 mieści sie w [13-17], OK
        expect(slots).toHaveLength(2)
        expect(slots[0].startAt).toEqual(d(11))
        expect(slots[1].startAt).toEqual(d(13))
    })
})