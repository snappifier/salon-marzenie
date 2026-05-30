"use server"

import {revalidatePath} from "next/cache"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"
import {plPhoneOptionalSchema} from "@/lib/validation"

const settingsSchema = z.object({
    salonName: z.string().trim().min(1, "Nazwa salonu jest wymagana").max(100),
    salonPhone: plPhoneOptionalSchema,
    salonEmail: z.string().trim().email("Nieprawidłowy email").max(100).optional().or(z.literal("")),
    salonAddress: z.string().trim().max(200).optional().or(z.literal("")),

    minCancelHoursBefore: z.coerce.number().int().min(0).max(168),
    minBookingHoursAhead: z.coerce.number().int().min(0).max(168),
    maxBookingDaysAhead: z.coerce.number().int().min(1).max(365),
    slotIntervalMin: z.coerce.number().int().min(5).max(60),

    salonOpenHour: z.coerce.number().int().min(0).max(23).nullable(),
    salonOpenMinute: z.coerce.number().int().min(0).max(59).nullable(),
    salonCloseHour: z.coerce.number().int().min(0).max(23).nullable(),
    salonCloseMinute: z.coerce.number().int().min(0).max(59).nullable(),

    adminNotificationPhone: plPhoneOptionalSchema,
    adminNotificationEmail: z.string().trim().email("Nieprawidłowy email").max(100).optional().or(z.literal("")),
    adminNotifyOnCancel: z.coerce.boolean(),

    requireConfirmation: z.coerce.boolean(),
    confirmWindowMaxHours: z.coerce.number().int().min(24).max(720),
    confirmWindowMinHours: z.coerce.number().int().min(1).max(72),
    companyOwnerName: z.string().trim().max(120).optional().or(z.literal("")),
    nip: z.string().trim().max(20).optional().or(z.literal("")),
    regon: z.string().trim().max(20).optional().or(z.literal("")),
    facebookUrl: z.string().trim().url("Nieprawidłowy URL").max(200).optional().or(z.literal("")),
})

export type SettingsFormState = {
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
    success?: boolean
}

async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

function parseTimeFromForm(formData: FormData, key: string): string | null {
    const value = formData.get(key) as string | null
    return value && value !== "" ? value : null
}

export async function updateSettings(
    _prev: SettingsFormState,
    formData: FormData,
): Promise<SettingsFormState> {
    await requireAdmin()

    const openTime = parseTimeFromForm(formData, "salonOpen")
    const closeTime = parseTimeFromForm(formData, "salonClose")

    const [openH, openM] = openTime ? openTime.split(":").map(Number) : [null, null]
    const [closeH, closeM] = closeTime ? closeTime.split(":").map(Number) : [null, null]

    const parsed = settingsSchema.safeParse({
        salonName: formData.get("salonName"),
        salonPhone: formData.get("salonPhone") ?? "",
        salonEmail: formData.get("salonEmail"),
        salonAddress: formData.get("salonAddress"),
        minCancelHoursBefore: formData.get("minCancelHoursBefore"),
        minBookingHoursAhead: formData.get("minBookingHoursAhead"),
        maxBookingDaysAhead: formData.get("maxBookingDaysAhead"),
        slotIntervalMin: formData.get("slotIntervalMin"),
        salonOpenHour: openH,
        salonOpenMinute: openM,
        salonCloseHour: closeH,
        salonCloseMinute: closeM,
        adminNotificationPhone: formData.get("adminNotificationPhone") ?? "",
        adminNotificationEmail: formData.get("adminNotificationEmail"),
        adminNotifyOnCancel: formData.get("adminNotifyOnCancel") === "on",
        requireConfirmation: formData.get("requireConfirmation") === "on",
        confirmWindowMaxHours: formData.get("confirmWindowMaxHours"),
        confirmWindowMinHours: formData.get("confirmWindowMinHours"),
        companyOwnerName: formData.get("companyOwnerName"),
        nip: formData.get("nip"),
        regon: formData.get("regon"),
        facebookUrl: formData.get("facebookUrl") ?? "",
    })

    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    const d = parsed.data

    if (d.salonOpenHour !== null && d.salonCloseHour !== null) {
        const openMin = d.salonOpenHour * 60 + (d.salonOpenMinute ?? 0)
        const closeMin = d.salonCloseHour * 60 + (d.salonCloseMinute ?? 0)
        if (closeMin <= openMin) {
            return {error: "Godzina zamknięcia musi być po godzinie otwarcia"}
        }
    }

    if (d.requireConfirmation && d.confirmWindowMinHours >= d.confirmWindowMaxHours) {
        return {error: "Okno potwierdzenia: 'najpóźniej' (godz.) musi być mniejsze niż 'najwcześniej'"}
    }

    const salonOpenMin = d.salonOpenHour !== null ? d.salonOpenHour * 60 + (d.salonOpenMinute ?? 0) : null
    const salonCloseMin = d.salonCloseHour !== null ? d.salonCloseHour * 60 + (d.salonCloseMinute ?? 0) : null

    await prisma.settings.update({
        where: {id: "settings"},
        data: {
            salonName: d.salonName,
            salonPhone: d.salonPhone,
            salonEmail: d.salonEmail || null,
            salonAddress: d.salonAddress || null,
            minCancelHoursBefore: d.minCancelHoursBefore,
            minBookingHoursAhead: d.minBookingHoursAhead,
            maxBookingDaysAhead: d.maxBookingDaysAhead,
            slotIntervalMin: d.slotIntervalMin,
            salonOpenMin,
            salonCloseMin,
            adminNotificationPhone: d.adminNotificationPhone,
            adminNotificationEmail: d.adminNotificationEmail || null,
            adminNotifyOnCancel: d.adminNotifyOnCancel,
            requireConfirmation: d.requireConfirmation,
            confirmWindowMaxHours: d.confirmWindowMaxHours,
            confirmWindowMinHours: d.confirmWindowMinHours,
            companyOwnerName: d.companyOwnerName || null,
            nip: d.nip || null,
            regon: d.regon || null,
            facebookUrl: d.facebookUrl || null,
        },
    })

    revalidatePath("/admin/ustawienia")
    return {success: true}
}