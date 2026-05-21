// src/features/categories/actions.ts
"use server"

import {revalidatePath} from "next/cache"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"

const categorySchema = z.object({
	name: z.string().trim().min(1, "Nazwa jest wymagana").max(100),
	slug: z.string().trim().min(1, "Slug jest wymagany").max(100)
		.regex(/^[a-z0-9-]+$/, "Tylko małe litery, cyfry i myślniki"),
	order: z.coerce.number().int().min(0).max(999),
})

export type CategoryFormState = {
	error?: string
	fieldErrors?: Record<string, string[] | undefined>
}

async function requireAdmin() {
	const session = await auth()
	if (!session) throw new Error("Unauthorized")
}

export async function createCategoryJson(input: {
	name: string
	slug: string
	order: number
}): Promise<{success: true; id: string} | {success: false; error: string}> {
	await requireAdmin()
	const parsed = categorySchema.safeParse(input)
	if (!parsed.success) {
		const fields = z.flattenError(parsed.error).fieldErrors
		const first = Object.values(fields).flat().find(Boolean)
		return {success: false, error: first ?? "Niepoprawne dane"}
	}
	try {
		const created = await prisma.category.create({data: parsed.data})
		revalidatePath("/admin/oferta")
		return {success: true, id: created.id}
	} catch (e: unknown) {
		if (e instanceof Error && e.message.includes("Unique constraint")) {
			return {success: false, error: "Kategoria o tej nazwie lub slug już istnieje"}
		}
		throw e
	}
}

export async function updateCategoryJson(id: string, input: {
	name: string
	slug: string
	order: number
}): Promise<{success: true} | {success: false; error: string}> {
	await requireAdmin()
	const parsed = categorySchema.safeParse(input)
	if (!parsed.success) {
		const fields = z.flattenError(parsed.error).fieldErrors
		const first = Object.values(fields).flat().find(Boolean)
		return {success: false, error: first ?? "Niepoprawne dane"}
	}
	try {
		await prisma.category.update({where: {id}, data: parsed.data})
		revalidatePath("/admin/oferta")
		revalidatePath(`/admin/oferta/kategorie/${id}`)
		return {success: true}
	} catch (e: unknown) {
		if (e instanceof Error && e.message.includes("Unique constraint")) {
			return {success: false, error: "Kategoria o tej nazwie lub slug już istnieje"}
		}
		throw e
	}
}

export async function deactivateCategory(id: string) {
	await requireAdmin()
	await prisma.category.update({where: {id}, data: {active: false}})
	revalidatePath("/admin/oferta")
}

export async function activateCategory(id: string) {
	await requireAdmin()
	await prisma.category.update({where: {id}, data: {active: true}})
	revalidatePath("/admin/oferta")
}

export async function deleteCategory(id: string): Promise<{success: true} | {success: false; error: string}> {
	await requireAdmin()
	try {
		await prisma.category.delete({where: {id}})
	} catch {
		return {success: false, error: "Nie można usunąć kategorii — usuń najpierw przypisane usługi."}
	}
	revalidatePath("/admin/oferta")
	return {success: true}
}
