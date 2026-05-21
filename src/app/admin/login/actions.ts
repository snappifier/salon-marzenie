'use server'

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

type LoginState = { error: string | null }

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
    try {
        await signIn("admin-credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/admin/kalendarz",
        })
        // signIn z redirectTo rzuca NEXT_REDIRECT — ten return jest nieosiągalny,
        // ale spełnia kontrakt useActionState (akcja zawsze zwraca LoginState).
        return { error: null }
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Nieprawidłowy email lub hasło" }
        }
        throw error
    }
}