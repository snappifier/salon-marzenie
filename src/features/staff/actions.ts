"use server"

import {revalidatePath} from "next/cache"
import {redirect} from "next/navigation"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"

const staffSchema = z.object({
    firstName: z.string().trim().min(1, "Imię jest wymagane").max(50),
    lastName: z.string().trim().min(1, "Nazwisko jest wymagane").max(50),
    email: z.string().trim().email("Nieprawidłowy email").max(100).optional().or(z.literal("")),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Wpisz kolor w formacie #rrggbb"),
    bio: z.string().trim().max(2000).optional().or(z.literal("")),
    acceptsAnyAssignment: z.coerce.boolean(),
})

export type StaffFormState = {
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
}

async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

function parseForm(formData: FormData) {
    return staffSchema.safeParse({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        color: formData.get("color"),
        bio: formData.get("bio"),
        acceptsAnyAssignment: formData.get("acceptsAnyAssignment") === "on",
    })
}

export async function createStaff(
    _prev: StaffFormState,
    formData: FormData,
): Promise<StaffFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    try {
        await prisma.staff.create({
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                email: parsed.data.email || null,
                phone: parsed.data.phone || null,
                color: parsed.data.color,
                bio: parsed.data.bio || null,
                acceptsAnyAssignment: parsed.data.acceptsAnyAssignment,
            },
        })
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {error: "Pracownik o tym emailu już istnieje"}
        }
        throw e
    }

    revalidatePath("/admin/pracownicy")
    redirect("/admin/pracownicy")
}

export async function updateStaff(
    id: string,
    _prev: StaffFormState,
    formData: FormData,
): Promise<StaffFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    try {
        await prisma.staff.update({
            where: {id},
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                email: parsed.data.email || null,
                phone: parsed.data.phone || null,
                color: parsed.data.color,
                bio: parsed.data.bio || null,
                acceptsAnyAssignment: parsed.data.acceptsAnyAssignment,
            },
        })
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {error: "Pracownik o tym emailu już istnieje"}
        }
        throw e
    }

    revalidatePath("/admin/pracownicy")
    redirect("/admin/pracownicy")
}

export async function deactivateStaff(id: string) {
    await requireAdmin()
    await prisma.staff.update({
        where: {id},
        data: {active: false},
    })
    revalidatePath("/admin/pracownicy")
}

export async function activateStaff(id: string) {
    await requireAdmin()
    await prisma.staff.update({
        where: {id},
        data: {active: true},
    })
    revalidatePath("/admin/pracownicy")
}