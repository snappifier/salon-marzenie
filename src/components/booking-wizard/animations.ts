import type {Variants} from "motion/react"

export const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1]

export const groupVariants: Variants = {
    enter: {},
    center: {
        transition: {delayChildren: 0.08, staggerChildren: 0.04},
    },
    exit: {},
}

export const itemVariants: Variants = {
    enter: {opacity: 0, y: 6},
    center: {opacity: 1, y: 0, transition: {duration: 0.22, ease: easeOutQuint}},
    exit: {},
}
