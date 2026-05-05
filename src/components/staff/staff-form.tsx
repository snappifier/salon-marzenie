"use client"

import {useActionState} from "react"
import {useRouter} from "next/navigation"
import type {Staff} from "@/generated/prisma/client"
import type {StaffFormState} from "@/features/staff/actions"

type Props = {
    action: (prev: StaffFormState, formData: FormData) => Promise<StaffFormState>
    initialData?: Staff
}

const initialState: StaffFormState = {}

export function StaffForm({action, initialData}: Props) {
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
                <label className="block text-sm mb-1">Telefon</label>
                <input
                    name="phone"
                    type="tel"
                    defaultValue={initialData?.phone ?? ""}
                    className="w-full border p-2 rounded"
                    placeholder="+48..."
                />
                {state.fieldErrors?.phone && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.phone[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Kolor w kalendarzu *</label>
                <input
                    name="color"
                    type="color"
                    defaultValue={initialData?.color ?? "#cbd5e1"}
                    className="w-20 h-10 border rounded cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Tym kolorem podświetlone będą wizyty tego pracownika w kalendarzu
                </p>
                {state.fieldErrors?.color && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.color[0]}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Bio</label>
                <textarea
                    name="bio"
                    defaultValue={initialData?.bio ?? ""}
                    className="w-full border p-2 rounded"
                    rows={3}
                    placeholder="Opcjonalny opis dla klientów"
                />
                {state.fieldErrors?.bio && (
                    <p className="text-red-600 text-sm mt-1">{state.fieldErrors.bio[0]}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="acceptsAnyAssignment"
                    name="acceptsAnyAssignment"
                    type="checkbox"
                    defaultChecked={initialData?.acceptsAnyAssignment ?? true}
                    className="w-4 h-4"
                />
                <label htmlFor="acceptsAnyAssignment" className="text-sm">
                    Przyjmuje klientów z opcją "obojętnie kto"
                </label>
            </div>
            <p className="text-xs text-gray-500 -mt-3 ml-6">
                Jeśli wyłączysz, pracownik dostanie tylko wizyty od klientów którzy
                wybiorą go imiennie
            </p>

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
                    onClick={() => router.push("/admin/pracownicy")}
                    className="px-4 py-2 border rounded"
                >
                    Anuluj
                </button>
            </div>
        </form>
    )
}