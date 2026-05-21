// src/features/customers/queries.ts
import {prisma} from "@/lib/prisma"
import type {Prisma} from "@/generated/prisma/client"

export type CustomerFilter = "all" | "active" | "inactive"
export type CustomerSort = "newest" | "alpha" | "frequent"

interface ListOptions {
	q?: string
	filter?: CustomerFilter
	sort?: CustomerSort
	page?: number
	perPage?: number
}

export interface CustomerListRow {
	id: string
	firstName: string
	lastName: string
	phone: string
	email: string | null
	notes: string | null
	marketingConsent: boolean
	hasAccount: boolean
	active: boolean
	createdAt: Date
	bookingCount: number
	lastVisitAt: Date | null
}

const DEFAULT_PER_PAGE = 25

export async function getAllCustomers(options: ListOptions = {}): Promise<{customers: CustomerListRow[]; total: number; page: number; perPage: number}> {
	const q = options.q?.trim() ?? ""
	const filter = options.filter ?? "all"
	const sort = options.sort ?? "alpha"
	const page = Math.max(1, options.page ?? 1)
	const perPage = options.perPage ?? DEFAULT_PER_PAGE

	const where: Prisma.CustomerWhereInput = {}
	if (q) {
		where.OR = [
			{firstName: {contains: q, mode: "insensitive"}},
			{lastName: {contains: q, mode: "insensitive"}},
			{phone: {contains: q}},
			{email: {contains: q, mode: "insensitive"}},
		]
	}
	if (filter === "active") where.active = true
	if (filter === "inactive") where.active = false

	let orderBy: Prisma.CustomerOrderByWithRelationInput[] = []
	if (sort === "newest") {
		orderBy = [{createdAt: "desc"}]
	} else if (sort === "frequent") {
		orderBy = [{bookings: {_count: "desc"}}, {lastName: "asc"}]
	} else {
		orderBy = [{active: "desc"}, {lastName: "asc"}, {firstName: "asc"}]
	}

	const [rawCustomers, total] = await Promise.all([
		prisma.customer.findMany({
			where,
			include: {
				_count: {select: {bookings: true}},
				bookings: {
					select: {items: {select: {startAt: true}, orderBy: {startAt: "desc"}, take: 1}},
					orderBy: {createdAt: "desc"},
					take: 1,
				},
			},
			orderBy,
			skip: (page - 1) * perPage,
			take: perPage,
		}),
		prisma.customer.count({where}),
	])

	const customers: CustomerListRow[] = rawCustomers.map((c) => ({
		id: c.id,
		firstName: c.firstName,
		lastName: c.lastName,
		phone: c.phone,
		email: c.email,
		notes: c.notes,
		marketingConsent: c.marketingConsent,
		hasAccount: c.hasAccount,
		active: c.active,
		createdAt: c.createdAt,
		bookingCount: c._count.bookings,
		lastVisitAt: c.bookings[0]?.items[0]?.startAt ?? null,
	}))

	return {customers, total, page, perPage}
}

export async function getCustomerById(id: string) {
	return prisma.customer.findUnique({where: {id}})
}

export async function getCustomerBookings(customerId: string) {
	return prisma.booking.findMany({
		where: {customerId},
		include: {
			items: {
				include: {
					service: true,
					staff: true,
				},
				orderBy: {order: "asc"},
			},
		},
		orderBy: {createdAt: "desc"},
		take: 50,
	})
}
