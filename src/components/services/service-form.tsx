// src/components/services/service-form.tsx
"use client"

import {useRouter} from "next/navigation"
import {useState, useTransition} from "react"
import {Field} from "@/components/ui/field"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {StickySaveBar} from "@/components/admin-shell/sticky-save-bar"
import {useToast} from "@/components/ui/toast"
import {createServiceJson, updateServiceJson} from "@/features/services/actions"
import {formatMoney, zloteToGrosze} from "@/lib/money"
import {cn} from "@/lib/cn"
import type {Service, Category} from "@/generated/prisma/client"

interface ServiceFormProps {
	className?: string
	mode: "create" | "edit"
	categories: Category[]
	initialData?: Service
}

interface FormValues {
	name: string
	description: string
	categoryId: string
	defaultDurationMin: string
	defaultBufferAfterMin: string
	priceZl: string
}

function makeInitial(c?: Service, categories: Category[] = []): FormValues {
	return {
		name: c?.name ?? "",
		description: c?.description ?? "",
		categoryId: c?.categoryId ?? categories[0]?.id ?? "",
		defaultDurationMin: String(c?.defaultDurationMin ?? 30),
		defaultBufferAfterMin: String(c?.defaultBufferAfterMin ?? 0),
		priceZl: c ? (c.defaultPriceGr / 100).toFixed(2) : "0.00",
	}
}

function isEqual(a: FormValues, b: FormValues): boolean {
	return (
		a.name === b.name
		&& a.description === b.description
		&& a.categoryId === b.categoryId
		&& a.defaultDurationMin === b.defaultDurationMin
		&& a.defaultBufferAfterMin === b.defaultBufferAfterMin
		&& a.priceZl === b.priceZl
	)
}

export function ServiceForm({className, mode, categories, initialData}: ServiceFormProps) {
	const router = useRouter()
	const toast = useToast()
	const [, startTransition] = useTransition()
	const [initial, setInitial] = useState<FormValues>(() => makeInitial(initialData, categories))
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
		if (!values.name.trim()) next.name = "Nazwa jest wymagana"
		if (!values.categoryId) next.categoryId = "Wybierz kategorię"
		const duration = Number(values.defaultDurationMin)
		if (!Number.isFinite(duration) || duration < 5 || duration > 480) {
			next.defaultDurationMin = "Między 5 a 480 minut"
		}
		const buffer = Number(values.defaultBufferAfterMin)
		if (!Number.isFinite(buffer) || buffer < 0 || buffer > 120) {
			next.defaultBufferAfterMin = "Między 0 a 120 minut"
		}
		const priceZl = Number(values.priceZl.replace(",", "."))
		if (!Number.isFinite(priceZl) || priceZl < 0) {
			next.priceZl = "Nieprawidłowa cena"
		}
		setErrors(next)
		return Object.values(next).every((v) => !v)
	}

	async function handleSubmit() {
		if (!validate()) return
		setSubmitting(true)
		try {
			const priceGr = zloteToGrosze(Number(values.priceZl.replace(",", ".")))
			const input = {
				name: values.name.trim(),
				description: values.description.trim(),
				categoryId: values.categoryId,
				defaultDurationMin: Number(values.defaultDurationMin),
				defaultBufferAfterMin: Number(values.defaultBufferAfterMin),
				defaultPriceGr: priceGr,
			}
			if (mode === "create") {
				const result = await createServiceJson(input)
				if (!result.success) {
					toast.error(result.error)
					return
				}
				toast.success("Usługa dodana")
				startTransition(() => router.push(`/admin/oferta/uslugi/${result.id}`))
			} else if (initialData) {
				const result = await updateServiceJson(initialData.id, input)
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

	const previewPriceGr = (() => {
		const n = Number(values.priceZl.replace(",", "."))
		return Number.isFinite(n) ? Math.round(n * 100) : 0
	})()

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
					label="Nazwa usługi"
					name="name"
					value={values.name}
					onChange={(e) => update("name", e.target.value)}
					error={errors.name}
					required
					placeholder="np. Manicure hybrydowy"
				/>

				<div>
					<label className="block text-[13px] font-medium text-graphite-900 mb-1.5" htmlFor="categoryId">
						Kategoria
					</label>
					<select
						className={cn(
							"w-full h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
							"transition-[border-color,box-shadow] duration-150 ease-out",
							"focus:outline-none focus:ring-3 focus:ring-rose-500/15 focus:border-rose-500",
							errors.categoryId ? "border-error" : "border-border-default",
						)}
						id="categoryId"
						name="categoryId"
						value={values.categoryId}
						onChange={(e) => update("categoryId", e.target.value)}
						required
					>
						<option value="">Wybierz kategorię...</option>
						{categories.map((c) => (
							<option key={c.id} value={c.id}>{c.name}</option>
						))}
					</select>
					{errors.categoryId && (
						<p className="text-xs text-error mt-1.5">{errors.categoryId}</p>
					)}
				</div>

				<Textarea
					label="Opis"
					name="description"
					rows={3}
					value={values.description}
					onChange={(e) => update("description", e.target.value)}
					hint="Krótki opis usługi — używany na publicznej stronie."
					error={errors.description}
				/>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Field
						label="Czas trwania (min)"
						name="defaultDurationMin"
						type="number"
						min={5}
						max={480}
						value={values.defaultDurationMin}
						onChange={(e) => update("defaultDurationMin", e.target.value)}
						error={errors.defaultDurationMin}
						required
					/>
					<Field
						label="Bufor po wykonaniu (min)"
						name="defaultBufferAfterMin"
						type="number"
						min={0}
						max={120}
						value={values.defaultBufferAfterMin}
						onChange={(e) => update("defaultBufferAfterMin", e.target.value)}
						hint="Czas na sprzątanie, reset stanowiska"
						error={errors.defaultBufferAfterMin}
					/>
				</div>

				<Field
					label="Cena (zł)"
					name="priceZl"
					type="text"
					inputMode="decimal"
					value={values.priceZl}
					onChange={(e) => update("priceZl", e.target.value)}
					hint={`Wpisz w złotówkach: 120 = ${formatMoney(previewPriceGr)}`}
					error={errors.priceZl}
					required
				/>

				{mode === "create" && (
					<div className="flex justify-end gap-2 pt-2">
						<Button variant="secondary" type="button" onClick={() => router.push("/admin/oferta")} disabled={submitting}>
							Anuluj
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Dodawanie..." : "Dodaj usługę"}
						</Button>
					</div>
				)}
			</form>

			{mode === "edit" && (
				<StickySaveBar open={isDirty} onDiscard={handleDiscard} onSave={handleSubmit} saving={submitting} />
			)}
		</>
	)
}
