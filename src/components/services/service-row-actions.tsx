"use client"

import Link from "next/link"
import {deactivateService, activateService} from "@/features/services/actions"

type Props = {
    id: string
    active: boolean
}

export function ServiceRowActions({id, active}: Props) {
    async function handleDeactivate() {
        if (!confirm("Dezaktywować usługę? Nie będzie widoczna w rezerwacjach.")) return
        await deactivateService(id)
    }

    async function handleActivate() {
        await activateService(id)
    }

    return (
        <div className="flex gap-2">
            <Link
                href={`/admin/uslugi/${id}`}
                className="px-2 py-1 border rounded text-sm"
            >
                Edytuj
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