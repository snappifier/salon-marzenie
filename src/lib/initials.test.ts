// src/lib/initials.test.ts
import {describe, it, expect} from "vitest"
import {autoInitials} from "@/lib/initials"

describe("autoInitials", () => {
	it("zwraca pierwsze dwie litery gdy jedno słowo", () => {
		expect(autoInitials("Anna")).toBe("AN")
	})

	it("zwraca inicjały imienia i nazwiska", () => {
		expect(autoInitials("Sylwia Kowalska")).toBe("SK")
	})

	it("używa pierwsze i ostatnie słowo gdy więcej niż dwa", () => {
		expect(autoInitials("Anna Maria Kowalska")).toBe("AK")
	})

	it("ignoruje nadmiarowe spacje", () => {
		expect(autoInitials("  Anna   Kowalska  ")).toBe("AK")
	})

	it("zwraca duże litery niezależnie od inputu", () => {
		expect(autoInitials("anna kowalska")).toBe("AK")
	})

	it("obsługuje polskie znaki", () => {
		expect(autoInitials("Łukasz Świderski")).toBe("ŁŚ")
	})

	it("zwraca placeholder dla pustego stringa", () => {
		expect(autoInitials("")).toBe("?")
		expect(autoInitials("   ")).toBe("?")
	})

	it("dla jednego znaku zwraca jego upper bez padowania", () => {
		expect(autoInitials("a")).toBe("A")
	})
})
