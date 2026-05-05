"use client"

import {useRouter, useSearchParams} from "next/navigation"
import {useState, useTransition} from "react"

type Props = {
    initialQuery: string
}

export function CustomerSearch({initialQuery}: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(initialQuery)
    const [pending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)
        if (value.trim()) {
            params.set("q", value.trim())
        } else {
            params.delete("q")
        }
        startTransition(() => {
            router.push(`/admin/klienci?${params.toString()}`)
        })
    }

    function handleClear() {
        setValue("")
        startTransition(() => {
            router.push("/admin/klienci")
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Szukaj po imieniu, nazwisku, telefonie lub email..."
                className="flex-1 border p-2 rounded"
            />
            <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
                {pending ? "..." : "Szukaj"}
            </button>
            {initialQuery && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 border rounded"
                >
                    Wyczyść
                </button>
            )}
        </form>
    )
}