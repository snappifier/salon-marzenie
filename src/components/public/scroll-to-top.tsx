"use client"

import {useLayoutEffect} from "react"
import {usePathname} from "next/navigation"

// Po zmianie pathname przewija na górę strony. Jeśli URL ma hash
// (np. /#kontakt, /#opinie) — nie nadpisuje, niech browser/Next.js
// zrobi natywny scroll-to-hash do właściwej sekcji.
//
// `useLayoutEffect` żeby scroll wykonał się przed paintem nowej strony
// (brak wizualnego skoku ze starego scroll position).
export function ScrollToTop() {
    const pathname = usePathname()

    useLayoutEffect(() => {
        if (typeof window === "undefined") return
        if (window.location.hash) return
        window.scrollTo({top: 0, behavior: "instant" as ScrollBehavior})
    }, [pathname])

    return null
}
