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

// Trim BEFORE validating, then refine: empty (po trimie) lub poprawny email.
// Dzięki temu wpisanie samych spacji traktujemy jak pusty string (graceful UX)
// i mamy kontrolę nad komunikatami błędów (z .email() w refine zamiast .or
// którego komunikat byłby z literal "expected '' got X").
export const optionalEmailSchema = z
    .string()
    .trim()
    .refine((val) => val.length <= 100, "Email jest zbyt długi")
    .refine(
        (val) => val === "" || z.string().email().safeParse(val).success,
        "Wpisz poprawny adres email",
    )