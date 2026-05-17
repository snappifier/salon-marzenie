import NextAuth from "next-auth"
import {NextResponse} from "next/server"
import {authConfig} from "@/lib/auth.config"

const {auth} = NextAuth(authConfig)

const ADMIN_HOME = "/admin/kalendarz"
const ADMIN_LOGIN = "/admin/login"
const CUSTOMER_HOME = "/konto"
const CUSTOMER_LOGIN = "/logowanie"
const CUSTOMER_REGISTER = "/rejestracja"

export default auth((req) => {
    const {nextUrl} = req
    const role = req.auth?.user?.role ?? null
    const path = nextUrl.pathname

    const isAdminLogin = path === ADMIN_LOGIN
    const isAdminArea = path.startsWith("/admin") && !isAdminLogin
    const isCustomerArea = path.startsWith("/konto")
    const isCustomerAuth = path === CUSTOMER_LOGIN || path === CUSTOMER_REGISTER

    if (isAdminLogin && role === "admin") {
        return NextResponse.redirect(new URL(ADMIN_HOME, nextUrl))
    }
    if (isAdminLogin && role === "customer") {
        return NextResponse.redirect(new URL(CUSTOMER_HOME, nextUrl))
    }

    if (isAdminArea && role !== "admin") {
        return NextResponse.redirect(new URL(ADMIN_LOGIN, nextUrl))
    }

    if (isCustomerArea && role === "admin") {
        return NextResponse.redirect(new URL(ADMIN_HOME, nextUrl))
    }
    if (isCustomerArea && role !== "customer") {
        return NextResponse.redirect(new URL(CUSTOMER_LOGIN, nextUrl))
    }

    if (isCustomerAuth && role === "customer") {
        return NextResponse.redirect(new URL(CUSTOMER_HOME, nextUrl))
    }
    if (isCustomerAuth && role === "admin") {
        return NextResponse.redirect(new URL(ADMIN_HOME, nextUrl))
    }

    const reqHeaders = new Headers(req.headers)
    reqHeaders.set("x-pathname", path)
    return NextResponse.next({request: {headers: reqHeaders}})
})

export const config = {
    matcher: ["/admin/:path*", "/konto/:path*", "/logowanie", "/rejestracja"],
}
