'use server'

import {signIn} from "@/lib/auth"
import {AuthError} from "next-auth"

export async function loginAction(formData: FormData): Promise<{error: string | null}> {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        })
        return {error: null}
    } catch (error) {
        if (error instanceof AuthError) {
            return {error: "Nieprawidłowy email lub hasło"}
        }
        throw error
    }
}