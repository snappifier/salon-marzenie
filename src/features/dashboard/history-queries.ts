import {cache} from "react"
import {formatInTimeZone} from "date-fns-tz"
import {prisma} from "@/lib/prisma"
import {SALON_TIMEZONE} from "@/lib/date"
import {Prisma} from "@/generated/prisma/client"

export interface HistoryVisit {
	id: string
	manageToken: string
	startAt: Date
	title: string
	serviceNames: string[]
	priceGr: number
	durationMin: number
	staffName: string
}

export interface HistoryStats {
	totalCount: number
	since: Date | null
	yearCount: number
	yearDelta: number
	totalSpentGr: number
	avgPerVisitGr: number
	topService: {name: string; count: number; percent: number} | null
}

const bookingInclude = {
	items: {
		include: {
			service: {select: {name: true}},
			staff: {select: {firstName: true, lastName: true}},
		},
		orderBy: {order: "asc"},
	},
} satisfies Prisma.BookingInclude

type BookingWithItems = Prisma.BookingGetPayload<{include: typeof bookingInclude}>

function staffLabel(b: BookingWithItems): string {
	const first = b.items[0]
	if (!first) return ""
	return `${first.staff.firstName} ${first.staff.lastName.charAt(0)}.`
}

export const getCustomerHistory = cache(async (customerId: string) => {
	const now = new Date()
	const currentYear = formatInTimeZone(now, SALON_TIMEZONE, "yyyy")
	const prevYear = String(Number(currentYear) - 1)

	const [customer, completedRows, upcomingCount] = await Promise.all([
		prisma.customer.findUnique({
			where: {id: customerId},
			select: {firstName: true, lastName: true},
		}),
		prisma.booking.findMany({
			where: {customerId, status: "COMPLETED"},
			include: bookingInclude,
		}),
		prisma.booking.count({
			where: {customerId, status: "CONFIRMED", items: {some: {startAt: {gte: now}}}},
		}),
	])

	if (!customer) return null

	const visits: HistoryVisit[] = completedRows
		.filter((b) => b.items.length > 0)
		.map((b) => ({
			id: b.id,
			manageToken: b.manageToken,
			startAt: b.items[0].startAt,
			title: b.items.map((i) => i.service.name).join(" + "),
			serviceNames: b.items.map((i) => i.service.name),
			priceGr: b.items.reduce((s, i) => s + i.priceGr, 0),
			durationMin: b.items.reduce((s, i) => s + i.durationMin, 0),
			staffName: staffLabel(b),
		}))
		.sort((a, b) => b.startAt.getTime() - a.startAt.getTime())

	const totalCount = visits.length
	const totalSpentGr = visits.reduce((s, v) => s + v.priceGr, 0)
	const avgPerVisitGr = totalCount > 0 ? Math.round(totalSpentGr / totalCount) : 0

	const since =
		totalCount > 0
			? visits.reduce((min, v) => (v.startAt < min ? v.startAt : min), visits[0].startAt)
			: null

	let yearCount = 0
	let prevYearCount = 0
	for (const v of visits) {
		const year = formatInTimeZone(v.startAt, SALON_TIMEZONE, "yyyy")
		if (year === currentYear) yearCount++
		else if (year === prevYear) prevYearCount++
	}

	const tally = new Map<string, number>()
	for (const b of completedRows) {
		for (const i of b.items) {
			tally.set(i.service.name, (tally.get(i.service.name) ?? 0) + 1)
		}
	}
	let topService: HistoryStats["topService"] = null
	for (const [name, count] of tally) {
		if (!topService || count > topService.count) {
			topService = {name, count, percent: 0}
		}
	}
	if (topService && totalCount > 0) {
		topService.percent = Math.round((topService.count / totalCount) * 100)
	}

	const stats: HistoryStats = {
		totalCount,
		since,
		yearCount,
		yearDelta: yearCount - prevYearCount,
		totalSpentGr,
		avgPerVisitGr,
		topService,
	}

	return {
		customer,
		upcomingCount,
		stats,
		visits,
	}
})

export type CustomerHistory = NonNullable<Awaited<ReturnType<typeof getCustomerHistory>>>
