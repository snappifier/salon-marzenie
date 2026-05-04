'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {loginAction} from "./actions"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [pending, setPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setPending(true)
        setError(null)
        const result = await loginAction(formData)
        setPending(false)

        if (result.error) {
            setError(result.error)
            return
        }

        router.push('/admin/kalendarz')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white ">
                <div>
                    <h1 className="text-2xl font-semibold">Admin panel</h1>
                </div>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-black bg-zinc-900"
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium" htmlFor="password">
                            Hasło
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-black bg-zinc-900"
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button
                        className="w-full bg-zinc-900 text-white py-2 disabled:opacity-50"
                        type="submit"
                        disabled={pending}
                    >
                        {pending ? "Logowanie..." : "Zaloguj się"}
                    </button>
                </form>
            </div>
        </div>
    )
}