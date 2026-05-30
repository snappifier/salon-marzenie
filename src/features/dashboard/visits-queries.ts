import {cache} from "react"
import {subHours, subMonths} from "date-fns"
import {prisma} from "@/lib/prisma"
import {dateToIsoDay} from "@/lib/date"
import {Prisma} from "@/generated/prisma/client"

export type VisitStatus = "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED"
export type VisitCancelledBy = "CUSTOMER" | "ADMIN" | "SYSTEM"

export interface CustomerVisitSummary {
	id: string
	manageToken: string
	startAt: Date
	title: string
	totalDurationMin: number
	totalPriceGr: number
	staffName: string
	status: VisitStatus
	cancelledAt: Date | null
	cancelledBy: VisitCancelledBy | null
}

export interface CustomerVisitDetail {
	id: string
	manageToken: string
	startAt: Date
	endAt: Date
	totalDurationMin: number
	totalPriceGr: number
	staffName: string
	cancelDeadline: Date
	items: {
		id: string
		serviceName: string
		serviceDescription: string | null
		priceGr: number
	}[]
}

const bookingInclude = {
	items: {
		include: {
			service: {select: {name: true, description: true}},
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

function toSummary(b: BookingWithItems): CustomerVisitSummary {
	return {
		id: b.id,
		manageToken: b.manageToken,
		startAt: b.items[0].startAt,
		title: b.items.map((i) => i.service.name).join(" + "),
		totalDurationMin: b.items.reduce((s, i) => s + i.durationMin, 0),
		totalPriceGr: b.items.reduce((s, i) => s + i.priceGr, 0),
		staffName: staffLabel(b),
		status: b.status as VisitStatus,
		cancelledAt: b.cancelledAt,
		cancelledBy: b.cancelledBy as VisitCancelledBy | null,
	}
}

function toDetail(b: BookingWithItems, minCancelHours: number): CustomerVisitDetail {
	return {
		id: b.id,
		manageToken: b.manageToken,
		startAt: b.items[0].startAt,
		endAt: b.items[b.items.length - 1].endAt,
		totalDurationMin: b.items.reduce((s, i) => s + i.durationMin, 0),
		totalPriceGr: b.items.reduce((s, i) => s + i.priceGr, 0),
		staffName: staffLabel(b),
		cancelDeadline: subHours(b.items[0].startAt, minCancelHours),
		items: b.items.map((i) => ({
			id: i.id,
			serviceName: i.service.name,
			serviceDescription: i.service.description ?? null,
			priceGr: i.priceGr,
		})),
	}
}

function byStartAsc(a: CustomerVisitSummary, b: CustomerVisitSummary): number {
	return a.startAt.getTime() - b.startAt.getTime()
}

export const getCustomerVisits = cache(async (customerId: string) => {
	const now = new Date()
	const markerSince = subMonths(now, 3)

	const [
		customer,
		confirmedRows,
		pendingRows,
		pastRows,
		pastTotal,
		cancelledRows,
		markerItems,
		settings,
	] = await Promise.all([
		prisma.customer.findUnique({
			where: {id: customerId},
			select: {firstName: true, lastName: true},
		}),
		prisma.booking.findMany({
			where: {customerId, status: "CONFIRMED", items: {some: {startAt: {gte: now}}}},
			include: bookingInclude,
		}),
		prisma.booking.findMany({
			where: {customerId, status: "PENDING", items: {some: {startAt: {gte: now}}}},
			include: bookingInclude,
		}),
		prisma.booking.findMany({
			where: {customerId, status: "COMPLETED"},
			include: bookingInclude,
			orderBy: {createdAt: "desc"},
			take: 4,
		}),
		prisma.booking.count({where: {customerId, status: "COMPLETED"}}),
		prisma.booking.findMany({
			where: {customerId, status: "CANCELLED"},
			include: bookingInclude,
			orderBy: {cancelledAt: "desc"},
			take: 20,
		}),
		prisma.bookingItem.findMany({
			where: {
				booking: {customerId, status: {in: ["CONFIRMED", "PENDING", "COMPLETED"]}},
				startAt: {gte: markerSince},
			},
			select: {startAt: true},
		}),
		prisma.settings.findUnique({where: {id: "settings"}}),
	])

	if (!customer) return null

	const minCancelHours = settings?.minCancelHoursBefore ?? 24

	const confirmed = confirmedRows
		.filter((b) => b.items.length > 0)
		.map(toSummary)
		.sort(byStartAsc)
	const pending = pendingRows
		.filter((b) => b.items.length > 0)
		.map(toSummary)
		.sort(byStartAsc)
	const past = pastRows.filter((b) => b.items.length > 0).map(toSummary)
	const cancelled = cancelledRows.filter((b) => b.items.length > 0).map(toSummary)

	const featuredRow = confirmedRows
		.filter((b) => b.items.length > 0)
		.sort((a, b) => a.items[0].startAt.getTime() - b.items[0].startAt.getTime())[0]
	const featured = featuredRow ? toDetail(featuredRow, minCancelHours) : null
	const others = featured ? confirmed.filter((v) => v.id !== featured.id) : confirmed

	const visitDays = Array.from(new Set(markerItems.map((i) => dateToIsoDay(i.startAt))))

	return {
		customer,
		upcoming: {featured, others},
		pending,
		past: {items: past, total: pastTotal},
		cancelled,
		counts: {
			upcoming: confirmed.length,
			pending: pending.length,
			past: pastTotal,
			cancelled: cancelled.length,
		},
		calendar: {
			todayIso: dateToIsoDay(now),
			visitDays,
		},
	}
})

export type CustomerVisits = NonNullable<Awaited<ReturnType<typeof getCustomerVisits>>>
