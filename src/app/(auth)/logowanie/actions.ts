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
		if (error instanceof AuthError && error.type === "CredentialsSignin") {
			if (login.includes("@")) {
				try {
					await signIn("admin-credentials", {
						email: login,
						password,
						redirectTo: "/admin",
					})
					return {error: null}
				} catch (adminError) {
					if (adminError instanceof AuthError) {
						if (adminError.type === "CredentialsSignin") {
							return {error: "Nieprawidłowy numer telefonu, email lub hasło."}
						}
						return {error: "Wystąpił nieoczekiwany błąd podczas logowania."}
					}
					throw adminError
				}
			}
			return {error: "Nieprawidłowy numer telefonu, email lub hasło."}
		}
		if (error instanceof AuthError) {
			return {error: "Wystąpił nieoczekiwany błąd podczas logowania."}
		}
		throw error
	}
}
