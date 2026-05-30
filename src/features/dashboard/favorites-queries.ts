import {cache} from "react"
import {prisma} from "@/lib/prisma"

export interface FavoriteService {
	id: string
	category: string
	name: string
	description: string | null
	priceGr: number
	durationMin: number
	count: number
	lastVisit: Date | null
}

export interface RecommendedService {
	id: string
	category: string
	name: string
	priceGr: number
	durationMin: number
}

export const getCustomerFavorites = cache(async (customerId: string) => {
	const now = new Date()

	const [customer, grouped, upcomingCount] = await Promise.all([
		prisma.customer.findUnique({
			where: {id: customerId},
			select: {firstName: true, lastName: true},
		}),
		prisma.bookingItem.groupBy({
			by: ["serviceId"],
			where: {booking: {customerId, status: "COMPLETED"}},
			_count: {serviceId: true},
			_max: {startAt: true},
		}),
		prisma.booking.count({
			where: {customerId, status: "CONFIRMED", items: {some: {startAt: {gte: now}}}},
		}),
	])

	if (!customer) return null

	const bookedIds = grouped.map((g) => g.serviceId)

	const [services, recommendationRows] = await Promise.all([
		bookedIds.length
			? prisma.service.findMany({
					where: {id: {in: bookedIds}},
					select: {
						id: true,
						name: true,
						description: true,
						defaultPriceGr: true,
						defaultDurationMin: true,
						category: {select: {name: true}},
					},
				})
			: Promise.resolve([]),
		prisma.service.findMany({
			where: {active: true, ...(bookedIds.length ? {id: {notIn: bookedIds}} : {})},
			select: {
				id: true,
				name: true,
				defaultPriceGr: true,
				defaultDurationMin: true,
				category: {select: {name: true, order: true}},
			},
			orderBy: [{category: {order: "asc"}}, {name: "asc"}],
			take: 4,
		}),
	])

	const serviceMap = new Map(services.map((s) => [s.id, s]))

	const favorites: FavoriteService[] = grouped
		.map((g) => {
			const s = serviceMap.get(g.serviceId)
			if (!s) return null
			return {
				id: s.id,
				category: s.category.name,
				name: s.name,
				description: s.description ?? null,
				priceGr: s.defaultPriceGr,
				durationMin: s.defaultDurationMin,
				count: g._count.serviceId,
				lastVisit: g._max.startAt ?? null,
			}
		})
		.filter((v): v is FavoriteService => v !== null)
		.sort(
			(a, b) =>
				b.count - a.count ||
				(b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0),
		)

	const recommendations: RecommendedService[] = recommendationRows.map((s) => ({
		id: s.id,
		category: s.category.name,
		name: s.name,
		priceGr: s.defaultPriceGr,
		durationMin: s.defaultDurationMin,
	}))

	return {
		customer,
		upcomingCount,
		favoritesCount: favorites.length,
		hero: favorites[0] ?? null,
		others: favorites.slice(1),
		recommendations,
	}
})

export type CustomerFavorites = NonNullable<Awaited<ReturnType<typeof getCustomerFavorites>>>
