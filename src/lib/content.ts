import {z} from "zod"
import siteJson from "@/content/site.json"
import landingJson from "@/content/landing.json"

const siteSchema = z.object({
    salonName: z.string().min(1),
    tagline: z.string().min(1),
    socials: z.object({
        facebook: z.string().url().optional(),
    }),
})

const landingSchema = z.object({
    hero: z.object({
        eyebrow: z.string(),
        headline: z.string(),
        headlineHighlight: z.string(),
        subtitle: z.string(),
    }),
    heroQuote: z.object({
        text: z.string(),
        author: z.string(),
        source: z.string(),
    }),
    stats: z.array(z.object({
        num: z.string(),
        suffix: z.string(),
        label: z.string(),
    })).min(1),
    brands: z.array(z.string()),
    reviews: z.array(z.object({
        text: z.string(),
        author: z.string(),
        source: z.string(),
    })).min(1),
    certs: z.array(z.object({
        name: z.string(),
        desc: z.string(),
    })),
    categoryDescriptions: z.record(z.string(), z.string()),
})

export const site = siteSchema.parse(siteJson)
export const landing = landingSchema.parse(landingJson)

export type Site = z.infer<typeof siteSchema>
export type Landing = z.infer<typeof landingSchema>