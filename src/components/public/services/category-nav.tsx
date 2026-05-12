"use client"

import {useEffect, useRef, useState} from "react"
import {Container} from "@/components/ui/container"
import {cn} from "@/lib/cn"

interface Category {
    id: string
    name: string
    slug: string
}

interface Props {
    categories: Category[]
}

export function CategoryNav({categories}: Props) {
    const [activeSlug, setActiveSlug] = useState<string | null>(categories[0]?.slug ?? null)
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSlug(entry.target.id)
                    }
                }
            },
            {rootMargin: "-30% 0px -65% 0px", threshold: 0},
        )

        for (const cat of categories) {
            const el = document.getElementById(cat.slug)
            if (el) observer.observe(el)
        }

        return () => observer.disconnect()
    }, [categories])

    useEffect(() => {
        if (!activeSlug) return
        const pill = navRef.current?.querySelector(`[data-slug="${activeSlug}"]`)
        if (pill instanceof HTMLElement) {
            pill.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"})
        }
    }, [activeSlug])

    return (
        <nav
            aria-label="Kategorie usług"
            className="sticky top-[60px] z-40 bg-cream/92 backdrop-blur-md backdrop-saturate-150 border-y border-border-soft"
        >
            <Container>
                <div
                    ref={navRef}
                    className="flex gap-2 py-3 overflow-x-auto overflow-y-hidden scrollbar-none"
                >
                    {categories.map((cat) => {
                        const isActive = activeSlug === cat.slug
                        return (
                            <a
                                key={cat.id}
                                href={`#${cat.slug}`}
                                data-slug={cat.slug}
                                className={cn(
                                    "shrink-0 text-[13px] font-medium px-4 py-2 rounded-full border whitespace-nowrap transition-[background-color,color,border-color] duration-200 ease-out",
                                    isActive
                                        ? "bg-rose-500 text-white border-rose-500"
                                        : "bg-transparent text-graphite-600 border-border-default hover-supported:hover:border-rose-300 hover-supported:hover:text-rose-600",
                                )}
                            >
                                {cat.name}
                            </a>
                        )
                    })}
                </div>
            </Container>
        </nav>
    )
}