"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
// import { z } from "zod" ...

export async function customerLoginAction(
    prevState: any,
    formData: FormData
) {

    const login = formData.get("login") as string
    const password = formData.get("password") as string

    try {
        await signIn("customer-credentials", {
            login,
            password,
            redirectTo: "/konto",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Nieprawidłowy numer telefonu, email lub hasło." }
                default:
                    return { error: "Wystąpił nieoczekiwany błąd podczas logowania." }
            }
        }

        throw error
    }
}