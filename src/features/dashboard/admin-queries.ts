// src/features/dashboard/admin-queries.ts
import {cache} from "react"
import {addDays, startOfWeek, endOfWeek} from "date-fns"
import {toZonedTime, fromZonedTime} from "date-fns-tz"
import {prisma} from "@/lib/prisma"
import {SALON_TIMEZONE} from "@/lib/date"
import {BookingStatus} from "@/generated/prisma/client"

export interface DailyStats {
	date: string
	count: number
	revenue: number
}

export interface UpcomingBooking {
	id: string
	startAt: Date
	customerName: string
	customerId: string
	serviceNames: string
	staffName: string
	status: BookingStatus
}

export interface NewBookingItem {
	id: string
	startAt: Date
	customerName: string
	customerId: string
	serviceNames: string
	createdAt: Date
}

export interface AdminDashboardData {
	today: {
		total: number
		byStatus: {confirmed: number; pending: number; cancelled: number}
		revenue: number
	}
	tomorrow: {total: number}
	thisWeek: {
		total: number
		revenue: number
		daily: DailyStats[]
	}
	upcomingBookings: UpcomingBooking[]
	newBookings: NewBookingItem[]
	weekHeatmap: number[][]
}

const HEATMAP_START_HOUR = 9
const HEATMAP_END_HOUR = 20

function startOfDaySalonTz(date: Date): Date {
	const zoned = toZonedTime(date, SALON_TIMEZONE)
	zoned.setHours(0, 0, 0, 0)
	return fromZonedTime(zoned, SALON_TIMEZONE)
}

function isoDayInSalonTz(date: Date): string {
	const zoned = toZonedTime(date, SALON_TIMEZONE)
	const y = zoned.getFullYear()
	const m = String(zoned.getMonth() + 1).padStart(2, "0")
	const d = String(zoned.getDate()).padStart(2, "0")
	return `${y}-${m}-${d}`
}

function getHourInSalonTz(date: Date): number {
	return toZonedTime(date, SALON_TIMEZONE).getHours()
}

function getDayIndexFromMonday(date: Date, weekStart: Date): number {
	const zoned = toZonedTime(date, SALON_TIMEZONE)
	const startZoned = toZonedTime(weekStart, SALON_TIMEZONE)
	const startMs = Date.UTC(startZoned.getFullYear(), startZoned.getMonth(), startZoned.getDate())
	const cellMs = Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate())
	return Math.round((cellMs - startMs) / (24 * 60 * 60 * 1000))
}

function formatNameFromBooking(firstName: string, lastName: string): string {
	return `${firstName} ${lastName}`.trim()
}

function joinServices(names: string[]): string {
	if (names.length === 0) return "—"
	if (names.length <= 2) return names.join(" + ")
	return `${names.slice(0, 2).join(" + ")} +${names.length - 2}`
}

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
	const now = new Date()
	const todayStart = startOfDaySalonTz(now)
	const tomorrowStart = addDays(todayStart, 1)
	const dayAfterTomorrow = addDays(todayStart, 2)

	const zonedNow = toZonedTime(now, SALON_TIMEZONE)
	const weekStartZoned = startOfWeek(zonedNow, {weekStartsOn: 1})
	const weekEndZoned = endOfWeek(zonedNow, {weekStartsOn: 1})
	const weekStart = fromZonedTime(
		new Date(weekStartZoned.getFullYear(), weekStartZoned.getMonth(), weekStartZoned.getDate(), 0, 0, 0, 0),
		SALON_TIMEZONE,
	)
	const weekEnd = fromZonedTime(
		new Date(weekEndZoned.getFullYear(), weekEndZoned.getMonth(), weekEndZoned.getDate(), 23, 59, 59, 999),
		SALON_TIMEZONE,
	)

	const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

	const [todayItems, tomorrowItems, weekItems, upcomingRaw, newBookingsRaw] = await Promise.all([
		prisma.bookingItem.findMany({
			where: {startAt: {gte: todayStart, lt: tomorrowStart}},
			include: {booking: {select: {status: true}}},
		}),
		prisma.bookingItem.findMany({
			where: {startAt: {gte: tomorrowStart, lt: dayAfterTomorrow}},
			include: {booking: {select: {status: true}}},
		}),
		prisma.bookingItem.findMany({
			where: {startAt: {gte: weekStart, lte: weekEnd}},
			include: {booking: {select: {status: true}}},
		}),
		prisma.booking.findMany({
			where: {
				status: {in: ["CONFIRMED", "PENDING"]},
				items: {some: {startAt: {gte: now}}},
			},
			include: {
				customer: {select: {id: true, firstName: true, lastName: true}},
				items: {
					orderBy: {order: "asc"},
					include: {
						service: {select: {name: true}},
						staff: {select: {firstName: true, lastName: true}},
					},
				},
			},
			orderBy: {createdAt: "asc"},
			take: 50,
		}),
		prisma.booking.findMany({
			where: {createdAt: {gte: last24h}},
			include: {
				customer: {select: {id: true, firstName: true, lastName: true}},
				items: {
					orderBy: {order: "asc"},
					include: {service: {select: {name: true}}},
				},
			},
			orderBy: {createdAt: "desc"},
			take: 8,
		}),
	])

	const todayBookingIds = new Set<string>()
	const todayByStatus = {confirmed: 0, pending: 0, cancelled: 0}
	let todayRevenue = 0
	for (const item of todayItems) {
		if (!todayBookingIds.has(item.bookingId)) {
			todayBookingIds.add(item.bookingId)
			if (item.booking.status === "CONFIRMED") todayByStatus.confirmed += 1
			else if (item.booking.status === "PENDING") todayByStatus.pending += 1
			else if (item.booking.status === "CANCELLED") todayByStatus.cancelled += 1
		}
		if (item.booking.status === "CONFIRMED" || item.booking.status === "COMPLETED") {
			todayRevenue += item.priceGr
		}
	}

	const tomorrowBookingIds = new Set<string>()
	for (const item of tomorrowItems) {
		tomorrowBookingIds.add(item.bookingId)
	}

	const weekBookingIds = new Set<string>()
	let weekRevenue = 0
	const dailyByIso = new Map<string, {count: Set<string>; revenue: number}>()
	const heatmap: number[][] = Array.from({length: 7}, () =>
		Array.from({length: HEATMAP_END_HOUR - HEATMAP_START_HOUR + 1}, () => 0),
	)
	for (const item of weekItems) {
		weekBookingIds.add(item.bookingId)
		if (item.booking.status === "CONFIRMED" || item.booking.status === "COMPLETED") {
			weekRevenue += item.priceGr
		}
		const iso = isoDayInSalonTz(item.startAt)
		const bucket = dailyByIso.get(iso) ?? {count: new Set<string>(), revenue: 0}
		bucket.count.add(item.bookingId)
		if (item.booking.status === "CONFIRMED" || item.booking.status === "COMPLETED") {
			bucket.revenue += item.priceGr
		}
		dailyByIso.set(iso, bucket)

		if (item.booking.status !== "CANCELLED") {
			const dayIdx = getDayIndexFromMonday(item.startAt, weekStart)
			const hour = getHourInSalonTz(item.startAt)
			if (dayIdx >= 0 && dayIdx < 7 && hour >= HEATMAP_START_HOUR && hour <= HEATMAP_END_HOUR) {
				heatmap[dayIdx][hour - HEATMAP_START_HOUR] += 1
			}
		}
	}

	const daily: DailyStats[] = []
	for (let i = 0; i < 7; i++) {
		const day = addDays(weekStart, i)
		const iso = isoDayInSalonTz(day)
		const bucket = dailyByIso.get(iso)
		daily.push({
			date: iso,
			count: bucket?.count.size ?? 0,
			revenue: bucket?.revenue ?? 0,
		})
	}

	const upcomingBookings: UpcomingBooking[] = []
	const seenBooking = new Set<string>()
	for (const booking of upcomingRaw) {
		if (seenBooking.has(booking.id)) continue
		const futureItems = booking.items.filter((i) => i.startAt >= now)
		if (futureItems.length === 0) continue
		const first = futureItems[0]
		seenBooking.add(booking.id)
		upcomingBookings.push({
			id: booking.id,
			startAt: first.startAt,
			customerName: formatNameFromBooking(booking.customer.firstName, booking.customer.lastName),
			customerId: booking.customer.id,
			serviceNames: joinServices(booking.items.map((i) => i.service.name)),
			staffName: formatNameFromBooking(first.staff.firstName, first.staff.lastName),
			status: booking.status,
		})
		if (upcomingBookings.length >= 5) break
	}
	upcomingBookings.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

	const newBookings: NewBookingItem[] = newBookingsRaw.slice(0, 5).map((b) => {
		const first = b.items[0]
		return {
			id: b.id,
			startAt: first?.startAt ?? b.createdAt,
			customerName: formatNameFromBooking(b.customer.firstName, b.customer.lastName),
			customerId: b.customer.id,
			serviceNames: joinServices(b.items.map((i) => i.service.name)),
			createdAt: b.createdAt,
		}
	})

	return {
		today: {
			total: todayBookingIds.size,
			byStatus: todayByStatus,
			revenue: todayRevenue,
		},
		tomorrow: {total: tomorrowBookingIds.size},
		thisWeek: {
			total: weekBookingIds.size,
			revenue: weekRevenue,
			daily,
		},
		upcomingBookings,
		newBookings,
		weekHeatmap: heatmap,
	}
})

export function getHeatmapHours(): number[] {
	const hours: number[] = []
	for (let h = HEATMAP_START_HOUR; h <= HEATMAP_END_HOUR; h++) hours.push(h)
	return hours
}

export function getWeekDayLabels(): {short: string; long: string}[] {
	return [
		{short: "Pn", long: "Poniedziałek"},
		{short: "Wt", long: "Wtorek"},
		{short: "Śr", long: "Środa"},
		{short: "Cz", long: "Czwartek"},
		{short: "Pt", long: "Piątek"},
		{short: "Sb", long: "Sobota"},
		{short: "Nd", long: "Niedziela"},
	]
}

export function getWeekDates(): {iso: string; dayNum: number}[] {
	const now = new Date()
	const zonedNow = toZonedTime(now, SALON_TIMEZONE)
	const weekStartZoned = startOfWeek(zonedNow, {weekStartsOn: 1})
	const result: {iso: string; dayNum: number}[] = []
	for (let i = 0; i < 7; i++) {
		const day = new Date(weekStartZoned)
		day.setDate(weekStartZoned.getDate() + i)
		const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
		result.push({iso, dayNum: day.getDate()})
	}
	return result
}
