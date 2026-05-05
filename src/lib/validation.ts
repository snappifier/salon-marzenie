import {z} from "zod"

function normalizePhone(val: string): string | null {
    const cleaned = val.replace(/[\s\-()]/g, "")

    if (/^\d{9}$/.test(cleaned)) return `+48${cleaned}`

    if (/^0048\d{9}$/.test(cleaned)) return `+48${cleaned.slice(4)}`

    if (/^48\d{9}$/.test(cleaned)) return `+48${cleaned.slice(2)}`

    if (/^\+\d{7,15}$/.test(cleaned)) return cleaned

    return null
}

const PHONE_ERROR = "Wpisz numer (9 cyfr dla numeru polskiego lub międzynarodowy z prefiksem +)"

export const plPhoneSchema = z.string().trim().transform((val, ctx) => {
    const normalized = normalizePhone(val)
    if (!normalized) {
        ctx.addIssue({code: "custom", message: PHONE_ERROR})
        return z.NEVER
    }
    return normalized
})

export const plPhoneOptionalSchema = z.string().trim().transform((val, ctx) => {
    if (!val) return null
    const normalized = normalizePhone(val)
    if (!normalized) {
        ctx.addIssue({code: "custom", message: PHONE_ERROR})
        return z.NEVER
    }
    return normalized
})