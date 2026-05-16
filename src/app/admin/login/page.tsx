'use client'

import { useActionState } from 'react'
import { loginAction } from "./actions"

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, { error: null })

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white">
                <div>
                    <h1 className="text-2xl font-semibold">Admin panel</h1>
                </div>
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-black bg-zinc-900 text-white"
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
                            className="w-full px-3 py-2 border border-black bg-zinc-900 text-white"
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-600">{state.error}</p>
                    )}

                    <button
                        className="w-full bg-zinc-900 text-white py-2 disabled:opacity-50"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? "Logowanie..." : "Zaloguj się"}
                    </button>
                </form>
            </div>
        </div>
    )
}