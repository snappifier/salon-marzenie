"use client"

import {useEffect, useLayoutEffect, useRef, useState} from "react"
import {motion} from "motion/react"
import {usePathname} from "next/navigation"

interface Props {
    children: React.ReactNode
    className?: string
}

const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1]

// Wraps content with motion-animated height. ResizeObserver tracks inner
// content size; outer motion.div animates its CSS height between values.
// Unlike `layout` FLIP, this changes actual document flow → siblings
// (footer) follow smoothly without snapping.
//
// `overflow: clip` doesn't create a scroll container (CSS Containment L3),
// so sticky descendants still anchor to viewport.
//
// On pathname change: reset height to "auto" + disable animation for one
// tick. Without this, new page's content gets clipped at old page's height,
// breaking layout / scroll-to-hash calculations.
export function SmoothHeight({children, className}: Props) {
    const pathname = usePathname()
    const innerRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number | "auto">("auto")
    const [animEnabled, setAnimEnabled] = useState(false)

    useLayoutEffect(() => {
        setHeight("auto")
        setAnimEnabled(false)
    }, [pathname])

    useEffect(() => {
        const el = innerRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect.height
            if (typeof h !== "number") return
            setHeight(h)
            // Defer enable do następnej klatki — bieżący setHeight commit
            // (z animEnabled false) snapuje, kolejne zmiany animują.
            requestAnimationFrame(() => setAnimEnabled(true))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return (
        <motion.div
            className={className}
            animate={{height}}
            initial={false}
            transition={{height: {duration: animEnabled ? 0.4 : 0, ease: easeOutQuint}}}
            style={{overflow: "clip"}}
        >
            <div ref={innerRef}>{children}</div>
        </motion.div>
    )
}
