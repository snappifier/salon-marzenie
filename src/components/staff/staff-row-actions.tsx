"use client"

import Link from "next/link"
import {deactivateStaff, activateStaff} from "@/features/staff/actions"

type Props = {
    id: string
    active: boolean
}

export function StaffRowActions({id, active}: Props) {
    async function handleDeactivate() {
        if (!confirm("Dezaktywować pracownika? Nie pojawi się już w wizardzie rezerwacji, ale historia wizyt zostanie.")) return
        await deactivateStaff(id)
    }

    async function handleActivate() {
        await activateStaff(id)
    }

    return (
        <div className="flex gap-2">
            <Link
                href={`/admin/pracownicy/${id}`}
                className="px-2 py-1 border rounded text-sm"
            >
                Edytuj
            </Link>
            <Link
                href={`/admin/pracownicy/${id}/grafik`}
                className="px-2 py-1 border rounded text-sm"
            >
                Grafik
            </Link>
            <Link
                href={`/admin/pracownicy/${id}/uslugi`}
                className="px-2 py-1 border rounded text-sm"
            >
                Usługi
            </Link>
            {active ? (
                <button
                    onClick={handleDeactivate}
                    className="px-2 py-1 border rounded text-sm text-red-600"
                >
                    Dezaktywuj
                </button>
            ) : (
                <button
                    onClick={handleActivate}
                    className="px-2 py-1 border rounded text-sm text-green-600"
                >
                    Aktywuj
                </button>
            )}
        </div>
    )
}