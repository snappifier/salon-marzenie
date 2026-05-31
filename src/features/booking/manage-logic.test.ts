// src/features/booking/manage-logic.test.ts
import {describe, expect, it} from "vitest"
import {canCancelByPolicy, canCancelByStatus, canConfirmByStatus, canConfirmByPolicy} from "./manage-logic"

describe("canCancelByStatus", () => {
	it("PENDING + requireConfirmation false — można", () => {
		expect(canCancelByStatus("PENDING", false)).toBe(true)
	})
	it("PENDING + requireConfirmation true — można", () => {
		expect(canCancelByStatus("PENDING", true)).toBe(true)
	})
	it("CONFIRMED + requireConfirmation false — można (current default)", () => {
		expect(canCancelByStatus("CONFIRMED", false)).toBe(true)
	})
	it("CONFIRMED + requireConfirmation true — nie można (commitment)", () => {
		expect(canCancelByStatus("CONFIRMED", true)).toBe(false)
	})
	it("CANCELLED — nie można (oba)", () => {
		expect(canCancelByStatus("CANCELLED", false)).toBe(false)
		expect(canCancelByStatus("CANCELLED", true)).toBe(false)
	})
	it("COMPLETED — nie można (oba)", () => {
		expect(canCancelByStatus("COMPLETED", false)).toBe(false)
		expect(canCancelByStatus("COMPLETED", true)).toBe(false)
	})
	it("NO_SHOW — nie można (oba)", () => {
		expect(canCancelByStatus("NO_SHOW", false)).toBe(false)
		expect(canCancelByStatus("NO_SHOW", true)).toBe(false)
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

describe("canConfirmByStatus", () => {
	it("PENDING — można potwierdzić", () => {
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

describe("canConfirmByPolicy", () => {
	const startsAt = new Date(2026, 4, 15, 14, 0) // 15 maja 14:00
	const min = 24
	const max = 168

	it("za wcześnie — 8 dni przed (poza max=168h)", () => {
		const now = new Date(2026, 4, 7, 14, 0)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("too_early")
	})
	it("dokładnie na granicy too_early (7 dni przed)", () => {
		const now = new Date(2026, 4, 8, 14, 0)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("ok")
	})
	it("sekundę przed granicą too_early", () => {
		const now = new Date(2026, 4, 8, 13, 59, 59)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("too_early")
	})
	it("w środku okna — 3 dni przed", () => {
		const now = new Date(2026, 4, 12, 14, 0)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("ok")
	})
	it("dokładnie na granicy too_late (24h przed)", () => {
		const now = new Date(2026, 4, 14, 14, 0)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("ok")
	})
	it("sekundę po granicy too_late", () => {
		const now = new Date(2026, 4, 14, 14, 0, 1)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("too_late")
	})
	it("po starcie wizyty — too_late", () => {
		const now = new Date(2026, 4, 15, 15, 0)
		expect(canConfirmByPolicy(startsAt, min, max, now)).toBe("too_late")
	})
	it("min=1h, max=24h — wąskie okno", () => {
		expect(canConfirmByPolicy(startsAt, 1, 24, new Date(2026, 4, 14, 13, 0))).toBe("too_early")
		expect(canConfirmByPolicy(startsAt, 1, 24, new Date(2026, 4, 15, 0, 0))).toBe("ok")
		expect(canConfirmByPolicy(startsAt, 1, 24, new Date(2026, 4, 15, 13, 30))).toBe("too_late")
	})
	it("min=1h, max=720h (30 dni) — szerokie okno", () => {
		expect(canConfirmByPolicy(startsAt, 1, 720, new Date(2026, 3, 14, 14, 0))).toBe("too_early") // 31 dni przed
		expect(canConfirmByPolicy(startsAt, 1, 720, new Date(2026, 3, 15, 14, 0))).toBe("ok") // dokładnie 30 dni
	})
})
