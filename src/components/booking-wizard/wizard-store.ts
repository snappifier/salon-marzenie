"use client"

import {create} from "zustand"
import type {SlotProposal} from "@/features/booking/types"

export interface CustomerData {
    firstName: string
    lastName: string
    phone: string
    email: string
    customerNote: string
    marketingConsent: boolean
    createAccount: boolean
    password: string
}

export type StaffOption = {
    id: string
    firstName: string
    lastName: string
    acceptsAnyAssignment: boolean
}

export type DayWithSlotCount = {
    dateIso: string
    slotsCount: number
}

export type StaffRequest = {
    serviceId: string
    staffPreference: string
}

const emptyCustomer: CustomerData = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    customerNote: "",
    marketingConsent: false,
    createAccount: false,
    password: "",
}

interface WizardState {
    step: number
    selectedServices: string[]
    preferredStaffId: string
    selectedDate: string | null
    selectedSlotStartIso: string | null
    customer: CustomerData

    daysCache: Record<string, DayWithSlotCount[]>
    slotsCache: Record<string, SlotProposal[]>

    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void

    addService: (serviceId: string) => void
    removeService: (serviceId: string) => void
    setPreferredStaffId: (id: string) => void

    setSelectedDate: (date: string | null) => void
    setSelectedSlot: (startIso: string | null) => void

    setCustomer: (patch: Partial<CustomerData>) => void

    setDaysCache: (key: string, data: DayWithSlotCount[]) => void
    setSlotsCache: (key: string, data: SlotProposal[]) => void

    initWith: (patch: Partial<Pick<WizardState, "selectedServices" | "selectedDate" | "selectedSlotStartIso">>) => void
    reset: () => void
}

export const useWizardStore = create<WizardState>((set) => ({
    step: 1,
    selectedServices: [],
    preferredStaffId: "any",
    selectedDate: null,
    selectedSlotStartIso: null,
    customer: emptyCustomer,

    daysCache: {},
    slotsCache: {},

    setStep: (step) => set({step}),
    nextStep: () => set((s) => ({step: s.step + 1})),
    prevStep: () => set((s) => ({step: Math.max(1, s.step - 1)})),

    addService: (serviceId) => set((s) => {
        if (s.selectedServices.includes(serviceId)) return s
        return {
            selectedServices: [...s.selectedServices, serviceId],
            selectedSlotStartIso: null,
        }
    }),
    removeService: (serviceId) => set((s) => ({
        selectedServices: s.selectedServices.filter((id) => id !== serviceId),
        selectedSlotStartIso: null,
    })),
    setPreferredStaffId: (id) => set({preferredStaffId: id, selectedSlotStartIso: null}),

    setSelectedDate: (date) => set({selectedDate: date, selectedSlotStartIso: null}),
    setSelectedSlot: (startIso) => set({selectedSlotStartIso: startIso}),

    setCustomer: (patch) => set((s) => ({customer: {...s.customer, ...patch}})),

    setDaysCache: (key, data) => set((s) => ({daysCache: {...s.daysCache, [key]: data}})),
    setSlotsCache: (key, data) => set((s) => ({slotsCache: {...s.slotsCache, [key]: data}})),

    initWith: (patch) => set((s) => ({...s, ...patch})),
    reset: () => set({
        step: 1,
        selectedServices: [],
        preferredStaffId: "any",
        selectedDate: null,
        selectedSlotStartIso: null,
        customer: emptyCustomer,
        daysCache: {},
        slotsCache: {},
    }),
}))

export function serviceIdsKey(serviceIds: string[]): string {
    return serviceIds.slice().sort().join(",")
}

export function prefsKey(serviceIds: string[], preferredStaffId: string): string {
    return `${serviceIdsKey(serviceIds)}|${preferredStaffId}`
}

export function slotsKey(serviceIds: string[], preferredStaffId: string, dateIso: string): string {
    return `${prefsKey(serviceIds, preferredStaffId)}|${dateIso}`
}

export function deriveRequests(
    serviceIds: string[],
    preferredStaffId: string,
    staffByService: Record<string, StaffOption[]>,
): StaffRequest[] {
    return serviceIds.map((serviceId) => {
        if (preferredStaffId === "any") {
            return {serviceId, staffPreference: "any"}
        }
        const staffForService = staffByService[serviceId] ?? []
        const canDo = staffForService.some((s) => s.id === preferredStaffId)
        return {serviceId, staffPreference: canDo ? preferredStaffId : "any"}
    })
}
