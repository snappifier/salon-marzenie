"use client"

import Link from "next/link"
import {deactivateCustomer, activateCustomer} from "@/features/customers/actions"

type Props = {
    id: string
    active: boolean
}

export function CustomerRowActions({id, active}: Props) {
    async function handleDeactivate() {
        if (!confirm("Dezaktywować klienta?")) return
        await deactivateCustomer(id)
    }

    async function handleActivate() {
        await activateCustomer(id)
    }

    return (
        <div className="flex gap-2">
            <Link
                href={`/admin/klienci/${id}`}
                className="px-2 py-1 border rounded text-sm"
            >
                Szczegóły
            </Link>
            <Link
                href={`/admin/klienci/${id}/edytuj`}
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