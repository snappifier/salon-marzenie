"use client"

import Link from "next/link"
import {deactivateCategory, activateCategory} from "@/features/categories/actions"

type Props = {
    id: string
    active: boolean
}

export function CategoryRowActions({id, active}: Props) {
    async function handleDeactivate() {
        if (!confirm("Dezaktywować kategorię? Usługi w niej zostaną, ale nie pokaże się w wizardzie rezerwacji.")) return
        await deactivateCategory(id)
    }

    async function handleActivate() {
        await activateCategory(id)
    }

    return (
        <div className="flex gap-2">
            <Link
                href={`/admin/kategorie/${id}`}
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