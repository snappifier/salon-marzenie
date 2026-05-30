"use server"

import {revalidatePath} from "next/cache"
import {z} from "zod"
import {auth} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {optionalEmailSchema, plPhoneSchema} from "@/lib/validation"
import {Prisma} from "@/generated/prisma/client"

const personalDataSchema = z.object({
	firstName: z.string().trim().min(1, "Podaj imię").max(60, "Imię jest zbyt długie"),
	lastName: z.string().trim().min(1, "Podaj nazwisko").max(60, "Nazwisko jest zbyt długie"),
	email: optionalEmailSchema,
	phone: plPhoneSchema,
})

type FieldKey = "firstName" | "lastName" | "email" | "phone"

export interface PersonalDataState {
	ok?: boolean
	error?: string
	fieldErrors?: Partial<Record<FieldKey, string>>
}

export async function updatePersonalData(
	_prev: PersonalDataState,
	formData: FormData,
): Promise<PersonalDataState> {
	const session = await auth()
	if (!session?.user?.id || session.user.role !== "customer") {
		return {error: "Brak dostępu. Zaloguj się ponownie."}
	}

	const parsed = personalDataSchema.safeParse({
		firstName: String(formData.get("firstName") ?? ""),
		lastName: String(formData.get("lastName") ?? ""),
		email: String(formData.get("email") ?? ""),
		phone: String(formData.get("phone") ?? ""),
	})

	if (!parsed.success) {
		const fieldErrors: PersonalDataState["fieldErrors"] = {}
		for (const issue of parsed.error.issues) {
			const key = issue.path[0]
			if (
				(key === "firstName" || key === "lastName" || key === "email" || key === "phone") &&
				!fieldErrors[key]
			) {
				fieldErrors[key] = issue.message
			}
		}
		return {error: "Popraw zaznaczone pola.", fieldErrors}
	}

	const {firstName, lastName, email, phone} = parsed.data

	try {
		await prisma.customer.update({
			where: {id: session.user.id},
			data: {firstName, lastName, email: email === "" ? null : email, phone},
		})
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
			const target = Array.isArray(e.meta?.target)
				? (e.meta?.target as string[]).join(",")
				: String(e.meta?.target ?? "")
			if (target.includes("email")) {
				return {error: "Ten adres email jest już używany.", fieldErrors: {email: "Adres jest już zajęty"}}
			}
			if (target.includes("phone")) {
				return {error: "Ten numer telefonu jest już używany.", fieldErrors: {phone: "Numer jest już zajęty"}}
			}
			return {error: "Podane dane są już używane przez inne konto."}
		}
		return {error: "Nie udało się zapisać zmian. Spróbuj ponownie."}
	}

	revalidatePath("/konto/dane-osobowe")
	return {ok: true}
}
