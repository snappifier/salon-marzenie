"use client"

import {useActionState, useState} from "react"
import type {TimeOff} from "@/generated/prisma/client"
import {addTimeOff, deleteTimeOff, type TimeOffFormState} from "@/features/staff/schedule-actions"
import {formatDate} from "@/lib/date"

const initialState: TimeOffFormState = {}

type Props = {
    staffId: string
    timeOffs: TimeOff[]
}

export function TimeOffSection({staffId, timeOffs}: Props) {
    const [showForm, setShowForm] = useState(false)
    const boundAdd = addTimeOff.bind(null, staffId)
    const [state, formAction, pending] = useActionState(boundAdd, initialState)

    async function handleDelete(id: string) {
        if (!confirm("Usunąć ten urlop?")) return
        await deleteTimeOff(id, staffId)
    }

    return (
        <div className="space-y-3 max-w-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Urlopy i nieobecności</h2>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="px-3 py-1 border rounded text-sm"
                >
                    {showForm ? "Anuluj" : "Dodaj urlop"}
                </button>
            </div>

            {showForm && (
                <form action={formAction} className="p-3 border rounded space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm mb-1">Od *</label>
                            <input
                                name="startAt"
                                type="datetime-local"
                                className="w-full border p-2 rounded"
                                required
                            />
                            {state.fieldErrors?.startAt && (
                                <p className="text-red-600 text-sm mt-1">{state.fieldErrors.startAt[0]}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Do *</label>
                            <input
                                name="endAt"
                                type="datetime-local"
                                className="w-full border p-2 rounded"
                                required
                            />
                            {state.fieldErrors?.endAt && (
                                <p className="text-red-600 text-sm mt-1">{state.fieldErrors.endAt[0]}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Powód</label>
                        <input
                            name="reason"
                            className="w-full border p-2 rounded"
                            placeholder="np. urlop wypoczynkowy"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={pending}
                        className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                    >
                        {pending ? "Dodawanie..." : "Dodaj"}
                    </button>
                </form>
            )}

            {timeOffs.length === 0 ? (
                <p className="text-gray-500 text-sm">Brak nadchodzących urlopów.</p>
            ) : (
                <ul className="space-y-2">
                    {timeOffs.map((to) => (
                        <li key={to.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                                <span>{formatDate(to.startAt)} - {formatDate(to.endAt)}</span>
                                {to.reason && <span className="text-gray-500 ml-2">({to.reason})</span>}
                            </div>
                            <button
                                onClick={() => handleDelete(to.id)}
                                className="px-2 py-1 border rounded text-sm text-red-600"
                            >
                                Usuń
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}