"use client"

import {useActionState} from "react"
import {useRouter} from "next/navigation"
import type {Category} from "@/generated/prisma/client"
import type {CategoryFormState} from "@/features/categories/actions"

type Props = {
    action: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>
    initialData?: Category
}

const initialState: CategoryFormState = {}

export function CategoryForm({action, initialData}: Props) {
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
                <label className="block text-sm mb-1">Slug *</label>
                <input
                    name="slug"
                    defaultValue={initialData?.slug ?? ""}
                    className="w-full border p-2 rounded"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Tylko małe litery, cyfry i myślniki. Używane w URL-ach: /uslugi/manicure
                </p>
                {state.fieldErrors?.slug && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.slug[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Kolejność</label>
                <input
                    name="order"
                    type="number"
                    defaultValue={initialData?.order ?? 0}
                    className="w-full border p-2 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Niższa liczba = wyżej na liście
                </p>
                {state.fieldErrors?.order && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.order[0]}</p>
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
                    onClick={() => router.push("/admin/kategorie")}
                    className="px-4 py-2 border rounded"
                >
                    Anuluj
                </button>
            </div>
        </form>
    )
}