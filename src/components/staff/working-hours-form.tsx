"use client"

import {useActionState} from "react"
import type {WorkingHours} from "@/generated/prisma/client"
import {saveWorkingHours, type ScheduleFormState} from "@/features/staff/schedule-actions"
import {minutesToTimeString} from "@/lib/date"

const DAY_LABELS = {
    MONDAY: "Poniedziałek",
    TUESDAY: "Wtorek",
    WEDNESDAY: "Środa",
    THURSDAY: "Czwartek",
    FRIDAY: "Piątek",
    SATURDAY: "Sobota",
    SUNDAY: "Niedziela",
} as const

const DAYS = Object.keys(DAY_LABELS) as Array<keyof typeof DAY_LABELS>

const initialState: ScheduleFormState = {}

type Props = {
    staffId: string
    workingHours: WorkingHours[]
}

export function WorkingHoursForm({staffId, workingHours}: Props) {
    const boundAction = saveWorkingHours.bind(null, staffId)
    const [state, formAction, pending] = useActionState(boundAction, initialState)

    const byDay = new Map(workingHours.map((wh) => [wh.dayOfWeek, wh]))

    return (
        <form action={formAction} className="space-y-2 max-w-2xl">
            {DAYS.map((day) => {
                const existing = byDay.get(day)
                const isActive = !!existing
                const start = existing ? minutesToTimeString(existing.startMin) : "09:00"
                const end = existing ? minutesToTimeString(existing.endMin) : "17:00"

                return (
                    <div key={day} className="flex items-center gap-3 p-2 border rounded">
                        <label className="flex items-center gap-2 w-40">
                            <input
                                type="checkbox"
                                name={`${day}_active`}
                                defaultChecked={isActive}
                                className="w-4 h-4"
                            />
                            <span>{DAY_LABELS[day]}</span>
                        </label>

                        <input
                            type="time"
                            name={`${day}_start`}
                            defaultValue={start}
                            className="border p-1 rounded"
                        />
                        <span>-</span>
                        <input
                            type="time"
                            name={`${day}_end`}
                            defaultValue={end}
                            className="border p-1 rounded"
                        />

                        {state.dayErrors?.[day] && (
                            <p className="text-red-600 text-sm ml-2">{state.dayErrors[day]}</p>
                        )}
                    </div>
                )
            })}

            {state.error && (
                <p className="text-red-600">{state.error}</p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
                {pending ? "Zapisywanie..." : "Zapisz grafik"}
            </button>
        </form>
    )
}