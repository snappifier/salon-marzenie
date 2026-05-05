"use client"

import {useActionState} from "react"
import type {Settings} from "@/generated/prisma/client"
import {updateSettings, type SettingsFormState} from "@/features/settings/actions"
import {minutesToTimeString} from "@/lib/date"

const initialState: SettingsFormState = {}

type Props = {
    settings: Settings
}

export function SettingsForm({settings}: Props) {
    const [state, formAction, pending] = useActionState(updateSettings, initialState)

    const openTime = settings.salonOpenMin !== null ? minutesToTimeString(settings.salonOpenMin) : ""
    const closeTime = settings.salonCloseMin !== null ? minutesToTimeString(settings.salonCloseMin) : ""

    return (
        <form action={formAction} className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-1">Salon</h2>

                <div>
                    <label className="block text-sm mb-1">Nazwa salonu *</label>
                    <input
                        name="salonName"
                        defaultValue={settings.salonName}
                        className="w-full border p-2 rounded"
                        required
                    />
                    {state.fieldErrors?.salonName && (
                        <p className="text-red-600 text-sm mt-1">{state.fieldErrors.salonName[0]}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Telefon</label>
                        <input
                            name="salonPhone"
                            type="tel"
                            defaultValue={settings.salonPhone ?? ""}
                            className="w-full border p-2 rounded"
                            placeholder="+48..."
                        />
                        {state.fieldErrors?.salonPhone && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.salonPhone[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            name="salonEmail"
                            type="email"
                            defaultValue={settings.salonEmail ?? ""}
                            className="w-full border p-2 rounded"
                        />
                        {state.fieldErrors?.salonEmail && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.salonEmail[0]}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-1">Adres</label>
                    <input
                        name="salonAddress"
                        defaultValue={settings.salonAddress ?? ""}
                        className="w-full border p-2 rounded"
                    />
                    {state.fieldErrors?.salonAddress && (
                        <p className="text-red-600 text-sm mt-1">{state.fieldErrors.salonAddress[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm mb-1">Godziny otwarcia salonu</label>
                    <div className="flex items-center gap-2">
                        <input
                            name="salonOpen"
                            type="time"
                            defaultValue={openTime}
                            className="border p-2 rounded"
                        />
                        <span>-</span>
                        <input
                            name="salonClose"
                            type="time"
                            defaultValue={closeTime}
                            className="border p-2 rounded"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Jeśli zostawisz puste, decydują grafiki pracowników. Jeśli ustawisz,
                        pracownicy nie mogą mieć grafików wykraczających poza te godziny.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-1">Polityka rezerwacji</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Min. czas anulowania (h)</label>
                        <input
                            name="minCancelHoursBefore"
                            type="number"
                            defaultValue={settings.minCancelHoursBefore}
                            className="w-full border p-2 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Klient nie może anulować w ciągu X godzin przed wizytą
                        </p>
                        {state.fieldErrors?.minCancelHoursBefore && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.minCancelHoursBefore[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Min. czas rezerwacji online (h)</label>
                        <input
                            name="minBookingHoursAhead"
                            type="number"
                            defaultValue={settings.minBookingHoursAhead}
                            className="w-full border p-2 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Klient online nie może rezerwować na "za godzinę"
                        </p>
                        {state.fieldErrors?.minBookingHoursAhead && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.minBookingHoursAhead[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Max. wyprzedzenie (dni)</label>
                        <input
                            name="maxBookingDaysAhead"
                            type="number"
                            defaultValue={settings.maxBookingDaysAhead}
                            className="w-full border p-2 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ile dni naprzód można rezerwować
                        </p>
                        {state.fieldErrors?.maxBookingDaysAhead && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.maxBookingDaysAhead[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Krok slotów (min)</label>
                        <input
                            name="slotIntervalMin"
                            type="number"
                            defaultValue={settings.slotIntervalMin}
                            className="w-full border p-2 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Co ile minut generować propozycje (zwykle 15 lub 30)
                        </p>
                        {state.fieldErrors?.slotIntervalMin && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.slotIntervalMin[0]}</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-1">Powiadomienia admina</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Telefon do powiadomień</label>
                        <input
                            name="adminNotificationPhone"
                            type="tel"
                            defaultValue={settings.adminNotificationPhone ?? ""}
                            className="w-full border p-2 rounded"
                            placeholder="+48..."
                        />
                        {state.fieldErrors?.adminNotificationPhone && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.adminNotificationPhone[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Email do powiadomień</label>
                        <input
                            name="adminNotificationEmail"
                            type="email"
                            defaultValue={settings.adminNotificationEmail ?? ""}
                            className="w-full border p-2 rounded"
                        />
                        {state.fieldErrors?.adminNotificationEmail && (
                            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.adminNotificationEmail[0]}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="adminNotifyOnCancel"
                        name="adminNotifyOnCancel"
                        type="checkbox"
                        defaultChecked={settings.adminNotifyOnCancel}
                        className="w-4 h-4"
                    />
                    <label htmlFor="adminNotifyOnCancel" className="text-sm">
                        Powiadom mnie gdy klient anuluje wizytę
                    </label>
                </div>
            </section>

            {state.error && (
                <p className="text-red-600">{state.error}</p>
            )}

            {state.success && (
                <p className="text-green-600">Ustawienia zapisane.</p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
                {pending ? "Zapisywanie..." : "Zapisz"}
            </button>
        </form>
    )
}