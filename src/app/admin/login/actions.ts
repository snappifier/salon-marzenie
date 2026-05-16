'use server'

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function loginAction(prevState: any, formData: FormData) {
    try {
        await signIn("admin-credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/admin/kalendarz",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Nieprawidłowy email lub hasło" }
        }
        throw error
    }
}