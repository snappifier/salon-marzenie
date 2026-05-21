"use server"

import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { plPhoneSchema } from "@/lib/validation"

const schema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    phone: plPhoneSchema,
    email: z.string().email().optional().or(z.literal("")),
    password: z.string().min(8),
})

type RegisterState = { error: string | null }

export async function registerAction(
    _prevState: RegisterState,
    formData: FormData,
): Promise<RegisterState> {
    const parsed = schema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: "Nieprawidłowe dane" }

    const { firstName, lastName, phone, email, password } = parsed.data

    const existing = await prisma.customer.findFirst({
        where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    })
    if (existing?.hasAccount) {
        return { error: "Konto z tym numerem lub emailem już istnieje" }
    }

    const passwordHash = await hash(password, 12)

    if (existing) {
        await prisma.customer.update({
            where: { id: existing.id },
            data: { hasAccount: true, passwordHash },
        })
    } else {
        await prisma.customer.create({
            data: { firstName, lastName, phone, email: email || null, hasAccount: true, passwordHash },
        })
    }

    await signIn("customer-credentials", { login: phone, password, redirectTo: "/konto" })
    // signIn z redirectTo rzuca NEXT_REDIRECT — return nieosiągalny, spełnia kontrakt useActionState.
    return { error: null }
}