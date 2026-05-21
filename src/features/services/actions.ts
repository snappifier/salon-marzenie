// src/features/services/actions.ts
"use server"

import {revalidatePath} from "next/cache"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"

const serviceSchema = z.object({
	name: z.string().trim().min(1, "Nazwa jest wymagana").max(100),
	description: z.string().trim().max(1000).optional().or(z.literal("")),
	categoryId: z.string().min(1, "Wybierz kategorię"),
	defaultDurationMin: z.coerce.number().int().min(5, "Minimum 5 minut").max(480),
	defaultBufferAfterMin: z.coerce.number().int().min(0).max(120),
	defaultPriceGr: z.coerce.number().int().min(0),
})

export type ServiceFormState = {
	error?: string
	fieldErrors?: Record<string, string[] | undefined>
}

async function requireAdmin() {
	const session = await auth()
	if (!session) throw new Error("Unauthorized")
}

export async function createServiceJson(input: {
	name: string
	description?: string
	categoryId: string
	defaultDurationMin: number
	defaultBufferAfterMin: number
	defaultPriceGr: number
}): Promise<{success: true; id: string} | {success: false; error: string}> {
	await requireAdmin()
	const parsed = serviceSchema.safeParse(input)
	if (!parsed.success) {
		const fields = z.flattenError(parsed.error).fieldErrors
		const first = Object.values(fields).flat().find(Boolean)
		return {success: false, error: first ?? "Niepoprawne dane"}
	}
	const created = await prisma.service.create({
		data: {
			name: parsed.data.name,
			description: parsed.data.description || null,
			categoryId: parsed.data.categoryId,
			defaultDurationMin: parsed.data.defaultDurationMin,
			defaultBufferAfterMin: parsed.data.defaultBufferAfterMin,
			defaultPriceGr: parsed.data.defaultPriceGr,
		},
	})
	revalidatePath("/admin/oferta")
	return {success: true, id: created.id}
}

export async function updateServiceJson(id: string, input: {
	name: string
	description?: string
	categoryId: string
	defaultDurationMin: number
	defaultBufferAfterMin: number
	defaultPriceGr: number
}): Promise<{success: true} | {success: false; error: string}> {
	await requireAdmin()
	const parsed = serviceSchema.safeParse(input)
	if (!parsed.success) {
		const fields = z.flattenError(parsed.error).fieldErrors
		const first = Object.values(fields).flat().find(Boolean)
		return {success: false, error: first ?? "Niepoprawne dane"}
	}
	await prisma.service.update({
		where: {id},
		data: {
			name: parsed.data.name,
			description: parsed.data.description || null,
			categoryId: parsed.data.categoryId,
			defaultDurationMin: parsed.data.defaultDurationMin,
			defaultBufferAfterMin: parsed.data.defaultBufferAfterMin,
			defaultPriceGr: parsed.data.defaultPriceGr,
		},
	})
	revalidatePath("/admin/oferta")
	revalidatePath(`/admin/oferta/uslugi/${id}`)
	return {success: true}
}

export async function deactivateService(id: string) {
	await requireAdmin()
	await prisma.service.update({where: {id}, data: {active: false}})
	revalidatePath("/admin/oferta")
}

export async function activateService(id: string) {
	await requireAdmin()
	await prisma.service.update({where: {id}, data: {active: true}})
	revalidatePath("/admin/oferta")
}

export async function saveServiceStaff(serviceId: string, assignments: Array<{
	staffId: string
	assigned: boolean
	durationOverrideMin: number | null
	bufferOverrideMin: number | null
	priceOverrideGr: number | null
}>): Promise<{success: true} | {success: false; error: string}> {
	await requireAdmin()
	const toDelete = assignments.filter((a) => !a.assigned).map((a) => a.staffId)
	const toUpsert = assignments.filter((a) => a.assigned)

	for (const a of toUpsert) {
		if (a.durationOverrideMin !== null && (a.durationOverrideMin < 5 || a.durationOverrideMin > 480)) {
			return {success: false, error: "Czas musi być między 5 a 480 minut"}
		}
		if (a.bufferOverrideMin !== null && (a.bufferOverrideMin < 0 || a.bufferOverrideMin > 120)) {
			return {success: false, error: "Bufor musi być między 0 a 120 minut"}
		}
		if (a.priceOverrideGr !== null && a.priceOverrideGr < 0) {
			return {success: false, error: "Cena nie może być ujemna"}
		}
	}

	await prisma.$transaction([
		prisma.staffService.deleteMany({where: {serviceId, staffId: {in: toDelete}}}),
		...toUpsert.map((a) =>
			prisma.staffService.upsert({
				where: {staffId_serviceId: {staffId: a.staffId, serviceId}},
				create: {
					staffId: a.staffId,
					serviceId,
					durationOverrideMin: a.durationOverrideMin,
					bufferOverrideMin: a.bufferOverrideMin,
					priceOverrideGr: a.priceOverrideGr,
				},
				update: {
					durationOverrideMin: a.durationOverrideMin,
					bufferOverrideMin: a.bufferOverrideMin,
					priceOverrideGr: a.priceOverrideGr,
				},
			}),
		),
	])

	revalidatePath(`/admin/oferta/uslugi/${serviceId}`)
	revalidatePath("/admin/oferta")
	return {success: true}
}

export async function deleteService(id: string): Promise<{success: true} | {success: false; error: string}> {
	await requireAdmin()
	try {
		await prisma.service.delete({where: {id}})
	} catch {
		return {success: false, error: "Nie można usunąć usługi — usuń najpierw związane rezerwacje."}
	}
	revalidatePath("/admin/oferta")
	return {success: true}
}
