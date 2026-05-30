// src/components/admin-calendar/calendar-math.ts
import {formatInTimeZone, fromZonedTime} from "date-fns-tz"

// Wysokosc siatki: 1 minuta = PX_PER_MINUTE pikseli (godzina = 72px)
export const PX_PER_MINUTE = 1.2

// Oddech nad pierwsza i pod ostatnia godzina, zeby siatka nie wygladala jak ucieta.
// Wszystkie pozycje (linie, eventy, now-indicator, etykiety godzin) sa o tyle przesuniete,
// a kontenery (kolumna dnia, gutter) wyzsze o 2x tyle.
export const EDGE_PAD = 16

function pad2(n: number): string {
	return String(n).padStart(2, "0")
}

// Liczba dni miedzy dwoma datami ISO (yyyy-MM-dd). UTC nie ma DST, wiec wynik jest dokladny.
function daysBetween(isoA: string, isoB: string): number {
	const [ya, ma, da] = isoA.split("-").map(Number)
	const [yb, mb, db] = isoB.split("-").map(Number)
	return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000)
}

// 0 = poniedzialek ... 6 = niedziela
export function weekdayMonday0(isoDayStr: string): number {
	const [y, m, d] = isoDayStr.split("-").map(Number)
	const sundayBased = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
	return (sundayBased + 6) % 7
}

export function addIsoDays(isoDayStr: string, days: number): string {
	const [y, m, d] = isoDayStr.split("-").map(Number)
	const dt = new Date(Date.UTC(y, m - 1, d))
	dt.setUTCDate(dt.getUTCDate() + days)
	return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`
}

// Dzien kalendarzowy (yyyy-MM-dd) danej chwili w strefie salonu
export function isoDay(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "yyyy-MM-dd")
}

// Polnoc (00:00) danego dnia w strefie salonu jako odpowiadajaca chwila UTC
export function isoDayStart(isoDayStr: string, tz: string): Date {
	return fromZonedTime(`${isoDayStr}T00:00:00`, tz)
}

// Minuty od polnocy wedlug zegara sciennego w strefie salonu
export function minutesOfDayInTz(date: Date, tz: string): number {
	const [h, m] = formatInTimeZone(date, tz, "HH:mm").split(":").map(Number)
	return h * 60 + m
}

export interface CalendarRange {
	start: Date
	end: Date
	days: string[]
}

export function dayRange(date: Date, tz: string): CalendarRange {
	const key = isoDay(date, tz)
	return {start: isoDayStart(key, tz), end: isoDayStart(addIsoDays(key, 1), tz), days: [key]}
}

export function weekRange(date: Date, tz: string): CalendarRange {
	const key = isoDay(date, tz)
	const monday = addIsoDays(key, -weekdayMonday0(key))
	const days = Array.from({length: 7}, (_, i) => addIsoDays(monday, i))
	return {start: isoDayStart(monday, tz), end: isoDayStart(addIsoDays(monday, 7), tz), days}
}

export function monthRange(date: Date, tz: string): CalendarRange {
	const key = isoDay(date, tz)
	const [y, m] = key.split("-").map(Number)
	const first = `${y}-${pad2(m)}-01`
	const lastDayNum = new Date(Date.UTC(y, m, 0)).getUTCDate()
	const last = `${y}-${pad2(m)}-${pad2(lastDayNum)}`
	const gridStart = addIsoDays(first, -weekdayMonday0(first))
	const gridEndExclusive = addIsoDays(last, (6 - weekdayMonday0(last)) + 1)
	const total = daysBetween(gridStart, gridEndExclusive)
	const days = Array.from({length: total}, (_, i) => addIsoDays(gridStart, i))
	return {start: isoDayStart(gridStart, tz), end: isoDayStart(gridEndExclusive, tz), days}
}

export interface EventBox {
	top: number
	height: number
}

export function eventPosition(
	startIso: string,
	endIso: string,
	salonOpenMin: number,
	salonCloseMin: number,
	pxPerMin: number,
	tz: string,
): EventBox {
	const startMin = minutesOfDayInTz(new Date(startIso), tz)
	let endMin = minutesOfDayInTz(new Date(endIso), tz)
	if (endMin <= startMin) endMin += 1440 // przekracza polnoc
	const gridHeight = (salonCloseMin - salonOpenMin) * pxPerMin
	const rawTop = (startMin - salonOpenMin) * pxPerMin
	const rawBottom = (endMin - salonOpenMin) * pxPerMin
	const top = Math.min(Math.max(rawTop, 0), gridHeight)
	const bottom = Math.min(Math.max(rawBottom, 0), gridHeight)
	return {top, height: Math.max(bottom - top, 0)}
}

export function snapToSlot(minutes: number, interval: number): number {
	return Math.round(minutes / interval) * interval
}

export interface OverlapItem<T> {
	item: T
	lane: number
	lanes: number
}

// Rozklada nakladajace sie eventy na pasy side-by-side.
// Sasiadujace (koniec == poczatek) nie nakladaja sie i moga wspoldzielic pas.
export function groupOverlapping<T>(
	events: T[],
	getStart: (e: T) => number,
	getEnd: (e: T) => number,
): OverlapItem<T>[] {
	const sorted = events
		.map((item, i) => ({item, i}))
		.sort((a, b) => getStart(a.item) - getStart(b.item) || getEnd(a.item) - getEnd(b.item) || a.i - b.i)

	const result: OverlapItem<T>[] = []
	let cluster: Array<{item: T; lane: number}> = []
	let laneEnds: number[] = []
	let clusterMaxEnd = -Infinity

	const flush = () => {
		const lanes = laneEnds.length
		for (const c of cluster) result.push({item: c.item, lane: c.lane, lanes})
		cluster = []
		laneEnds = []
		clusterMaxEnd = -Infinity
	}

	for (const {item} of sorted) {
		const s = getStart(item)
		const e = getEnd(item)
		if (cluster.length > 0 && s >= clusterMaxEnd) flush()
		let lane = laneEnds.findIndex((end) => end <= s)
		if (lane === -1) {
			lane = laneEnds.length
			laneEnds.push(e)
		} else {
			laneEnds[lane] = e
		}
		cluster.push({item, lane})
		clusterMaxEnd = Math.max(clusterMaxEnd, e)
	}
	if (cluster.length > 0) flush()
	return result
}
