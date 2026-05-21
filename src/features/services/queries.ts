// src/features/services/queries.ts
import {prisma} from "@/lib/prisma"
import type {Prisma} from "@/generated/prisma/client"

export interface ServiceListRow {
	id: string
	name: string
	description: string | null
	categoryId: string
	categoryName: string
	defaultDurationMin: number
	defaultBufferAfterMin: number
	defaultPriceGr: number
	active: boolean
	staffCount: number
}

interface ServicesOptions {
	q?: string
	categoryId?: string
	filter?: "all" | "active" | "inactive"
	sort?: "alpha" | "category" | "newest"
}

export async function getAllServices(options: ServicesOptions = {}): Promise<ServiceListRow[]> {
	const q = options.q?.trim() ?? ""
	const filter = options.filter ?? "all"
	const sort = options.sort ?? "category"

	const where: Prisma.ServiceWhereInput = {}
	if (q) {
		where.OR = [
			{name: {contains: q, mode: "insensitive"}},
			{description: {contains: q, mode: "insensitive"}},
			{category: {name: {contains: q, mode: "insensitive"}}},
		]
	}
	if (options.categoryId) where.categoryId = options.categoryId
	if (filter === "active") where.active = true
	if (filter === "inactive") where.active = false

	let orderBy: Prisma.ServiceOrderByWithRelationInput[] = []
	if (sort === "alpha") {
		orderBy = [{name: "asc"}]
	} else if (sort === "newest") {
		orderBy = [{createdAt: "desc"}]
	} else {
		orderBy = [{active: "desc"}, {category: {order: "asc"}}, {name: "asc"}]
	}

	const rows = await prisma.service.findMany({
		where,
		include: {
			category: true,
			_count: {select: {staffServices: true}},
		},
		orderBy,
	})

	return rows.map((s) => ({
		id: s.id,
		name: s.name,
		description: s.description,
		categoryId: s.categoryId,
		categoryName: s.category.name,
		defaultDurationMin: s.defaultDurationMin,
		defaultBufferAfterMin: s.defaultBufferAfterMin,
		defaultPriceGr: s.defaultPriceGr,
		active: s.active,
		staffCount: s._count.staffServices,
	}))
}

export async function getServiceById(id: string) {
	return prisma.service.findUnique({
		where: {id},
		include: {category: true},
	})
}

export interface ServiceStaffAssignment {
	staffId: string
	firstName: string
	lastName: string
	color: string
	active: boolean
	assigned: boolean
	durationOverrideMin: number | null
	bufferOverrideMin: number | null
	priceOverrideGr: number | null
}

export async function getServiceStaffAssignments(serviceId: string): Promise<ServiceStaffAssignment[]> {
	const [allStaff, assignments] = await Promise.all([
		prisma.staff.findMany({orderBy: [{active: "desc"}, {firstName: "asc"}]}),
		prisma.staffService.findMany({where: {serviceId}}),
	])
	const byStaff = new Map(assignments.map((a) => [a.staffId, a]))
	return allStaff.map((s) => {
		const a = byStaff.get(s.id)
		return {
			staffId: s.id,
			firstName: s.firstName,
			lastName: s.lastName,
			color: s.color,
			active: s.active,
			assigned: Boolean(a),
			durationOverrideMin: a?.durationOverrideMin ?? null,
			bufferOverrideMin: a?.bufferOverrideMin ?? null,
			priceOverrideGr: a?.priceOverrideGr ?? null,
		}
	})
}
