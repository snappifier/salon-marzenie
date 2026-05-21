"use server"

import {revalidatePath} from "next/cache"
import {redirect} from "next/navigation"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"
import {plPhoneSchema} from "@/lib/validation"

const customerSchema = z.object({
    firstName: z.string().trim().min(1, "Imię jest wymagane").max(50),
    lastName: z.string().trim().min(1, "Nazwisko jest wymagane").max(50),
    phone: plPhoneSchema,
    email: z.string().trim().email("Nieprawidłowy email").max(100).optional().or(z.literal("")),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    marketingConsent: z.coerce.boolean(),
})

export type CustomerFormState = {
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
}

async function requireAdmin() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")
}

function parseForm(formData: FormData) {
    return customerSchema.safeParse({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        notes: formData.get("notes"),
        marketingConsent: formData.get("marketingConsent") === "on",
    })
}

export async function createCustomer(
    _prev: CustomerFormState,
    formData: FormData,
): Promise<CustomerFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    try {
        await prisma.customer.create({
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                phone: parsed.data.phone,
                email: parsed.data.email || null,
                notes: parsed.data.notes || null,
                marketingConsent: parsed.data.marketingConsent,
            },
        })
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {error: "Klient o tym telefonie lub emailu już istnieje"}
        }
        throw e
    }

    revalidatePath("/admin/klienci")
    redirect("/admin/klienci")
}

export async function createCustomerJson(input: {
    firstName: string
    lastName: string
    phone: string
    email?: string
    notes?: string
    marketingConsent?: boolean
}): Promise<{success: true; id: string} | {success: false; error: string}> {
    await requireAdmin()
    const parsed = customerSchema.safeParse({
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email ?? "",
        notes: input.notes ?? "",
        marketingConsent: input.marketingConsent ?? false,
    })
    if (!parsed.success) {
        const fields = z.flattenError(parsed.error).fieldErrors
        const first = Object.values(fields).flat().find(Boolean)
        return {success: false, error: first ?? "Niepoprawne dane"}
    }
    try {
        const created = await prisma.customer.create({
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                phone: parsed.data.phone,
                email: parsed.data.email || null,
                notes: parsed.data.notes || null,
                marketingConsent: parsed.data.marketingConsent,
            },
        })
        revalidatePath("/admin/klienci")
        return {success: true, id: created.id}
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {success: false, error: "Klient o tym telefonie lub emailu już istnieje"}
        }
        throw e
    }
}

export async function updateCustomer(
    id: string,
    _prev: CustomerFormState,
    formData: FormData,
): Promise<CustomerFormState> {
    await requireAdmin()

    const parsed = parseForm(formData)
    if (!parsed.success) {
        return {fieldErrors: z.flattenError(parsed.error).fieldErrors}
    }

    try {
        await prisma.customer.update({
            where: {id},
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                phone: parsed.data.phone,
                email: parsed.data.email || null,
                notes: parsed.data.notes || null,
                marketingConsent: parsed.data.marketingConsent,
            },
        })
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {error: "Klient o tym telefonie lub emailu już istnieje"}
        }
        throw e
    }

    revalidatePath("/admin/klienci")
    revalidatePath(`/admin/klienci/${id}`)
    return {}
}

export async function updateCustomerJson(id: string, input: {
    firstName: string
    lastName: string
    phone: string
    email?: string
    notes?: string
    marketingConsent?: boolean
}): Promise<{success: true} | {success: false; error: string}> {
    await requireAdmin()
    const parsed = customerSchema.safeParse({
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email ?? "",
        notes: input.notes ?? "",
        marketingConsent: input.marketingConsent ?? false,
    })
    if (!parsed.success) {
        const fields = z.flattenError(parsed.error).fieldErrors
        const first = Object.values(fields).flat().find(Boolean)
        return {success: false, error: first ?? "Niepoprawne dane"}
    }
    try {
        await prisma.customer.update({
            where: {id},
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                phone: parsed.data.phone,
                email: parsed.data.email || null,
                notes: parsed.data.notes || null,
                marketingConsent: parsed.data.marketingConsent,
            },
        })
        revalidatePath("/admin/klienci")
        revalidatePath(`/admin/klienci/${id}`)
        return {success: true}
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return {success: false, error: "Klient o tym telefonie lub emailu już istnieje"}
        }
        throw e
    }
}

export async function deleteCustomer(id: string): Promise<{success: true} | {success: false; error: string}> {
    await requireAdmin()
    try {
        await prisma.customer.delete({where: {id}})
    } catch (e: unknown) {
        if (e instanceof Error) {
            return {success: false, error: "Nie można usunąć klientki — usuń najpierw jej rezerwacje."}
        }
        throw e
    }
    revalidatePath("/admin/klienci")
    return {success: true}
}

export async function deactivateCustomer(id: string) {
    await requireAdmin()
    await prisma.customer.update({
        where: {id},
        data: {active: false},
    })
    revalidatePath("/admin/klienci")
}

export async function activateCustomer(id: string) {
    await requireAdmin()
    await prisma.customer.update({
        where: {id},
        data: {active: true},
    })
    revalidatePath("/admin/klienci")
}