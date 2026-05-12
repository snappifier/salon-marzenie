"use client"

import {motion, type Variants} from "motion/react"
import {cn} from "@/lib/cn"

const variants: Variants = {
    hidden: {opacity: 0, y: 16},
    visible: {opacity: 1, y: 0},
}

interface Props {
    children: React.ReactNode
    delay?: number
    className?: string
    as?: "div" | "section" | "article"
}

export function Reveal({children, delay = 0, className, as = "div"}: Props) {
    const Component = motion[as]

    return (
        <Component
            className={cn(className)}
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, margin: "-50px"}}
            transition={{duration: 0.5, ease: [0.23, 1, 0.32, 1], delay}}
        >
            {children}
        </Component>
    )
}