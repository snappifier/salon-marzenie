import {afterEach, beforeEach, describe, expect, it, vi} from "vitest"
import {
    dateToIsoDay,
    formatDate,
    formatRelativeSlot,
    formatTime,
    minutesToTimeString,
    minutesToUtcDate,
    rangesOverlap,
    SALON_TIMEZONE,
    timeStringToMinutes,
} from "./date"

describe("rangesOverlap", () => {
    const d = (h: number) => new Date(2026, 4, 4, h, 0)

    it("nakładające sie zakresy", () => {
        expect(rangesOverlap(d(9), d(12), d(11), d(14))).toBe(true)
    })

    it("rozłączne zakresy", () => {
        expect(rangesOverlap(d(9), d(11), d(12), d(14))).toBe(false)
    })

    it("dotykające zakresy (a.end === b.start) - nie nakładają się", () => {
        expect(rangesOverlap(d(9), d(11), d(11), d(14))).toBe(false)
    })

    it("zakres zagnieżdżony - nakłada się", () => {
        expect(rangesOverlap(d(9), d(15), d(11), d(13))).toBe(true)
    })

    it("identyczne zakresy", () => {
        expect(rangesOverlap(d(10), d(12), d(10), d(12))).toBe(true)
    })
})

describe("minutesToTimeString", () => {
    it("formatuje minuty od północy jako HH:MM", () => {
        expect(minutesToTimeString(0)).toBe("00:00")
        expect(minutesToTimeString(60)).toBe("01:00")
        expect(minutesToTimeString(540)).toBe("09:00")
        expect(minutesToTimeString(630)).toBe("10:30")
        expect(minutesToTimeString(1439)).toBe("23:59")
    })
})

describe("timeStringToMinutes", () => {
    it("parsuje HH:MM do minut od północy", () => {
        expect(timeStringToMinutes("00:00")).toBe(0)
        expect(timeStringToMinutes("09:00")).toBe(540)
        expect(timeStringToMinutes("10:30")).toBe(630)
        expect(timeStringToMinutes("23:59")).toBe(1439)
    })

    it("jest odwrotnością minutesToTimeString", () => {
        for (const min of [0, 60, 540, 720, 1439]) {
            expect(timeStringToMinutes(minutesToTimeString(min))).toBe(min)
        }
    })
})

describe("formatTime / formatDate", () => {
    // Używamy konkretnego UTC datetime żeby uniknąć ambiguity stref
    const may4at10utc = new Date(Date.UTC(2026, 4, 4, 10, 0))

    it("formatTime formatuje godzinę w polskiej strefie", () => {
        // 10:00 UTC = 12:00 w Polsce (letni czas) lub 11:00 (zimowy)
        // May = letni czas (CEST UTC+2)
        const result = formatTime(may4at10utc)
        expect(result).toMatch(/^\d{2}:\d{2}$/)
        expect(result).toBe("12:00")
    })

    it("formatDate formatuje datę jako DD.MM.YYYY", () => {
        expect(formatDate(may4at10utc)).toBe("04.05.2026")
    })
})

describe("dateToIsoDay", () => {
    it("zwraca yyyy-MM-dd w strefie salonu", () => {
        const may4 = new Date(Date.UTC(2026, 4, 4, 10, 0))
        expect(dateToIsoDay(may4)).toBe("2026-05-04")
    })

    it("dla późnej godziny UTC w strefie polskiej może być inny dzień", () => {
        // 23:00 UTC 4 maja = 1:00 5 maja w Polsce (CEST UTC+2)
        const late = new Date(Date.UTC(2026, 4, 4, 23, 0))
        expect(dateToIsoDay(late)).toBe("2026-05-05")
    })
})

describe("minutesToUtcDate", () => {
    it("ustawia minuty od północy w lokalnej strefie salonu", () => {
        const baseDay = new Date(Date.UTC(2026, 4, 4, 10, 0))
        const result = minutesToUtcDate(baseDay, 9 * 60) // 09:00 w PL
        expect(formatTime(result)).toBe("09:00")
    })
})

describe("formatRelativeSlot", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        // 12 maja 2026, 14:00 czasu polskiego
        // CEST (UTC+2) w maju, więc UTC = 12:00
        vi.setSystemTime(new Date(Date.UTC(2026, 4, 12, 12, 0)))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("zwraca 'dzisiaj o HH:MM' dla dzisiejszego slotu", () => {
        // 12 maja 16:30 PL = 14:30 UTC
        const slot = new Date(Date.UTC(2026, 4, 12, 14, 30))
        expect(formatRelativeSlot(slot)).toBe("dzisiaj o 16:30")
    })

    it("zwraca 'jutro o HH:MM' dla jutrzejszego slotu", () => {
        const slot = new Date(Date.UTC(2026, 4, 13, 8, 0))
        expect(formatRelativeSlot(slot)).toBe("jutro o 10:00")
    })

    it("zwraca 'w {dzień} o HH:MM' dla slotu w ciągu tygodnia", () => {
        // 14 maja 2026 to czwartek
        const slot = new Date(Date.UTC(2026, 4, 14, 8, 0))
        const result = formatRelativeSlot(slot)
        expect(result).toMatch(/^w \w+ o 10:00$/)
        expect(result.toLowerCase()).toContain("czwartek")
    })

    it("zwraca pełną datę dla slotu dalej niż tydzień", () => {
        // 25 maja 2026 (13 dni naprzód)
        const slot = new Date(Date.UTC(2026, 4, 25, 8, 0))
        const result = formatRelativeSlot(slot)
        expect(result).toMatch(/^\d{1,2} \w+ o 10:00$/)
        expect(result).toContain("maja")
    })
})
