// src/components/admin-calendar/calendar-math.test.ts
import {describe, expect, it} from "vitest"
import {formatInTimeZone} from "date-fns-tz"
import {
	addIsoDays,
	dayRange,
	eventPosition,
	groupOverlapping,
	isoDay,
	isoDayStart,
	minutesOfDayInTz,
	monthRange,
	snapToSlot,
	weekRange,
	weekdayMonday0,
} from "./calendar-math"

const TZ = "Europe/Warsaw"

describe("minutesOfDayInTz", () => {
	it("lato (UTC+2): 07:00Z to 09:00 w salonie -> 540", () => {
		expect(minutesOfDayInTz(new Date("2026-05-20T07:00:00Z"), TZ)).toBe(540)
	})
	it("zima (UTC+1): 08:00Z to 09:00 w salonie -> 540", () => {
		expect(minutesOfDayInTz(new Date("2026-01-20T08:00:00Z"), TZ)).toBe(540)
	})
	it("wieczor: 20:30Z lato -> 22:30 -> 1350", () => {
		expect(minutesOfDayInTz(new Date("2026-05-20T20:30:00Z"), TZ)).toBe(1350)
	})
})

describe("snapToSlot", () => {
	it("zaokragla w dol", () => {
		expect(snapToSlot(37, 15)).toBe(30)
	})
	it("zaokragla w gore", () => {
		expect(snapToSlot(38, 15)).toBe(45)
	})
	it("zero zostaje zerem", () => {
		expect(snapToSlot(0, 15)).toBe(0)
	})
	it("dokladny wielokrotnik", () => {
		expect(snapToSlot(45, 15)).toBe(45)
	})
})

describe("eventPosition", () => {
	const open = 540 // 09:00
	const close = 1320 // 22:00
	const px = 1

	it("wizyta 09:00-10:00 -> top 0, height 60", () => {
		const box = eventPosition("2026-05-20T07:00:00Z", "2026-05-20T08:00:00Z", open, close, px, TZ)
		expect(box).toEqual({top: 0, height: 60})
	})

	it("wizyta calkowicie przed otwarciem -> top 0, height 0", () => {
		const box = eventPosition("2026-05-20T04:00:00Z", "2026-05-20T04:30:00Z", open, close, px, TZ)
		expect(box).toEqual({top: 0, height: 0})
	})

	it("wizyta calkowicie po zamknieciu -> top na dole, height 0", () => {
		const box = eventPosition("2026-05-20T20:30:00Z", "2026-05-20T21:00:00Z", open, close, px, TZ)
		expect(box.height).toBe(0)
		expect(box.top).toBe((close - open) * px)
	})

	it("wizyta wystajaca poza zamkniecie jest przycieta", () => {
		// 21:30 -> 22:30 (1290 -> 1350), close 1320 => widoczne 30 min
		const box = eventPosition("2026-05-20T19:30:00Z", "2026-05-20T20:30:00Z", open, close, px, TZ)
		expect(box.height).toBe(30)
	})

	it("wizyta przekraczajaca polnoc pokazuje czesc do konca siatki", () => {
		// 23:30 -> 00:30, grid 0-1440 (do polnocy): widoczne tylko 30 min przed polnoca
		const box = eventPosition("2026-05-20T21:30:00Z", "2026-05-20T22:30:00Z", 0, 1440, 1, TZ)
		expect(box.top).toBe(1410)
		expect(box.height).toBe(30)
	})
})

describe("weekdayMonday0", () => {
	it("poniedzialek -> 0", () => {
		expect(weekdayMonday0("2026-05-18")).toBe(0)
	})
	it("niedziela -> 6", () => {
		expect(weekdayMonday0("2026-05-24")).toBe(6)
	})
})

describe("addIsoDays", () => {
	it("przekroczenie miesiaca w przod", () => {
		expect(addIsoDays("2026-05-31", 1)).toBe("2026-06-01")
	})
	it("przekroczenie roku w tyl", () => {
		expect(addIsoDays("2026-01-01", -1)).toBe("2025-12-31")
	})
})

describe("isoDay / isoDayStart", () => {
	it("isoDay konwertuje UTC do dnia w salon TZ", () => {
		// 22:30Z 19 maja = 00:30 20 maja w Warszawie (lato)
		expect(isoDay(new Date("2026-05-19T22:30:00Z"), TZ)).toBe("2026-05-20")
	})
	it("isoDayStart to polnoc danego dnia w salon TZ", () => {
		expect(formatInTimeZone(isoDayStart("2026-05-18", TZ), TZ, "yyyy-MM-dd HH:mm")).toBe("2026-05-18 00:00")
	})
	it("isoDayStart radzi sobie z przejsciem DST (29 marca)", () => {
		expect(formatInTimeZone(isoDayStart("2026-03-29", TZ), TZ, "yyyy-MM-dd HH:mm")).toBe("2026-03-29 00:00")
	})
})

describe("dayRange", () => {
	it("obejmuje jeden dzien", () => {
		const r = dayRange(new Date("2026-05-20T12:00:00Z"), TZ)
		expect(r.days).toEqual(["2026-05-20"])
		expect(formatInTimeZone(r.start, TZ, "yyyy-MM-dd HH:mm")).toBe("2026-05-20 00:00")
		expect(formatInTimeZone(r.end, TZ, "yyyy-MM-dd HH:mm")).toBe("2026-05-21 00:00")
	})
})

describe("weekRange", () => {
	it("tydzien od poniedzialku do niedzieli", () => {
		const r = weekRange(new Date("2026-05-20T12:00:00Z"), TZ) // sroda
		expect(r.days).toEqual([
			"2026-05-18",
			"2026-05-19",
			"2026-05-20",
			"2026-05-21",
			"2026-05-22",
			"2026-05-23",
			"2026-05-24",
		])
		expect(formatInTimeZone(r.start, TZ, "yyyy-MM-dd HH:mm")).toBe("2026-05-18 00:00")
		expect(formatInTimeZone(r.end, TZ, "yyyy-MM-dd HH:mm")).toBe("2026-05-25 00:00")
	})
})

describe("monthRange", () => {
	it("siatka pelnych tygodni obejmujaca caly maj", () => {
		const r = monthRange(new Date("2026-05-10T12:00:00Z"), TZ)
		expect(r.days.length % 7).toBe(0)
		expect(weekdayMonday0(r.days[0])).toBe(0)
		expect(r.days).toContain("2026-05-01")
		expect(r.days).toContain("2026-05-31")
		// pierwszy dzien siatki nie jest pozniejszy niz 1 maja
		expect(r.days[0] <= "2026-05-01").toBe(true)
	})
})

describe("groupOverlapping", () => {
	const start = (e: {s: number; e: number}) => e.s
	const end = (e: {s: number; e: number}) => e.e

	it("dwa nakladajace -> 2 pasy", () => {
		const out = groupOverlapping([{s: 0, e: 60}, {s: 30, e: 90}], start, end)
		expect(out.map((o) => o.lanes)).toEqual([2, 2])
		expect(out.map((o) => o.lane).sort()).toEqual([0, 1])
	})

	it("nie nakladajace -> oddzielne pasy (lanes 1)", () => {
		const out = groupOverlapping([{s: 0, e: 60}, {s: 60, e: 120}], start, end)
		expect(out.every((o) => o.lanes === 1)).toBe(true)
		expect(out.every((o) => o.lane === 0)).toBe(true)
	})

	it("trzy w jednym klastrze, reuse pasa", () => {
		const out = groupOverlapping([{s: 0, e: 60}, {s: 10, e: 20}, {s: 30, e: 90}], start, end)
		expect(out.every((o) => o.lanes === 2)).toBe(true)
	})

	it("pusta lista", () => {
		expect(groupOverlapping([], start, end)).toEqual([])
	})
})
