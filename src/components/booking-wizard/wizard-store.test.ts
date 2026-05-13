import {describe, expect, it} from "vitest"
import {
    deriveRequests,
    prefsKey,
    serviceIdsKey,
    slotsKey,
    type StaffOption,
} from "./wizard-store"

const staff = (id: string): StaffOption => ({
    id,
    firstName: id,
    lastName: "Test",
    acceptsAnyAssignment: true,
})

describe("serviceIdsKey", () => {
    it("sortuje ID-ki by klucz był deterministyczny niezależnie od kolejności", () => {
        expect(serviceIdsKey(["c", "a", "b"])).toBe("a,b,c")
        expect(serviceIdsKey(["b", "a"])).toBe(serviceIdsKey(["a", "b"]))
    })

    it("pusta lista to pusty string", () => {
        expect(serviceIdsKey([])).toBe("")
    })

    it("pojedyncze ID", () => {
        expect(serviceIdsKey(["abc"])).toBe("abc")
    })

    it("nie modyfikuje oryginalnej tablicy", () => {
        const original = ["c", "a", "b"]
        serviceIdsKey(original)
        expect(original).toEqual(["c", "a", "b"])
    })
})

describe("prefsKey", () => {
    it("łączy serviceIds z preferowanym staff", () => {
        expect(prefsKey(["s1", "s2"], "any")).toBe("s1,s2|any")
        expect(prefsKey(["s1", "s2"], "staff123")).toBe("s1,s2|staff123")
    })

    it("ta sama lista usług + ten sam staff = ten sam klucz", () => {
        expect(prefsKey(["b", "a"], "any")).toBe(prefsKey(["a", "b"], "any"))
    })

    it("inny staff = inny klucz", () => {
        expect(prefsKey(["s1"], "any")).not.toBe(prefsKey(["s1"], "staff123"))
    })
})

describe("slotsKey", () => {
    it("dokleja dateIso do prefsKey", () => {
        expect(slotsKey(["s1"], "any", "2026-05-15")).toBe("s1|any|2026-05-15")
    })

    it("inny date = inny klucz", () => {
        expect(slotsKey(["s1"], "any", "2026-05-15"))
            .not.toBe(slotsKey(["s1"], "any", "2026-05-16"))
    })
})

describe("deriveRequests", () => {
    it("preferencja 'any' zwraca 'any' dla każdej usługi", () => {
        const result = deriveRequests(["s1", "s2"], "any", {
            s1: [staff("ania"), staff("kasia")],
            s2: [staff("ania")],
        })
        expect(result).toEqual([
            {serviceId: "s1", staffPreference: "any"},
            {serviceId: "s2", staffPreference: "any"},
        ])
    })

    it("preferowany staff umie wszystkie wybrane usługi - przypisany do każdej", () => {
        const result = deriveRequests(["s1", "s2"], "ania", {
            s1: [staff("ania"), staff("kasia")],
            s2: [staff("ania"), staff("beata")],
        })
        expect(result).toEqual([
            {serviceId: "s1", staffPreference: "ania"},
            {serviceId: "s2", staffPreference: "ania"},
        ])
    })

    it("preferowany staff nie umie jednej z usług - fallback do 'any' dla tej usługi", () => {
        const result = deriveRequests(["s1", "s2"], "ania", {
            s1: [staff("ania"), staff("kasia")],
            s2: [staff("beata")], // ania nie umie s2
        })
        expect(result).toEqual([
            {serviceId: "s1", staffPreference: "ania"},
            {serviceId: "s2", staffPreference: "any"}, // fallback
        ])
    })

    it("preferowany staff nie umie żadnej usługi - wszystko 'any'", () => {
        const result = deriveRequests(["s1", "s2"], "ola", {
            s1: [staff("ania"), staff("kasia")],
            s2: [staff("beata")],
        })
        expect(result).toEqual([
            {serviceId: "s1", staffPreference: "any"},
            {serviceId: "s2", staffPreference: "any"},
        ])
    })

    it("puste staffByService - wszystko 'any' (graceful degradation)", () => {
        const result = deriveRequests(["s1"], "ania", {})
        expect(result).toEqual([
            {serviceId: "s1", staffPreference: "any"},
        ])
    })

    it("zachowuje kolejność serviceIds w wyniku", () => {
        const result = deriveRequests(["c", "a", "b"], "ania", {
            a: [staff("ania")],
            b: [staff("ania")],
            c: [staff("ania")],
        })
        expect(result.map((r) => r.serviceId)).toEqual(["c", "a", "b"])
    })
})
