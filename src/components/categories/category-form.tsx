// src/components/categories/category-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState, useTransition} from "react"
import {Field} from "@/components/ui/field"
import {Button} from "@/components/ui/button"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {useToast} from "@/components/ui/toast"
import {createCategoryJson, updateCategoryJson} from "@/features/categories/actions"
import {cn} from "@/lib/cn"
import type {Category} from "@/generated/prisma/client"

interface CategoryFormProps {
	className?: string
	mode: "create" | "edit"
	initialData?: Category
}

interface FormValues {
	name: string
	slug: string
	order: string
}

function makeInitial(c?: Category): FormValues {
	return {
		name: c?.name ?? "",
		slug: c?.slug ?? "",
		order: String(c?.order ?? 0),
	}
}

function slugify(input: string): string {
	const map: Record<string, string> = {
		ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
		Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n", Ó: "o", Ś: "s", Ź: "z", Ż: "z",
	}
	return input
		.split("")
		.map((c) => map[c] ?? c)
		.join("")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

function isEqual(a: FormValues, b: FormValues): boolean {
	return a.name === b.name && a.slug === b.slug && a.order === b.order
}

export function CategoryForm({className, mode, initialData}: CategoryFormProps) {
	const router = useRouter()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [initial, setInitial] = useState<FormValues>(() => makeInitial(initialData))
	const [values, setValues] = useState<FormValues>(initial)
	const [slugTouched, setSlugTouched] = useState(false)
	const [errors, setErrors] = useState<Record<string, string | undefined>>({})
	const [submitting, setSubmitting] = useState(false)
	const isDirty = !isEqual(initial, values)

	function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
		setValues((prev) => ({...prev, [key]: value}))
		if (errors[key]) setErrors((e) => ({...e, [key]: undefined}))
	}

	function handleNameChange(next: string) {
		update("name", next)
		if (!slugTouched && mode === "create") {
			update("slug", slugify(next))
		}
	}

	function validate(): boolean {
		const next: Record<string, string | undefined> = {}
		if (!values.name.trim()) next.name = "Nazwa jest wymagana"
		if (!values.slug.trim()) next.slug = "Slug jest wymagany"
		if (values.slug && !/^[a-z0-9-]+$/.test(values.slug)) {
			next.slug = "Tylko małe litery, cyfry i myślniki"
		}
		const order = Number(values.order)
		if (!Number.isFinite(order) || order < 0 || order > 999) {
			next.order = "Liczba od 0 do 999"
		}
		setErrors(next)
		return Object.values(next).every((v) => !v)
	}

	async function handleSubmit() {
		if (!validate()) return
		setSubmitting(true)
		try {
			const input = {
				name: values.name.trim(),
				slug: values.slug.trim(),
				order: Number(values.order),
			}
			if (mode === "create") {
				const r = await createCategoryJson(input)
				if (!r.success) {
					toast.error(r.error)
					return
				}
				toast.success("Kategoria dodana")
				startTransition(() => router.push("/admin/oferta?sub=kategorie"))
			} else if (initialData) {
				const r = await updateCategoryJson(initialData.id, input)
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
				<Field
					label="Nazwa"
					name="name"
					value={values.name}
					onChange={(e) => handleNameChange(e.target.value)}
					error={errors.name}
					placeholder="np. Manicure"
					required
				/>

				<Field
					label="Slug"
					name="slug"
					value={values.slug}
					onChange={(e) => {
						setSlugTouched(true)
						update("slug", e.target.value)
					}}
					hint={`Używany w URL: /uslugi/${values.slug || "twoj-slug"}`}
					error={errors.slug}
					required
				/>

				<Field
					label="Kolejność"
					name="order"
					type="number"
					min={0}
					max={999}
					value={values.order}
					onChange={(e) => update("order", e.target.value)}
					hint="Niższa liczba = wyżej na liście"
					error={errors.order}
				/>

				{mode === "create" && (
					<div className="flex justify-end gap-2 pt-2">
						<Button variant="secondary" type="button" onClick={() => router.push("/admin/oferta?sub=kategorie")} disabled={submitting}>
							Anuluj
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Dodawanie..." : "Dodaj kategorię"}
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
