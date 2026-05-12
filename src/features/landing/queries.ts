import {cache} from "react"
import {prisma} from "@/lib/prisma"

export const getCategoriesWithMinPrice = cache(async () => {
    const categories = await prisma.category.findMany({
        where: {active: true},
        include: {
            services: {
                where: {active: true},
                select: {defaultPriceGr: true},
            },
        },
        orderBy: {order: "asc"},
    })

    return categories
        .filter((cat) => cat.services.length > 0)
        .map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            minPriceGr: Math.min(...cat.services.map((s) => s.defaultPriceGr)),
        }))
})

export const getCategoriesWithServices = cache(async () => {
    const categories = await prisma.category.findMany({
        where: {active: true},
        include: {
            services: {
                where: {active: true},
                orderBy: {name: "asc"},
                select: {
                    id: true,
                    name: true,
                    description: true,
                    defaultPriceGr: true,
                    defaultDurationMin: true,
                },
            },
        },
        orderBy: {order: "asc"},
    })

    return categories.filter((cat) => cat.services.length > 0)
})

export type CategoryWithServices = Awaited<ReturnType<typeof getCategoriesWithServices>>[number]

export type LandingCategory = Awaited<ReturnType<typeof getCategoriesWithMinPrice>>[number]