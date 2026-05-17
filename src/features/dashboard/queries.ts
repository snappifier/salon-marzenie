import {cache} from "react"
import {startOfYear, subYears} from "date-fns"
import {prisma} from "@/lib/prisma"

export const getDashboardData = cache(async (customerId: string) => {
	const now = new Date()
	const yearStart = startOfYear(now)
	const prevYearStart = startOfYear(subYears(now, 1))

	const [customer, nextItemRow, yearCount, prevYearCount, recentBookings, topServices] = await Promise.all([
		prisma.customer.findUnique({
			where: {id: customerId},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				phone: true,
				notes: true,
				createdAt: true,
			},
		}),
		prisma.bookingItem.findFirst({
			where: {
				booking: {customerId, status: {in: ["PENDING", "CONFIRMED"]}},
				startAt: {gte: now},
			},
			orderBy: {startAt: "asc"},
			select: {bookingId: true},
		}),
		prisma.booking.count({
			where: {
				customerId,
				status: "COMPLETED",
				items: {some: {startAt: {gte: yearStart}}},
			},
		}),
		prisma.booking.count({
			where: {
				customerId,
				status: "COMPLETED",
				items: {some: {startAt: {gte: prevYearStart, lt: yearStart}}},
			},
		}),
		prisma.booking.findMany({
			where: {customerId, status: "COMPLETED"},
			include: {
				items: {
					include: {
						service: {select: {name: true}},
						staff: {select: {firstName: true, lastName: true}},
					},
					orderBy: {order: "asc"},
				},
			},
			orderBy: {createdAt: "desc"},
			take: 4,
		}),
		prisma.bookingItem.groupBy({
			by: ["serviceId"],
			where: {booking: {customerId, status: "COMPLETED"}},
			_count: {serviceId: true},
			orderBy: {_count: {serviceId: "desc"}},
			take: 3,
		}),
	])

	if (!customer) return null

	const topServiceIds = topServices.map((t) => t.serviceId)

	const [nextBookingRow, services] = await Promise.all([
		nextItemRow
			? prisma.booking.findUnique({
				where: {id: nextItemRow.bookingId},
				include: {
					items: {
						include: {
							service: {select: {name: true, description: true}},
							staff: {select: {firstName: true, lastName: true}},
						},
						orderBy: {order: "asc"},
					},
				},
			})
			: Promise.resolve(null),
		topServiceIds.length
			? prisma.service.findMany({
				where: {id: {in: topServiceIds}},
				select: {id: true, name: true, defaultDurationMin: true, defaultPriceGr: true},
			})
			: Promise.resolve([]),
	])

	const nextBooking = nextBookingRow
		? {
			id: nextBookingRow.id,
			manageToken: nextBookingRow.manageToken,
			startAt: nextBookingRow.items[0].startAt,
			endAt: nextBookingRow.items[nextBookingRow.items.length - 1].endAt,
			totalDurationMin: nextBookingRow.items.reduce((s, i) => s + i.durationMin, 0),
			totalPriceGr: nextBookingRow.items.reduce((s, i) => s + i.priceGr, 0),
			staffName: `${nextBookingRow.items[0].staff.firstName} ${nextBookingRow.items[0].staff.lastName.charAt(0)}.`,
			items: nextBookingRow.items.map((i) => ({
				id: i.id,
				serviceName: i.service.name,
				serviceDescription: i.service.description ?? null,
				priceGr: i.priceGr,
				durationMin: i.durationMin,
			})),
		}
		: null

	const serviceMap = new Map(services.map((s) => [s.id, s]))
	const favorites = topServices
		.map((t) => {
			const s = serviceMap.get(t.serviceId)
			if (!s) return null
			return {
				id: s.id,
				name: s.name,
				count: t._count.serviceId,
				priceGr: s.defaultPriceGr,
				durationMin: s.defaultDurationMin,
			}
		})
		.filter((v): v is NonNullable<typeof v> => v !== null)

	return {
		customer,
		nextBooking,
		stats: {
			yearCount,
			yearDelta: yearCount - prevYearCount,
			topServiceName: favorites[0]?.name ?? null,
			createdAt: customer.createdAt,
		},
		recentBookings: recentBookings.map((b) => ({
			id: b.id,
			startAt: b.items[0]?.startAt ?? b.createdAt,
			services: b.items.map((i) => i.service.name).join(" + "),
			priceGr: b.items.reduce((s, i) => s + i.priceGr, 0),
			staffName: b.items[0]
				? `${b.items[0].staff.firstName} ${b.items[0].staff.lastName.charAt(0)}.`
				: "",
		})),
		favorites,
	}
})

export type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>
export type DashboardNextBooking = DashboardData["nextBooking"]
export type DashboardRecentBooking = DashboardData["recentBookings"][number]
export type DashboardFavorite = DashboardData["favorites"][number]
