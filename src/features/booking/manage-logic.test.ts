import {describe, expect, it} from "vitest"
import {
    canCancelByPolicy,
    canCancelByStatus,
    canConfirmByPolicy,
    canConfirmByStatus,
} from "./manage-logic"

describe("canCancelByStatus", () => {
    it("PENDING — można", () => {
        expect(canCancelByStatus("PENDING")).toBe(true)
    })
    it("CONFIRMED — nie można (po potwierdzeniu wymaga kontaktu z salonem)", () => {
        expect(canCancelByStatus("CONFIRMED")).toBe(false)
    })
    it("CANCELLED — nie można", () => {
        expect(canCancelByStatus("CANCELLED")).toBe(false)
    })
    it("COMPLETED — nie można", () => {
        expect(canCancelByStatus("COMPLETED")).toBe(false)
    })
    it("NO_SHOW — nie można", () => {
        expect(canCancelByStatus("NO_SHOW")).toBe(false)
    })
})

describe("canConfirmByStatus", () => {
    it("PENDING — można", () => {
        expect(canConfirmByStatus("PENDING")).toBe(true)
    })
    it("CONFIRMED — nie można (już potwierdzona)", () => {
        expect(canConfirmByStatus("CONFIRMED")).toBe(false)
    })
    it("CANCELLED — nie można", () => {
        expect(canConfirmByStatus("CANCELLED")).toBe(false)
    })
    it("COMPLETED — nie można", () => {
        expect(canConfirmByStatus("COMPLETED")).toBe(false)
    })
    it("NO_SHOW — nie można", () => {
        expect(canConfirmByStatus("NO_SHOW")).toBe(false)
    })
})

describe("canCancelByPolicy", () => {
    const startsAt = new Date(2026, 4, 15, 14, 0) // 15 maja 14:00

    it("daleko przed deadline (50h)", () => {
        const now = new Date(2026, 4, 13, 12, 0)
        expect(canCancelByPolicy(startsAt, 24, now)).toBe(true)
    })

    it("tuż przed deadline (24h 1min)", () => {
        const now = new Date(2026, 4, 14, 13, 59)
        expect(canCancelByPolicy(startsAt, 24, now)).toBe(true)
    })

    it("dokładnie w deadline (24h przed)", () => {
        const now = new Date(2026, 4, 14, 14, 0)
        expect(canCancelByPolicy(startsAt, 24, now)).toBe(true)
    })

    it("zaraz po deadline (23h 59min przed)", () => {
        const now = new Date(2026, 4, 14, 14, 1)
        expect(canCancelByPolicy(startsAt, 24, now)).toBe(false)
    })

    it("po starcie wizyty", () => {
        const now = new Date(2026, 4, 15, 15, 0)
        expect(canCancelByPolicy(startsAt, 24, now)).toBe(false)
    })

    it("minCancelHoursBefore=0 — można do samego startu", () => {
        const justBefore = new Date(2026, 4, 15, 13, 59)
        expect(canCancelByPolicy(startsAt, 0, justBefore)).toBe(true)

        const justAfter = new Date(2026, 4, 15, 14, 1)
        expect(canCancelByPolicy(startsAt, 0, justAfter)).toBe(false)
    })

    it("minCancelHoursBefore=48 — bardziej restrykcyjne", () => {
        const oneDayBefore = new Date(2026, 4, 14, 14, 0)
        expect(canCancelByPolicy(startsAt, 48, oneDayBefore)).toBe(false) // tylko 24h przed, za późno

        const twoDaysBefore = new Date(2026, 4, 13, 14, 0)
        expect(canCancelByPolicy(startsAt, 48, twoDaysBefore)).toBe(true) // dokładnie 48h, OK
    })
})

describe("canConfirmByPolicy", () => {
    const startsAt = new Date(2026, 4, 15, 14, 0) // 15 maja 14:00

    it("daleko przed deadline (7 dni)", () => {
        const now = new Date(2026, 4, 8, 14, 0)
        expect(canConfirmByPolicy(startsAt, 72, now)).toBe(true)
    })

    it("dokładnie w deadline (72h przed)", () => {
        const now = new Date(2026, 4, 12, 14, 0)
        expect(canConfirmByPolicy(startsAt, 72, now)).toBe(true)
    })

    it("tuż przed deadline (72h 1min)", () => {
        const now = new Date(2026, 4, 12, 13, 59)
        expect(canConfirmByPolicy(startsAt, 72, now)).toBe(true)
    })

    it("zaraz po deadline (71h 59min przed)", () => {
        const now = new Date(2026, 4, 12, 14, 1)
        expect(canConfirmByPolicy(startsAt, 72, now)).toBe(false)
    })

    it("1 dzień przed — za późno", () => {
        const now = new Date(2026, 4, 14, 14, 0)
        expect(canConfirmByPolicy(startsAt, 72, now)).toBe(false)
    })

    it("po starcie wizyty — za późno", () => {
        const now = new Date(2026, 4, 15, 15, 0)
        expect(canConfirmByPolicy(startsAt, 72, now)).toBe(false)
    })
})
