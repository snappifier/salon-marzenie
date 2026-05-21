"use server"

import {revalidatePath} from "next/cache"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"

async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

const overrideSchema = z.object({
    durationOverrideMin: z.coerce.number().int().min(5).max(480).nullable(),
    bufferOverrideMin: z.coerce.number().int().min(0).max(120).nullable(),
    priceOverrideGr: z.coerce.number().int().min(0).nullable(),
})

export type StaffServicesFormState = {
    error?: string
    rowErrors?: Record<string, string>
}

function parseOverride(value: FormDataEntryValue | null): number | null {
    if (value === null || value === "") return null
    const n = Number(value)
    if (Number.isNaN(n)) return null
    return n
}

export async function saveStaffServices(
    staffId: string,
    allServiceIds: string[],
    _prev: StaffServicesFormState,
    formData: FormData,
): Promise<StaffServicesFormState> {
    await requireAdmin()

    const rowErrors: Record<string, string> = {}
    const toUpsert: Array<{
        serviceId: string
        durationOverrideMin: number | null
        bufferOverrideMin: number | null
        priceOverrideGr: number | null
    }> = []
    const toDelete: string[] = []

    for (const serviceId of allServiceIds) {
        const isAssigned = formData.get(`${serviceId}_assigned`) === "on"

        if (!isAssigned) {
            toDelete.push(serviceId)
            continue
        }

        const raw = {
            durationOverrideMin: parseOverride(formData.get(`${serviceId}_duration`)),
            bufferOverrideMin: parseOverride(formData.get(`${serviceId}_buffer`)),
            priceOverrideGr: parseOverride(formData.get(`${serviceId}_price`)),
        }

        const parsed = overrideSchema.safeParse(raw)
        if (!parsed.success) {
            const flat = z.flattenError(parsed.error).fieldErrors
            const firstError = flat.durationOverrideMin?.[0] ?? flat.bufferOverrideMin?.[0] ?? flat.priceOverrideGr?.[0] ?? "Nieprawidłowe dane"
            rowErrors[serviceId] = firstError
            continue
        }

        toUpsert.push({serviceId, ...parsed.data})
    }

    if (Object.keys(rowErrors).length > 0) {
        return {rowErrors}
    }

    await prisma.$transaction([
        prisma.staffService.deleteMany({
            where: {staffId, serviceId: {in: toDelete}},
        }),
        ...toUpsert.map((entry) =>
            prisma.staffService.upsert({
                where: {staffId_serviceId: {staffId, serviceId: entry.serviceId}},
                create: {
                    staffId,
                    serviceId: entry.serviceId,
                    durationOverrideMin: entry.durationOverrideMin,
                    bufferOverrideMin: entry.bufferOverrideMin,
                    priceOverrideGr: entry.priceOverrideGr,
                },
                update: {
                    durationOverrideMin: entry.durationOverrideMin,
                    bufferOverrideMin: entry.bufferOverrideMin,
                    priceOverrideGr: entry.priceOverrideGr,
                },
            }),
        ),
    ])

    revalidatePath(`/admin/pracownicy/${staffId}/uslugi`)
    revalidatePath("/admin/pracownicy")
    return {}
}

export async function saveStaffServicesJson(
    staffId: string,
    assignments: Array<{
        serviceId: string
        assigned: boolean
        durationOverrideMin: number | null
        bufferOverrideMin: number | null
        priceOverrideGr: number | null
    }>,
): Promise<{success: true} | {success: false; error: string}> {
    await requireAdmin()

    const toDelete = assignments.filter((a) => !a.assigned).map((a) => a.serviceId)
    const toUpsert = assignments.filter((a) => a.assigned)

    for (const a of toUpsert) {
        const parsed = overrideSchema.safeParse({
            durationOverrideMin: a.durationOverrideMin,
            bufferOverrideMin: a.bufferOverrideMin,
            priceOverrideGr: a.priceOverrideGr,
        })
        if (!parsed.success) {
            return {success: false, error: "Nieprawidłowe nadpisania czasu lub ceny"}
        }
    }

    await prisma.$transaction([
        prisma.staffService.deleteMany({where: {staffId, serviceId: {in: toDelete}}}),
        ...toUpsert.map((entry) =>
            prisma.staffService.upsert({
                where: {staffId_serviceId: {staffId, serviceId: entry.serviceId}},
                create: {
                    staffId,
                    serviceId: entry.serviceId,
                    durationOverrideMin: entry.durationOverrideMin,
                    bufferOverrideMin: entry.bufferOverrideMin,
                    priceOverrideGr: entry.priceOverrideGr,
                },
                update: {
                    durationOverrideMin: entry.durationOverrideMin,
                    bufferOverrideMin: entry.bufferOverrideMin,
                    priceOverrideGr: entry.priceOverrideGr,
                },
            }),
        ),
    ])

    revalidatePath(`/admin/zespol/${staffId}`)
    revalidatePath("/admin/zespol")
    return {success: true}
}