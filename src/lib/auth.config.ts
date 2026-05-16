import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/logowanie",
    },
    logger: {
        error(error) {
            if (error?.name === "CredentialsSignin") {
                return
            }
            console.error(error)
        },
        warn(code) {
            console.warn(code)
        },
        debug(code) {
            console.debug(code)
        },
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as "admin" | "customer"
            }
            return session
        }
    },
    providers: [],
} satisfies NextAuthConfig