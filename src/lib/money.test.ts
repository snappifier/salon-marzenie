import {describe, expect, it} from "vitest"
import {formatMoney, zloteToGrosze} from "./money"

describe("formatMoney", () => {
    it("formatuje pełne złote", () => {
        expect(formatMoney(12000)).toBe("120,00 zł")
    })

    it("formatuje złote z groszami", () => {
        expect(formatMoney(12345)).toBe("123,45 zł")
    })

    it("zero", () => {
        expect(formatMoney(0)).toBe("0,00 zł")
    })

    it("zaokrągla do dwóch miejsc (groszy)", () => {
        expect(formatMoney(1)).toBe("0,01 zł")
        expect(formatMoney(99)).toBe("0,99 zł")
        expect(formatMoney(100)).toBe("1,00 zł")
    })

    it("używa polskiego separatora dziesiętnego (przecinek)", () => {
        expect(formatMoney(150)).not.toContain(".")
        expect(formatMoney(150)).toContain(",")
    })

    it("duże kwoty bez separatora tysięcy", () => {
        // PLN konwencja - nie używamy separatora tysięcy
        expect(formatMoney(150000)).toBe("1500,00 zł")
    })
})

describe("zloteToGrosze", () => {
    it("konwertuje pełne złote", () => {
        expect(zloteToGrosze(120)).toBe(12000)
    })

    it("konwertuje złote z ułamkami", () => {
        expect(zloteToGrosze(120.5)).toBe(12050)
        expect(zloteToGrosze(123.45)).toBe(12345)
    })

    it("zaokrągla problemy floating point", () => {
        // 0.1 * 100 = 10.000000000000002 w IEEE 754
        expect(zloteToGrosze(0.1)).toBe(10)
        expect(zloteToGrosze(0.07)).toBe(7)
    })

    it("zero", () => {
        expect(zloteToGrosze(0)).toBe(0)
    })
})
