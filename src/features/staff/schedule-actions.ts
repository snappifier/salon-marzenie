"use server"

import {revalidatePath} from "next/cache"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"
import {DayOfWeek} from "@/generated/prisma/client"

async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

const DAYS: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
]

const workingHoursSchema = z.object({
    dayOfWeek: z.enum(DAYS),
    startMin: z.number().int().min(0).max(1440),
    endMin: z.number().int().min(0).max(1440),
}).refine((d) => d.endMin > d.startMin, {
    message: "Koniec pracy musi być po początku",
    path: ["endMin"],
})

export type ScheduleFormState = {
    error?: string
    dayErrors?: Partial<Record<DayOfWeek, string>>
}

export async function saveWorkingHours(
    staffId: string,
    _prev: ScheduleFormState,
    formData: FormData,
): Promise<ScheduleFormState> {
    await requireAdmin()

    const dayErrors: Partial<Record<DayOfWeek, string>> = {}
    const validEntries: Array<{dayOfWeek: DayOfWeek; startMin: number; endMin: number}> = []
    const daysToDelete: DayOfWeek[] = []

    for (const day of DAYS) {
        const isWorking = formData.get(`${day}_active`) === "on"

        if (!isWorking) {
            daysToDelete.push(day)
            continue
        }

        const startStr = formData.get(`${day}_start`) as string
        const endStr = formData.get(`${day}_end`) as string

        if (!startStr || !endStr) {
            dayErrors[day] = "Podaj godziny rozpoczęcia i zakończenia"
            continue
        }

        const [sh, sm] = startStr.split(":").map(Number)
        const [eh, em] = endStr.split(":").map(Number)
        const startMin = sh * 60 + sm
        const endMin = eh * 60 + em

        const parsed = workingHoursSchema.safeParse({dayOfWeek: day, startMin, endMin})
        if (!parsed.success) {
            dayErrors[day] = z.flattenError(parsed.error).fieldErrors.endMin?.[0] ?? "Nieprawidłowe godziny"
            continue
        }
        validEntries.push(parsed.data)
    }

    if (Object.keys(dayErrors).length > 0) {
        return {dayErrors}
    }

    await prisma.$transaction([
        prisma.workingHours.deleteMany({
            where: {staffId, dayOfWeek: {in: daysToDelete}},
        }),
        ...validEntries.map((entry) =>
            prisma.workingHours.upsert({
                where: {staffId_dayOfWeek: {staffId, dayOfWeek: entry.dayOfWeek}},
                create: {
                    staffId,
                    dayOfWeek: entry.dayOfWeek,
                    startMin: entry.startMin,
                    endMin: entry.endMin,
                },
                update: {
                    startMin: entry.startMin,
                    endMin: entry.endMin,
                },
            })
        ),
    ])

    revalidatePath(`/admin/pracownicy/${staffId}/grafik`)
    revalidatePath("/admin/pracownicy")
    return {}
}

const timeOffSchema = z.object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    reason: z.string().trim().max(200).optional().or(z.literal("")),
}).refine((d) => d.endAt > d.startAt, {
    message: "Koniec urlopu musi być po jego początku",
    path: ["endAt"],
})

export type TimeOffFormState = {
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
}

export async function addTimeOff(
    staffId: string,
    _prev: TimeOffFormState,
    formData: FormData,
): Promise<TimeOffFormState> {
    await requireAdmin()

    const parsed = timeOffSchema.safeParse({
        startAt: formData.get("startAt"),
        endAt: formData.get("endAt"),
        reason: formData.get("reason"),
    })
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    await prisma.timeOff.create({
        data: {
            staffId,
            startAt: parsed.data.startAt,
            endAt: parsed.data.endAt,
            reason: parsed.data.reason || null,
        },
    })

    revalidatePath(`/admin/pracownicy/${staffId}/grafik`)
    return {}
}

export async function deleteTimeOff(id: string, staffId: string) {
    await requireAdmin()
    await prisma.timeOff.delete({where: {id}})
    revalidatePath(`/admin/pracownicy/${staffId}/grafik`)
}