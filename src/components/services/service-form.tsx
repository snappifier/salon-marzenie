"use client"

import {useActionState} from "react"
import {useRouter} from "next/navigation"
import type {Service, Category} from "@/generated/prisma/client"
import type {ServiceFormState} from "@/features/services/actions"

type Props = {
    action: (prev: ServiceFormState, formData: FormData) => Promise<ServiceFormState>
    categories: Category[]
    initialData?: Service
}

const initialState: ServiceFormState = {}

export function ServiceForm({action, categories, initialData}: Props) {
    const [state, formAction, pending] = useActionState(action, initialState)
    const router = useRouter()

    return (
        <form action={formAction} className="space-y-4 max-w-xl">
            <div>
                <label className="block text-sm mb-1">Nazwa *</label>
                <input
                    name="name"
                    defaultValue={initialData?.name ?? ""}
                    className="w-full border p-2 rounded"
                    required
                />
                {state.fieldErrors?.name && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.name[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Kategoria *</label>
                <select
                    name="categoryId"
                    defaultValue={initialData?.categoryId ?? ""}
                    className="w-full border p-2 rounded"
                    required
                >
                    <option value="">Wybierz kategorię...</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {state.fieldErrors?.categoryId && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.categoryId[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Opis</label>
                <textarea
                    name="description"
                    defaultValue={initialData?.description ?? ""}
                    className="w-full border p-2 rounded"
                    rows={3}
                />
                {state.fieldErrors?.description && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.description[0]}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm mb-1">Czas trwania (min) *</label>
                    <input
                        name="defaultDurationMin"
                        type="number"
                        defaultValue={initialData?.defaultDurationMin ?? 30}
                        className="w-full border p-2 rounded"
                        required
                    />
                    {state.fieldErrors?.defaultDurationMin && (
                        <p className="text-red-600 text-sm mt-1">{state.fieldErrors.defaultDurationMin[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm mb-1">Bufor po wykonaniu (min)</label>
                    <input
                        name="defaultBufferAfterMin"
                        type="number"
                        defaultValue={initialData?.defaultBufferAfterMin ?? 0}
                        className="w-full border p-2 rounded"
                    />
                    {state.fieldErrors?.defaultBufferAfterMin && (
                        <p className="text-red-600 text-sm mt-1">{state.fieldErrors.defaultBufferAfterMin[0]}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm mb-1">Cena (w groszach) *</label>
                <input
                    name="defaultPriceGr"
                    type="number"
                    defaultValue={initialData?.defaultPriceGr ?? 0}
                    className="w-full border p-2 rounded"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Wpisz w groszach: 12000 = 120,00 zł
                </p>
                {state.fieldErrors?.defaultPriceGr && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.defaultPriceGr[0]}</p>
                )}
            </div>

            {state.error && (
                <p className="text-red-600">{state.error}</p>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                    {pending ? "Zapisywanie..." : "Zapisz"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/admin/uslugi")}
                    className="px-4 py-2 border rounded"
                >
                    Anuluj
                </button>
            </div>
        </form>
    )
}