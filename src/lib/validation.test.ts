import {describe, expect, it} from "vitest"
import {optionalEmailSchema, plPhoneSchema, plPhoneOptionalSchema} from "./validation"

describe("plPhoneSchema", () => {
    it("akceptuje 9-cyfrowy polski numer i dodaje +48", () => {
        const result = plPhoneSchema.safeParse("123456789")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("+48123456789")
    })

    it("akceptuje format 0048 i przekształca na +48", () => {
        const result = plPhoneSchema.safeParse("0048123456789")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("+48123456789")
    })

    it("akceptuje format 48xxx (bez 00 i bez +) i przekształca na +48", () => {
        const result = plPhoneSchema.safeParse("48123456789")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("+48123456789")
    })

    it("akceptuje numer międzynarodowy z prefiksem + (np. niemiecki)", () => {
        const result = plPhoneSchema.safeParse("+491234567890")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("+491234567890")
    })

    it("usuwa spacje, myślniki, nawiasy przed walidacją", () => {
        const result = plPhoneSchema.safeParse("+48 (123) 456-789")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("+48123456789")
    })

    it("odrzuca za krótki numer", () => {
        expect(plPhoneSchema.safeParse("12345").success).toBe(false)
    })

    it("odrzuca za długi numer", () => {
        // 9 cyfr - wymaga +48 prefiksu lub bez. 10 cyfr bez prefiksu odrzucone.
        expect(plPhoneSchema.safeParse("1234567890").success).toBe(false)
    })

    it("odrzuca pusty string", () => {
        expect(plPhoneSchema.safeParse("").success).toBe(false)
    })

    it("odrzuca litery", () => {
        expect(plPhoneSchema.safeParse("abc456789").success).toBe(false)
    })

    it("odrzuca + bez cyfr", () => {
        expect(plPhoneSchema.safeParse("+").success).toBe(false)
    })
})

describe("plPhoneOptionalSchema", () => {
    it("zwraca null dla pustego stringa", () => {
        const result = plPhoneOptionalSchema.safeParse("")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBeNull()
    })

    it("waliduje poprawny numer", () => {
        const result = plPhoneOptionalSchema.safeParse("123456789")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("+48123456789")
    })

    it("odrzuca błędny numer", () => {
        expect(plPhoneOptionalSchema.safeParse("xyz").success).toBe(false)
    })
})

describe("optionalEmailSchema", () => {
    it("akceptuje typowy email", () => {
        const result = optionalEmailSchema.safeParse("test@example.com")
        expect(result.success).toBe(true)
    })

    it("akceptuje email z subdomeną i wieloma kropkami w domenie", () => {
        expect(optionalEmailSchema.safeParse("user@mail.example.co.uk").success).toBe(true)
    })

    it("akceptuje email z plusem (gmail aliasy)", () => {
        expect(optionalEmailSchema.safeParse("user+tag@gmail.com").success).toBe(true)
    })

    it("akceptuje pusty string (opcjonalne pole)", () => {
        expect(optionalEmailSchema.safeParse("").success).toBe(true)
    })

    it("trimuje białe znaki", () => {
        const result = optionalEmailSchema.safeParse("  test@example.com  ")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("test@example.com")
    })

    it("odrzuca email bez @", () => {
        expect(optionalEmailSchema.safeParse("brakatsymbol.com").success).toBe(false)
    })

    it("odrzuca email bez TLD", () => {
        expect(optionalEmailSchema.safeParse("user@domena").success).toBe(false)
    })

    it("odrzuca numeryczne TLD jak 123@123.123 (Zod 4 stricter niż HTML5 spec)", () => {
        // Zod 4 .email() używa stricter regex niż HTML5 - top-level domain
        // musi zawierać przynajmniej jedną literę. Dlatego "123@123.123"
        // jest odrzucone mimo że per HTML5 byłoby valid.
        // To było źródłem oryginalnego bugu (server odrzucał ale client nie sprawdzał).
        const result = optionalEmailSchema.safeParse("123@123.123")
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Wpisz poprawny adres email")
        }
    })

    it("akceptuje email o długości dokładnie 100 znaków", () => {
        const longLocal = "a".repeat(95)
        const email = `${longLocal}@x.pl` // 95 + 5 = 100
        expect(email.length).toBe(100)
        expect(optionalEmailSchema.safeParse(email).success).toBe(true)
    })

    it("odrzuca email dłuższy niż 100 znaków", () => {
        const longLocal = "a".repeat(96)
        const email = `${longLocal}@x.pl` // 96 + 5 = 101
        expect(email.length).toBe(101)
        const result = optionalEmailSchema.safeParse(email)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Email jest zbyt długi")
        }
    })

    it("traktuje whitespace-only jako pusty (po trimie)", () => {
        const result = optionalEmailSchema.safeParse("   ")
        expect(result.success).toBe(true)
        if (result.success) expect(result.data).toBe("")
    })

    it("zwraca polski komunikat dla błędnego emaila", () => {
        const result = optionalEmailSchema.safeParse("brakatsymbol.com")
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Wpisz poprawny adres email")
        }
    })
})
