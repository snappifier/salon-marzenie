// src/components/staff/staff-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState, useTransition} from "react"
import {Field} from "@/components/ui/field"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {CheckboxField} from "@/components/ui/checkbox-field"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {useToast} from "@/components/ui/toast"
import {createStaffJson, updateStaffJson} from "@/features/staff/actions"
import {cn} from "@/lib/cn"
import type {Staff} from "@/generated/prisma/client"

interface StaffFormProps {
	className?: string
	mode: "create" | "edit"
	initialData?: Staff
}

interface FormValues {
	firstName: string
	lastName: string
	email: string
	phone: string
	color: string
	bio: string
	acceptsAnyAssignment: boolean
}

const PRESET_COLORS = ["#C68895", "#9A6671", "#6F8C6E", "#C49464", "#7A8CA3", "#A38CB0", "#B25C5C", "#8C857F"]

function makeInitial(s?: Staff): FormValues {
	return {
		firstName: s?.firstName ?? "",
		lastName: s?.lastName ?? "",
		email: s?.email ?? "",
		phone: s?.phone ?? "",
		color: s?.color ?? PRESET_COLORS[0],
		bio: s?.bio ?? "",
		acceptsAnyAssignment: s?.acceptsAnyAssignment ?? true,
	}
}

function isEqual(a: FormValues, b: FormValues): boolean {
	return (
		a.firstName === b.firstName
		&& a.lastName === b.lastName
		&& a.email === b.email
		&& a.phone === b.phone
		&& a.color === b.color
		&& a.bio === b.bio
		&& a.acceptsAnyAssignment === b.acceptsAnyAssignment
	)
}

export function StaffForm({className, mode, initialData}: StaffFormProps) {
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
		if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Nieprawidłowy email"
		if (!/^#[0-9a-fA-F]{6}$/.test(values.color)) next.color = "Kolor w formacie #rrggbb"
		setErrors(next)
		return Object.values(next).every((v) => !v)
	}

	async function handleSubmit() {
		if (!validate()) return
		setSubmitting(true)
		try {
			const input = {
				firstName: values.firstName.trim(),
				lastName: values.lastName.trim(),
				email: values.email.trim(),
				phone: values.phone.trim(),
				color: values.color,
				bio: values.bio.trim(),
				acceptsAnyAssignment: values.acceptsAnyAssignment,
			}
			if (mode === "create") {
				const r = await createStaffJson(input)
				if (!r.success) {
					toast.error(r.error)
					return
				}
				toast.success("Pracownik dodany")
				startTransition(() => router.push(`/admin/zespol/${r.id}`))
			} else if (initialData) {
				const r = await updateStaffJson(initialData.id, input)
				if (!r.success) {
					toast.error(r.error)
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

	function discard() {
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
						label="Email"
						name="email"
						type="email"
						value={values.email}
						onChange={(e) => update("email", e.target.value)}
						error={errors.email}
						autoComplete="email"
					/>
					<Field
						label="Telefon"
						name="phone"
						type="tel"
						value={values.phone}
						onChange={(e) => update("phone", e.target.value)}
						error={errors.phone}
						autoComplete="tel"
					/>
				</div>

				<div>
					<span className="block text-[13px] font-medium text-graphite-900 mb-2">
						Kolor w kalendarzu
					</span>
					<div className="flex items-center gap-3 flex-wrap">
						<div className="flex items-center gap-2 flex-wrap">
							{PRESET_COLORS.map((c) => (
								<button
									key={c}
									type="button"
									className={cn(
										"w-8 h-8 rounded-full transition-transform duration-150 ease-out active:scale-[0.9]",
										values.color.toLowerCase() === c.toLowerCase()
											? "ring-2 ring-offset-2 ring-offset-white ring-graphite-900"
											: "hover-supported:hover:scale-110",
									)}
									style={{backgroundColor: c}}
									aria-label={`Wybierz kolor ${c}`}
									aria-pressed={values.color.toLowerCase() === c.toLowerCase()}
									onClick={() => update("color", c)}
								/>
							))}
						</div>
						<label className="inline-flex items-center gap-2 cursor-pointer">
							<input
								className="w-9 h-9 rounded-md border border-border-default cursor-pointer bg-white p-0.5"
								type="color"
								value={values.color}
								onChange={(e) => update("color", e.target.value)}
								aria-label="Własny kolor"
							/>
							<span className="text-xs text-graphite-500 tabular-nums uppercase">{values.color}</span>
						</label>
					</div>
					{errors.color && <p className="text-xs text-error mt-1.5">{errors.color}</p>}
				</div>

				<Textarea
					label="Bio"
					name="bio"
					rows={3}
					value={values.bio}
					onChange={(e) => update("bio", e.target.value)}
					hint="Krótki opis — może być pokazany na publicznej stronie."
					error={errors.bio}
				/>

				<div className="rounded-2xl bg-white border border-border-soft p-4 sm:p-5">
					<CheckboxField
						name="acceptsAnyAssignment"
						label="Przyjmuje dowolne wizyty"
						description="Gdy zaznaczone, klient wybierający dowolnego pracownika może trafić do tej osoby."
						checked={values.acceptsAnyAssignment}
						onChange={(e) => update("acceptsAnyAssignment", e.target.checked)}
					/>
				</div>

				{mode === "create" && (
					<div className="flex justify-end gap-2 pt-2">
						<Button variant="secondary" type="button" onClick={() => router.push("/admin/zespol")} disabled={submitting}>
							Anuluj
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Dodawanie..." : "Dodaj pracownika"}
						</Button>
					</div>
				)}
			</form>

			{mode === "edit" && (
				<StickySaveBar open={isDirty} onDiscard={discard} onSave={handleSubmit} saving={submitting} />
			)}
		</>
	)
}
