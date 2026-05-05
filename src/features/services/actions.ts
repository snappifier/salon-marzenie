"use server"

import {revalidatePath} from "next/cache"
import {redirect} from "next/navigation"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"

const serviceSchema = z.object({
    name: z.string().trim().min(1, "Nazwa jest wymagana").max(100),
    description: z.string().trim().max(1000).optional(),
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

function parseForm(formData: FormData) {
    return serviceSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description") || undefined,
        categoryId: formData.get("categoryId"),
        defaultDurationMin: formData.get("defaultDurationMin"),
        defaultBufferAfterMin: formData.get("defaultBufferAfterMin"),
        defaultPriceGr: formData.get("defaultPriceGr"),
    })
}

export async function createService(
    _prev: ServiceFormState,
    formData: FormData,
): Promise<ServiceFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    await prisma.service.create({
        data: {
            name: parsed.data.name,
            description: parsed.data.description || null,
            categoryId: parsed.data.categoryId,
            defaultDurationMin: parsed.data.defaultDurationMin,
            defaultBufferAfterMin: parsed.data.defaultBufferAfterMin,
            defaultPriceGr: parsed.data.defaultPriceGr,
        },
    })

    revalidatePath("/admin/uslugi")
    redirect("/admin/uslugi")
}

export async function updateService(
    id: string,
    _prev: ServiceFormState,
    formData: FormData,
): Promise<ServiceFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
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

    revalidatePath("/admin/uslugi")
    redirect("/admin/uslugi")
}

export async function deactivateService(id: string) {
    await requireAdmin()
    await prisma.service.update({
        where: {id},
        data: {active: false},
    })
    revalidatePath("/admin/uslugi")
}

export async function activateService(id: string) {
    await requireAdmin()
    await prisma.service.update({
        where: {id},
        data: {active: true},
    })
    revalidatePath("/admin/uslugi")
}