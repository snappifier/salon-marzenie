import {describe, it, expect} from 'vitest'
import {subtractRange, type TimeRange} from "@/features/availability/range-utils";
import {isRangeWithinAvailability} from "@/features/availability/range-utils";

const d = (h: number, m: number = 0) => new Date(2026, 4, 4, h, m)

describe("subtractRange", () => {
    it("zwraca pustą listę, gdy lista wejściowa jest pusta", () => {
        const result = subtractRange([], d(10), d(11))
        expect(result).toEqual([])
    })

    it("zostawia przedział nietknięty, gdy cut jest poza nim", () => {
        const ranges: TimeRange[] = [{start: d(10), end: d(12)}]
        const result = subtractRange(ranges, d(15), d(16))
        expect(result).toEqual(ranges)
    })

    it("usuwa przedział w całości, gdy cut go pochłania", () => {
        const ranges: TimeRange[] = [{start: d(10), end: d(12)}]
        const result = subtractRange(ranges, d(9), d(13))
        expect(result).toEqual([])
    })

    it("przycina lewą stronę przedziału", () => {
        const ranges: TimeRange[] = [{ start: d(10), end: d(12) }]
        const result = subtractRange(ranges, d(9), d(11))
        expect(result).toEqual([{ start: d(11), end: d(12) }])
    })

    it("przycina prawą stronę przedziału", () => {
        const ranges: TimeRange[] = [{ start: d(10), end: d(12) }]
        const result = subtractRange(ranges, d(11), d(13))
        expect(result).toEqual([{ start: d(10), end: d(11) }])
    })

    it("dzieli przedział na dwa, gdy cut jest wewnątrz", () => {
        const ranges: TimeRange[] = [{ start: d(10), end: d(14) }]
        const result = subtractRange(ranges, d(11), d(12))
        expect(result).toEqual([
            { start: d(10), end: d(11) },
            { start: d(12), end: d(14) },
        ])
    })

    it("obsługuje wiele przedziałów", () => {
        const ranges: TimeRange[] = [
            { start: d(9), end: d(11) },
            { start: d(13), end: d(15) },
        ]
        const result = subtractRange(ranges, d(10), d(14))
        expect(result).toEqual([
            { start: d(9), end: d(10) },
            { start: d(14), end: d(15) },
        ])
    })

    it("zostawia oba przedziały, gdy cut jest miedzy nimi", () => {
        const ranges: TimeRange[] = [
            { start: d(9), end: d(11) },
            { start: d(13), end: d(15) },
        ]
        const result = subtractRange(ranges, d(11, 30), d(12, 30))
        expect(result).toEqual(ranges)
    })

    it("granica zamknięta - cut kończący sie w punkcie startu nie usuwa nic", () => {
        const ranges: TimeRange[] = [{ start: d(10), end: d(12) }]
        const result = subtractRange(ranges, d(9), d(10))
        expect(result).toEqual(ranges)
    })

    it("granica zamknięta - cut zaczynający sie w punkcie końca nie usuwa nic", () => {
        const ranges: TimeRange[] = [{ start: d(10), end: d(12) }]
        const result = subtractRange(ranges, d(12), d(13))
        expect(result).toEqual(ranges)
    })
})

describe("isRangeWithinAvailibility", () => {
    it("zwraca true gdy zakres mieści się w jednym z przedziałów", () => {
        const avail: TimeRange[] = [{ start: d(9), end: d(17) }]
        expect(isRangeWithinAvailability(avail, d(10), d(11))).toBe(true)
    })

    it("zwraca false gdy zakres wystaje poza przedział", () => {
        const avail: TimeRange[] = [{ start: d(9), end: d(17) }]
        expect(isRangeWithinAvailability(avail, d(16), d(18))).toBe(false)
    })

    it("zwraca false gdy zakres trafia w lukę między przedziałami", () => {
        const avail: TimeRange[] = [
            {start: d(9), end: d(11)},
            {start: d(13), end: d(17)},
        ]
        expect(isRangeWithinAvailability(avail, d(11), d(13))).toBe(false)
    })

    it("zwraca false dla pustej dostępności", () => {
        expect(isRangeWithinAvailability([], d(10), d(11))).toBe(false)
    })

    it("zwraca true dla zakresu pasującego dokładnie do przedziału", () => {
        const avail: TimeRange[] = [{ start: d(9), end: d(17) }]
        expect(isRangeWithinAvailability(avail, d(9), d(17))).toBe(true)
    })
})