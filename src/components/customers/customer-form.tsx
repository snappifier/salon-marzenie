"use client"

import {useActionState} from "react"
import {useRouter} from "next/navigation"
import type {Customer} from "@/generated/prisma/client"
import type {CustomerFormState} from "@/features/customers/actions"

type Props = {
    action: (prev: CustomerFormState, formData: FormData) => Promise<CustomerFormState>
    initialData?: Customer
}

const initialState: CustomerFormState = {}

export function CustomerForm({action, initialData}: Props) {
    const [state, formAction, pending] = useActionState(action, initialState)
    const router = useRouter()

    return (
        <form action={formAction} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm mb-1">Imię *</label>
                    <input
                        name="firstName"
                        defaultValue={initialData?.firstName ?? ""}
                        className="w-full border p-2 rounded"
                        required
                    />
                    {state.fieldErrors?.firstName && (
                        <p className="text-red-600 text-sm mt-1">{state.fieldErrors.firstName[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm mb-1">Nazwisko *</label>
                    <input
                        name="lastName"
                        defaultValue={initialData?.lastName ?? ""}
                        className="w-full border p-2 rounded"
                        required
                    />
                    {state.fieldErrors?.lastName && (
                        <p className="text-red-600 text-sm mt-1">{state.fieldErrors.lastName[0]}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm mb-1">Telefon *</label>
                <input
                    name="phone"
                    type="tel"
                    defaultValue={initialData?.phone ?? ""}
                    className="w-full border p-2 rounded"
                    placeholder="+48123456789"
                    required
                />
                {state.fieldErrors?.phone && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.phone[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                    name="email"
                    type="email"
                    defaultValue={initialData?.email ?? ""}
                    className="w-full border p-2 rounded"
                />
                {state.fieldErrors?.email && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.email[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Notatki</label>
                <textarea
                    name="notes"
                    defaultValue={initialData?.notes ?? ""}
                    className="w-full border p-2 rounded"
                    rows={3}
                    placeholder="Alergie, preferencje, ważne informacje..."
                />
                <p className="text-xs text-gray-500 mt-1">
                    Widoczne tylko dla pracowników salonu
                </p>
                {state.fieldErrors?.notes && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.notes[0]}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="marketingConsent"
                    name="marketingConsent"
                    type="checkbox"
                    defaultChecked={initialData?.marketingConsent ?? false}
                    className="w-4 h-4"
                />
                <label htmlFor="marketingConsent" className="text-sm">
                    Zgoda na otrzymywanie informacji marketingowych
                </label>
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
                    onClick={() => router.push("/admin/klienci")}
                    className="px-4 py-2 border rounded"
                >
                    Anuluj
                </button>
            </div>
        </form>
    )
}