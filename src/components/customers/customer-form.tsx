// src/components/customers/customer-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState, useTransition} from "react"
import {Field} from "@/components/ui/field"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {CheckboxField} from "@/components/ui/checkbox-field"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {useToast} from "@/components/ui/toast"
import {createCustomerJson, updateCustomerJson} from "@/features/customers/actions"
import {cn} from "@/lib/cn"
import type {Customer} from "@/generated/prisma/client"

interface CustomerFormProps {
	className?: string
	mode: "create" | "edit"
	initialData?: Customer
}

interface FormValues {
	firstName: string
	lastName: string
	phone: string
	email: string
	notes: string
	marketingConsent: boolean
}

function makeInitial(c?: Customer): FormValues {
	return {
		firstName: c?.firstName ?? "",
		lastName: c?.lastName ?? "",
		phone: c?.phone ?? "",
		email: c?.email ?? "",
		notes: c?.notes ?? "",
		marketingConsent: c?.marketingConsent ?? false,
	}
}

function isEqual(a: FormValues, b: FormValues): boolean {
	return (
		a.firstName === b.firstName
		&& a.lastName === b.lastName
		&& a.phone === b.phone
		&& a.email === b.email
		&& a.notes === b.notes
		&& a.marketingConsent === b.marketingConsent
	)
}

export function CustomerForm({className, mode, initialData}: CustomerFormProps) {
	const router = useRouter()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [initial, setInitial] = useState<FormValues>(() => makeInitial(initialData))
	const [values, setValues] = useState<FormValues>(initial)
	const [errors, setErrors] = useState<Record<string, string | undefined>>({})
	const [submitting, setSubmitting] = useState(false)
	const isDirty = !isEqual(initial, values)

	function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
		setValues((prev) => ({...prev, [key]: value}))
		if (errors[key]) setErrors((e) => ({...e, [key]: undefined}))
	}

	function validate(): boolean {
		const next: Record<string, string | undefined> = {}
		if (!values.firstName.trim()) next.firstName = "Imię jest wymagane"
		if (!values.lastName.trim()) next.lastName = "Nazwisko jest wymagane"
		if (!values.phone.trim()) next.phone = "Telefon jest wymagany"
		if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
			next.email = "Nieprawidłowy email"
		}
		setErrors(next)
		return Object.values(next).every((v) => !v)
	}

	async function handleSubmit() {
		if (!validate()) return
		setSubmitting(true)
		try {
			if (mode === "create") {
				const result = await createCustomerJson(values)
				if (!result.success) {
					toast.error(result.error)
					return
				}
				toast.success("Klient dodany")
				startTransition(() => router.push(`/admin/klienci/${result.id}`))
			} else if (initialData) {
				const result = await updateCustomerJson(initialData.id, values)
				if (!result.success) {
					toast.error(result.error)
					return
				}
				toast.success("Zapisano zmiany")
				setInitial(values)
				startTransition(() => router.refresh())
			}
		} finally {
			setSubmitting(false)
		}
	}

	function handleDiscard() {
		setValues(initial)
		setErrors({})
	}

	return (
		<>
			<form
				className={cn("flex flex-col gap-5 pb-32", className)}
				onSubmit={(e) => {
					e.preventDefault()
					handleSubmit()
				}}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Field
						label="Imię"
						name="firstName"
						value={values.firstName}
						onChange={(e) => update("firstName", e.target.value)}
						error={errors.firstName}
						required
						autoComplete="given-name"
					/>
					<Field
						label="Nazwisko"
						name="lastName"
						value={values.lastName}
						onChange={(e) => update("lastName", e.target.value)}
						error={errors.lastName}
						required
						autoComplete="family-name"
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Field
						label="Telefon"
						name="phone"
						type="tel"
						value={values.phone}
						onChange={(e) => update("phone", e.target.value)}
						error={errors.phone}
						hint="Format: +48123456789"
						required
						autoComplete="tel"
					/>
					<Field
						label="Email"
						name="email"
						type="email"
						value={values.email}
						onChange={(e) => update("email", e.target.value)}
						error={errors.email}
						autoComplete="email"
					/>
				</div>

				<Textarea
					label="Notatka"
					name="notes"
					rows={4}
					value={values.notes}
					onChange={(e) => update("notes", e.target.value)}
					hint="Alergie, preferencje, ważne informacje — widoczne tylko dla salonu."
					error={errors.notes}
				/>

				<div className="rounded-2xl bg-white border border-border-soft p-4 sm:p-5 flex flex-col gap-4">
					<CheckboxField
						name="marketingConsent"
						label="Zgoda marketingowa"
						description="Klient zgadza się na otrzymywanie informacji o promocjach i nowościach."
						checked={values.marketingConsent}
						onChange={(e) => update("marketingConsent", e.target.checked)}
					/>
					{mode === "edit" && initialData && (
						<div className="flex items-center gap-3 text-sm text-graphite-600 pt-3 border-t border-border-soft/60">
							<span
								className={cn(
									"inline-flex items-center justify-center w-5 h-5 rounded-md border",
									initialData.hasAccount
										? "bg-rose-50 border-rose-200 text-rose-600"
										: "bg-warm border-border-default text-graphite-400",
								)}
								aria-hidden="true"
							>
								{initialData.hasAccount && (
									<span className="w-2 h-2 rounded-full bg-rose-500" />
								)}
							</span>
							<span>
								{initialData.hasAccount
									? "Posiada konto klienta (może się logować)"
									: "Nie posiada konta klienta"}
							</span>
						</div>
					)}
				</div>

				{mode === "create" && (
					<div className="flex justify-end gap-2 pt-2">
						<Button variant="secondary" type="button" onClick={() => router.push("/admin/klienci")} disabled={submitting}>
							Anuluj
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Dodawanie..." : "Dodaj klientkę"}
						</Button>
					</div>
				)}
			</form>

			{mode === "edit" && (
				<StickySaveBar
					open={isDirty}
					onDiscard={handleDiscard}
					onSave={handleSubmit}
					saving={submitting}
				/>
			)}
		</>
	)
}
