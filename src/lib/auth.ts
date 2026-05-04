import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import {compare} from "bcryptjs"
import {z} from "zod"
import {prisma} from "@/lib/prisma"
import {authConfig} from "@/lib/auth.config"

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const {handlers, signIn, signOut, auth} = NextAuth({
    ...authConfig,
    session: {strategy: "jwt"},
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) return null

                const admin = await prisma.adminUser.findUnique({
                    where: {email: parsed.data.email},
                })

                if (!admin || !admin.active) return null

                const isValid = await compare(parsed.data.password, admin.passwordHash)
                if (!isValid) return null

                return {
                    id: admin.id,
                    email: admin.email,
                    name: `${admin.firstName} ${admin.lastName}`,
                }
            },
        }),
    ],
})