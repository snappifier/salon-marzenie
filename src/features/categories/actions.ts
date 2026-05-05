"use server"

import {revalidatePath} from "next/cache"
import {redirect} from "next/navigation"
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

function parseForm(formData: FormData) {
    return categorySchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
        order: formData.get("order"),
    })
}

export async function createCategory(
    _prev: CategoryFormState,
    formData: FormData,
): Promise<CategoryFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    try {
        await prisma.category.create({data: parsed.data})
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {error: "Kategoria o tej nazwie lub slug już istnieje"}
        }
        throw e
    }

    revalidatePath("/admin/uslugi")
    revalidatePath("/admin/kategorie")
    redirect("/admin/kategorie")
}

export async function updateCategory(
    id: string,
    _prev: CategoryFormState,
    formData: FormData,
): Promise<CategoryFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    try {
        await prisma.category.update({
            where: {id},
            data: parsed.data,
        })
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {error: "Kategoria o tej nazwie lub slug już istnieje"}
        }
        throw e
    }

    revalidatePath("/admin/uslugi")
    revalidatePath("/admin/kategorie")
    redirect("/admin/kategorie")
}

export async function deactivateCategory(id: string) {
    await requireAdmin()
    await prisma.category.update({
        where: {id},
        data: {active: false},
    })
    revalidatePath("/admin/kategorie")
}

export async function activateCategory(id: string) {
    await requireAdmin()
    await prisma.category.update({
        where: {id},
        data: {active: true},
    })
    revalidatePath("/admin/kategorie")
}