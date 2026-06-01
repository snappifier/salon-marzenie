import NextAuth, { type Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"

const adminSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

const customerSchema = z.object({
    login: z.string().min(1),
    password: z.string().min(1),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            id: "admin-credentials",
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const parsed = adminSchema.safeParse(credentials)
                if (!parsed.success) return null

                const admin = await prisma.adminUser.findUnique({
                    where: { email: parsed.data.email },
                })

                if (!admin || !admin.active) return null

                const isValid = await compare(parsed.data.password, admin.passwordHash)
                if (!isValid) return null

                return {
                    id: admin.id,
                    email: admin.email,
                    name: `${admin.firstName} ${admin.lastName}`,
                    role: "admin",
                }
            },
        }),
        Credentials({
            id: "customer-credentials",
            credentials: {
                login: {},
                password: {},
            },
            authorize: async (credentials) => {
                const parsed = customerSchema.safeParse(credentials)
                if (!parsed.success) return null

                const customer = await prisma.customer.findFirst({
                    where: {
                        OR: [
                            { phone: parsed.data.login },
                            { email: parsed.data.login }
                        ]
                    },
                })

                if (!customer || !customer.hasAccount || !customer.passwordHash) return null

                const isValid = await compare(parsed.data.password, customer.passwordHash)
                if (!isValid) return null

                return {
                    id: customer.id,
                    email: customer.email,
                    name: `${customer.firstName} ${customer.lastName}`,
                    role: "customer",
                }
            },
        }),
    ],
})

/**
 * Bezpieczna wersja auth() — łapie JWTSessionError (stale/invalid cookie)
 * i zwraca null zamiast wywalać Request. Użyj w layoutach public scope
 * gdzie anonymous user jest valid state.
 *
 * NIE używaj w auth-required routes (admin/, konto/) — tam crash → redirect
 * do /logowanie jest oczekiwany flow.
 */
export async function getSessionSafe(): Promise<Session | null> {
    try {
        return await auth()
    } catch (e) {
        const err = e as {type?: string; name?: string}
        if (err?.type === "JWTSessionError" || err?.name === "JWTSessionError") {
            // Log do server console — przydatne dla diagnostyki ale nie crashuje UX
            console.warn("[auth] JWT session error — treating as anonymous", err)
            return null
        }
        throw e
    }
}