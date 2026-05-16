import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const role = req.auth?.user?.role

    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isCustomerRoute = nextUrl.pathname.startsWith("/konto")

    const isAdminLogin = nextUrl.pathname === "/admin/login"
    const isCustomerLogin = nextUrl.pathname === "/logowanie"

    if (isAdminRoute) {
        if (isAdminLogin) {
            if (isLoggedIn && role === "admin") {
                return NextResponse.redirect(new URL("/admin/kalendarz", nextUrl))
            }
            return NextResponse.next()
        }

        if (!isLoggedIn || role !== "admin") {
            return NextResponse.redirect(new URL("/admin/login", nextUrl))
        }
    }

    if (isCustomerRoute) {
        if (!isLoggedIn || role !== "customer") {
            return NextResponse.redirect(new URL("/logowanie", nextUrl))
        }
    }

    if (isCustomerLogin) {
        if (isLoggedIn && role === "customer") {
            return NextResponse.redirect(new URL("/konto", nextUrl))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/admin/:path*", "/konto/:path*", "/logowanie", "/rejestracja"],
}