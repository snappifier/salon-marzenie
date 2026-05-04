import NextAuth from "next-auth"
import {NextResponse} from "next/server"
import {authConfig} from "@/lib/auth.config"

const {auth} = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnLogin = req.nextUrl.pathname === "/admin/login"

    if (!isLoggedIn && !isOnLogin) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    if (isLoggedIn && isOnLogin) {
        return NextResponse.redirect(new URL("/admin/kalendarz", req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/admin/:path*"],
}