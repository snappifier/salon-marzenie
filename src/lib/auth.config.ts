import type {NextAuthConfig} from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    providers: [],
    callbacks: {
        authorized({auth, request}) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = request.nextUrl.pathname === "/admin/login"
            const isOnAdmin = request.nextUrl.pathname.startsWith("/admin")

            if (isOnAdmin && !isOnLogin && !isLoggedIn) {
                return false
            }

            if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL("/admin/kalendarz", request.url))
            }

            return true
        },
    },
} satisfies NextAuthConfig