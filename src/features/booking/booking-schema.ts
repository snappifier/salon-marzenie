import {z} from "zod"
import {optionalEmailSchema, plPhoneSchema} from "@/lib/validation"

// Schema dla createBooking. Wyciągnięty z public-actions.ts żeby:
// 1) plik "use server" mógł eksportować tylko Server Actions (zod schemas
//    nie są async functions więc kompilator by się czepiał)
// 2) Możemy testować schema niezależnie od Server Action / Prismy.
export const createBookingSchema = z.object({
    requests: z
        .array(
            z.object({
                serviceId: z.string().min(1),
                staffPreference: z.string().min(1),
            }),
        )
        .min(1),
    dateIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startIso: z.string().min(1),
    customer: z
        .object({
            firstName: z.string().trim().min(1, "Imię jest wymagane").max(50),
            lastName: z.string().trim().min(1, "Nazwisko jest wymagane").max(50),
            phone: plPhoneSchema,
            email: optionalEmailSchema,
            customerNote: z.string().trim().max(2000).optional().or(z.literal("")),
            marketingConsent: z.boolean(),
            createAccount: z.boolean(),
            password: z.string().optional().or(z.literal("")),
        })
        .refine(
            (c) => !c.createAccount || ((c.email?.length ?? 0) > 0 && (c.password?.length ?? 0) >= 8),
            {message: "Konto wymaga emaila i hasła min. 8 znaków"},
        ),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export type CreateBookingResult =
    | {success: true; bookingId: string; manageToken: string}
    | {success: false; error: string}
