"use client"

import Link from "next/link";
import {usePathname} from "next/navigation";
import {logoutAction} from "./actions"

const links = [
    {href: "/admin/kalendarz", label: "Kalendarz"},
    {href: "/admin/pracownicy", label: "Pracownicy"},
    {href: "/admin/uslugi", label: "Usługi"},
    {href: "/admin/klienci", label: "Klienci"},
    {href: "/admin/ustawienia", label: "Ustawienia"},
]

export function Sidebar({userName}: {userName: string}) {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-zinc-200bg-zinc-950 flex flex-col">
            <div className="p-6">
                <h1 className=" font-semibold text-lg">Admin panel</h1>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href)
                    return (
                        <Link
                            className="block relative px-3 py-2 text-sm font-medium"
                            key={link.href}
                            href={link.href}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-zinc-200" />
                            )}
                            <span className={`relative ${isActive ? "text-zinc-900" : "text-zinc-500"}`}>
                                {link.label}
                            </span>
                        </Link>

                    )
                })}
            </nav>

            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="px-3 py-2 mb-1">
                    <p className="text-xs text-zinc-500">Zalogowano jako</p>
                    <p className="text-sm font-medium truncate">{userName}</p>
                </div>
                <form action={logoutAction}>
                    <button
                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                        type="submit"
                    >
                        Wyloguj się
                    </button>
                </form>
            </div>
        </aside>
    )
}