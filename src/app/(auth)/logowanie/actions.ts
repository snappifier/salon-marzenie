"use server"

import {AuthError} from "next-auth"
import {signIn} from "@/lib/auth"

export interface LoginState {
	error: string | null
}

export async function customerLoginAction(
	_prevState: LoginState,
	formData: FormData,
): Promise<LoginState> {
	const login = formData.get("login") as string
	const password = formData.get("password") as string

	try {
		await signIn("customer-credentials", {
			login,
			password,
			redirectTo: "/konto",
		})
		return {error: null}
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return {error: "Nieprawidłowy numer telefonu, email lub hasło."}
				default:
					return {error: "Wystąpił nieoczekiwany błąd podczas logowania."}
			}
		}
		throw error
	}
}
