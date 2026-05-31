// src/components/ui/tab-strip.test.ts
import {describe, expect, it} from "vitest"
import {nextTabIndex} from "./tab-strip"

describe("nextTabIndex", () => {
	describe("ArrowRight", () => {
		it("przesuwa do następnego", () => {
			expect(nextTabIndex(0, 4, "ArrowRight")).toBe(1)
			expect(nextTabIndex(2, 4, "ArrowRight")).toBe(3)
		})
		it("wrap z ostatniego na pierwszy", () => {
			expect(nextTabIndex(3, 4, "ArrowRight")).toBe(0)
		})
	})

	describe("ArrowLeft", () => {
		it("przesuwa do poprzedniego", () => {
			expect(nextTabIndex(2, 4, "ArrowLeft")).toBe(1)
			expect(nextTabIndex(1, 4, "ArrowLeft")).toBe(0)
		})
		it("wrap z pierwszego na ostatni", () => {
			expect(nextTabIndex(0, 4, "ArrowLeft")).toBe(3)
		})
	})

	describe("Home", () => {
		it("zawsze pierwszy", () => {
			expect(nextTabIndex(2, 4, "Home")).toBe(0)
			expect(nextTabIndex(0, 4, "Home")).toBe(0)
			expect(nextTabIndex(3, 4, "Home")).toBe(0)
		})
	})

	describe("End", () => {
		it("zawsze ostatni", () => {
			expect(nextTabIndex(0, 4, "End")).toBe(3)
			expect(nextTabIndex(2, 4, "End")).toBe(3)
			expect(nextTabIndex(3, 4, "End")).toBe(3)
		})
	})

	describe("inny klawisz", () => {
		it("zwraca currentIndex bez zmian", () => {
			expect(nextTabIndex(1, 4, "Enter")).toBe(1)
			expect(nextTabIndex(2, 4, "Tab")).toBe(2)
			expect(nextTabIndex(0, 4, " ")).toBe(0)
			expect(nextTabIndex(3, 4, "ArrowUp")).toBe(3)
		})
	})

	describe("edge cases", () => {
		it("total = 0 → currentIndex (bez crashu)", () => {
			expect(nextTabIndex(0, 0, "ArrowRight")).toBe(0)
			expect(nextTabIndex(0, 0, "Home")).toBe(0)
		})
		it("total = 1 → zawsze 0 (single tab, wrap na siebie)", () => {
			expect(nextTabIndex(0, 1, "ArrowRight")).toBe(0)
			expect(nextTabIndex(0, 1, "ArrowLeft")).toBe(0)
			expect(nextTabIndex(0, 1, "Home")).toBe(0)
			expect(nextTabIndex(0, 1, "End")).toBe(0)
		})
	})
})
