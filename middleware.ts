import NextAuth from "next-auth"
import {authConfig} from "@/lib/auth.config"

const {auth} = NextAuth(authConfig)

export default auth((req) => {
    console.log("MIDDLEWARE HIT:", req.nextUrl.pathname, "auth:", !!req.auth)
})

export const config = {
    matcher: ["/admin/:path*"],
}