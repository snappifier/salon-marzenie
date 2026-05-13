import {describe, expect, it} from "vitest"
import {createBookingSchema, type CreateBookingInput} from "./booking-schema"

const validInput: CreateBookingInput = {
    requests: [{serviceId: "s1", staffPreference: "any"}],
    dateIso: "2026-05-15",
    startIso: "2026-05-15T10:00:00.000Z",
    customer: {
        firstName: "Anna",
        lastName: "Kowalska",
        phone: "+48123456789",
        email: "",
        customerNote: "",
        marketingConsent: false,
        createAccount: false,
        password: "",
    },
}

describe("createBookingSchema", () => {
    it("akceptuje minimalny valid input", () => {
        const result = createBookingSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it("normalizuje phone z polskiego formatu 9-cyfrowego", () => {
        const input = {
            ...validInput,
            customer: {...validInput.customer, phone: "123456789"},
        }
        const result = createBookingSchema.safeParse(input)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.customer.phone).toBe("+48123456789")
        }
    })

    it("trimuje firstName i lastName", () => {
        const input = {
            ...validInput,
            customer: {
                ...validInput.customer,
                firstName: "  Anna  ",
                lastName: "  Kowalska  ",
            },
        }
        const result = createBookingSchema.safeParse(input)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.customer.firstName).toBe("Anna")
            expect(result.data.customer.lastName).toBe("Kowalska")
        }
    })

    it("odrzuca pustą listę requests", () => {
        const input = {...validInput, requests: []}
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("akceptuje wiele usług", () => {
        const input = {
            ...validInput,
            requests: [
                {serviceId: "s1", staffPreference: "any"},
                {serviceId: "s2", staffPreference: "staff-id-123"},
                {serviceId: "s3", staffPreference: "any"},
            ],
        }
        expect(createBookingSchema.safeParse(input).success).toBe(true)
    })

    it("odrzuca dateIso w niewłaściwym formacie", () => {
        expect(createBookingSchema.safeParse({...validInput, dateIso: "15-05-2026"}).success).toBe(false)
        expect(createBookingSchema.safeParse({...validInput, dateIso: "2026-5-15"}).success).toBe(false)
        expect(createBookingSchema.safeParse({...validInput, dateIso: ""}).success).toBe(false)
    })

    it("odrzuca puste imię (po trimie)", () => {
        const input = {
            ...validInput,
            customer: {...validInput.customer, firstName: "  "},
        }
        const result = createBookingSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.some((i) => i.message.includes("Imię"))).toBe(true)
        }
    })

    it("odrzuca puste nazwisko (po trimie)", () => {
        const input = {
            ...validInput,
            customer: {...validInput.customer, lastName: ""},
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("odrzuca niepoprawny telefon", () => {
        const input = {
            ...validInput,
            customer: {...validInput.customer, phone: "xyz"},
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("odrzuca niepoprawny email", () => {
        const input = {
            ...validInput,
            customer: {...validInput.customer, email: "brakatsymbol"},
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("akceptuje pusty email gdy createAccount=false", () => {
        const result = createBookingSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    describe("createAccount refinement", () => {
        it("createAccount=true bez emaila → odrzuca", () => {
            const input = {
                ...validInput,
                customer: {
                    ...validInput.customer,
                    createAccount: true,
                    email: "",
                    password: "verylongpassword",
                },
            }
            const result = createBookingSchema.safeParse(input)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues.some((i) => i.message.includes("Konto wymaga"))).toBe(true)
            }
        })

        it("createAccount=true z hasłem < 8 znaków → odrzuca", () => {
            const input = {
                ...validInput,
                customer: {
                    ...validInput.customer,
                    createAccount: true,
                    email: "user@example.com",
                    password: "short",
                },
            }
            expect(createBookingSchema.safeParse(input).success).toBe(false)
        })

        it("createAccount=true z emailem i hasłem 8+ → akceptuje", () => {
            const input = {
                ...validInput,
                customer: {
                    ...validInput.customer,
                    createAccount: true,
                    email: "user@example.com",
                    password: "verylongpassword",
                },
            }
            expect(createBookingSchema.safeParse(input).success).toBe(true)
        })

        it("createAccount=true z hasłem dokładnie 8 znaków → akceptuje", () => {
            const input = {
                ...validInput,
                customer: {
                    ...validInput.customer,
                    createAccount: true,
                    email: "user@example.com",
                    password: "12345678",
                },
            }
            expect(createBookingSchema.safeParse(input).success).toBe(true)
        })
    })

    it("odrzuca firstName dłuższe niż 50 znaków", () => {
        const longName = "a".repeat(51)
        const input = {
            ...validInput,
            customer: {...validInput.customer, firstName: longName},
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("odrzuca customerNote dłuższy niż 2000 znaków", () => {
        const longNote = "a".repeat(2001)
        const input = {
            ...validInput,
            customer: {...validInput.customer, customerNote: longNote},
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("odrzuca request bez serviceId", () => {
        const input = {
            ...validInput,
            requests: [{serviceId: "", staffPreference: "any"}],
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })

    it("odrzuca request bez staffPreference", () => {
        const input = {
            ...validInput,
            requests: [{serviceId: "s1", staffPreference: ""}],
        }
        expect(createBookingSchema.safeParse(input).success).toBe(false)
    })
})
