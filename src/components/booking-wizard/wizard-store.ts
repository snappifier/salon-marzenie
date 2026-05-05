"use client"

import {create} from "zustand"

export type StaffPreference = string | "any"

export interface SelectedServiceState {
    serviceId: string
    staffPreference: StaffPreference
}

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
    selectedServices: SelectedServiceState[]
    selectedDate: string | null
    selectedSlotStartIso: string | null
    customer: CustomerData

    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void

    addService: (serviceId: string) => void
    removeService: (serviceId: string) => void
    setStaffPreference: (serviceId: string, staffPreference: StaffPreference) => void

    setSelectedDate: (date: string | null) => void
    setSelectedSlot: (startIso: string | null) => void

    setCustomer: (patch: Partial<CustomerData>) => void

    reset: () => void
}

export const useWizardStore = create<WizardState>((set) => ({
    step: 1,
    selectedServices: [],
    selectedDate: null,
    selectedSlotStartIso: null,
    customer: emptyCustomer,

    setStep: (step) => set({step}),
    nextStep: () => set((s) => ({step: s.step + 1})),
    prevStep: () => set((s) => ({step: Math.max(1, s.step - 1)})),

    addService: (serviceId) => set((s) => {
        if (s.selectedServices.some((x) => x.serviceId === serviceId)) return s
        return {
            selectedServices: [...s.selectedServices, {serviceId, staffPreference: "any"}],
            selectedSlotStartIso: null,
        }
    }),
    removeService: (serviceId) => set((s) => ({
        selectedServices: s.selectedServices.filter((x) => x.serviceId !== serviceId),
        selectedSlotStartIso: null,
    })),
    setStaffPreference: (serviceId, staffPreference) => set((s) => ({
        selectedServices: s.selectedServices.map((x) =>
            x.serviceId === serviceId ? {...x, staffPreference} : x,
        ),
        selectedSlotStartIso: null,
    })),

    setSelectedDate: (date) => set({selectedDate: date, selectedSlotStartIso: null}),
    setSelectedSlot: (startIso) => set({selectedSlotStartIso: startIso}),

    setCustomer: (patch) => set((s) => ({customer: {...s.customer, ...patch}})),

    reset: () => set({
        step: 1,
        selectedServices: [],
        selectedDate: null,
        selectedSlotStartIso: null,
        customer: emptyCustomer,
    }),
}))