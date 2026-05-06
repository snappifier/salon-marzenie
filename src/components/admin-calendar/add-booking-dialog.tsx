"use client"

import {useEffect, useState} from "react"
import {searchCustomers, adminCreateBooking} from "@/features/booking/admin-actions"
import {fetchSlotsForDay} from "@/features/booking/public-actions"
import {formatTime, formatDate, dateToIsoDay} from "@/lib/date"
import {formatMoney} from "@/lib/money"
import {plPhoneSchema} from "@/lib/validation"

type Service = {
    id: string
    name: string
    categoryName: string
    defaultDurationMin: number
    defaultPriceGr: number
}

type StaffOption = {
    id: string
    firstName: string
    lastName: string
}

type CustomerOption = {
    id: string
    firstName: string
    lastName: string
    phone: string
}

type Props = {
    prefilledStart: Date
    prefilledStaffId: string | null
    services: Service[]
    staffByService: Record<string, StaffOption[]>
    onClose: () => void
    onSuccess: () => void
}

type SelectedService = {
    serviceId: string
    staffId: string
}

export function AddBookingDialog({
                                     prefilledStart,
                                     prefilledStaffId,
                                     services,
                                     staffByService,
                                     onClose,
                                     onSuccess,
                                 }: Props) {
    const [mode, setMode] = useState<"existing" | "new">("existing")
    const [customerSearch, setCustomerSearch] = useState("")
    const [customerResults, setCustomerResults] = useState<CustomerOption[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null)
    const [newCustomer, setNewCustomer] = useState({firstName: "", lastName: "", phone: "", email: ""})

    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
    const [adminNote, setAdminNote] = useState("")

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (mode !== "existing" || !customerSearch.trim()) {
            setCustomerResults([])
            return
        }
        const timer = setTimeout(() => {
            searchCustomers(customerSearch).then(setCustomerResults)
        }, 300)
        return () => clearTimeout(timer)
    }, [customerSearch, mode])

    function addService(serviceId: string) {
        const candidates = staffByService[serviceId] ?? []
        const defaultStaffId = prefilledStaffId && candidates.some((c) => c.id === prefilledStaffId)
            ? prefilledStaffId
            : candidates[0]?.id ?? ""
        if (!defaultStaffId) return
        setSelectedServices((prev) => [...prev, {serviceId, staffId: defaultStaffId}])
    }

    function removeService(idx: number) {
        setSelectedServices((prev) => prev.filter((_, i) => i !== idx))
    }

    function setServiceStaff(idx: number, staffId: string) {
        setSelectedServices((prev) => prev.map((s, i) => i === idx ? {...s, staffId} : s))
    }

    const customerValid =
        (mode === "existing" && selectedCustomer !== null) ||
        (mode === "new" &&
            newCustomer.firstName.trim().length > 0 &&
            newCustomer.lastName.trim().length > 0 &&
            plPhoneSchema.safeParse(newCustomer.phone).success)

    const formValid = customerValid && selectedServices.length > 0

    async function handleSubmit() {
        if (!formValid) return
        setSubmitting(true)
        setError(null)

        const result = await adminCreateBooking({
            dateIso: dateToIsoDay(prefilledStart),
            startIso: prefilledStart.toISOString(),
            requests: selectedServices,
            customerId: mode === "existing" && selectedCustomer ? selectedCustomer.id : null,
            newCustomer: mode === "new" ? newCustomer : null,
            adminNote,
        })

        setSubmitting(false)

        if (!result.success) {
            setError(result.error)
            return
        }

        onSuccess()
    }

    const totalPrice = selectedServices.reduce((sum, sel) => {
        const svc = services.find((s) => s.id === sel.serviceId)
        return sum + (svc?.defaultPriceGr ?? 0)
    }, 0)

    const totalDuration = selectedServices.reduce((sum, sel) => {
        const svc = services.find((s) => s.id === sel.serviceId)
        return sum + (svc?.defaultDurationMin ?? 0)
    }, 0)

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Nowa wizyta</h2>
                        <p className="text-sm text-gray-500">
                            {formatDate(prefilledStart)}, {formatTime(prefilledStart)}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500">✕</button>
                </div>

                <section className="space-y-2">
                    <div className="text-sm font-medium">Klient</div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setMode("existing")}
                            className={`px-3 py-1 border rounded text-sm ${mode === "existing" ? "border-black bg-gray-50" : ""}`}
                        >
                            Istniejący
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("new")}
                            className={`px-3 py-1 border rounded text-sm ${mode === "new" ? "border-black bg-gray-50" : ""}`}
                        >
                            Nowy
                        </button>
                    </div>

                    {mode === "existing" && (
                        <div className="space-y-2">
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between p-2 border rounded">
                                    <div className="text-sm">
                                        <div className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                                        <div className="text-gray-500">{selectedCustomer.phone}</div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCustomer(null)}
                                        className="text-sm text-gray-500"
                                    >
                                        Zmień
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        placeholder="Szukaj po imieniu, nazwisku, telefonie..."
                                        className="w-full border p-2 rounded text-sm"
                                    />
                                    {customerResults.length > 0 && (
                                        <ul className="border rounded max-h-40 overflow-y-auto">
                                            {customerResults.map((c) => (
                                                <li key={c.id}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(c)
                                                            setCustomerSearch("")
                                                            setCustomerResults([])
                                                        }}
                                                        className="w-full text-left p-2 hover:bg-gray-50 text-sm"
                                                    >
                                                        <div className="font-medium">{c.firstName} {c.lastName}</div>
                                                        <div className="text-gray-500">{c.phone}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {mode === "new" && (
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={newCustomer.firstName}
                                onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                                placeholder="Imię"
                                className="border p-2 rounded text-sm"
                            />
                            <input
                                type="text"
                                value={newCustomer.lastName}
                                onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                                placeholder="Nazwisko"
                                className="border p-2 rounded text-sm"
                            />
                            <input
                                type="tel"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                                placeholder="Telefon"
                                className="border p-2 rounded text-sm col-span-2"
                            />
                            <input
                                type="email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                                placeholder="Email (opcjonalny)"
                                className="border p-2 rounded text-sm col-span-2"
                            />
                        </div>
                    )}
                </section>

                <section className="space-y-2">
                    <div className="text-sm font-medium">Usługi</div>

                    {selectedServices.length > 0 && (
                        <div className="space-y-2">
                            {selectedServices.map((sel, idx) => {
                                const svc = services.find((s) => s.id === sel.serviceId)
                                const candidates = staffByService[sel.serviceId] ?? []
                                if (!svc) return null

                                return (
                                    <div key={idx} className="flex items-center gap-2 p-2 border rounded text-sm">
                                        <div className="flex-1">
                                            <div className="font-medium">{svc.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {svc.defaultDurationMin} min, {formatMoney(svc.defaultPriceGr)}
                                            </div>
                                        </div>
                                        <select
                                            value={sel.staffId}
                                            onChange={(e) => setServiceStaff(idx, e.target.value)}
                                            className="border p-1 rounded text-sm"
                                        >
                                            {candidates.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.firstName} {s.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => removeService(idx)}
                                            className="text-red-600 text-sm"
                                        >
                                            Usuń
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) addService(e.target.value)
                            e.target.value = ""
                        }}
                        className="w-full border p-2 rounded text-sm"
                    >
                        <option value="">+ Dodaj usługę...</option>
                        {services.map((svc) => (
                            <option key={svc.id} value={svc.id}>
                                {svc.categoryName}: {svc.name} ({svc.defaultDurationMin} min)
                            </option>
                        ))}
                    </select>
                </section>

                {selectedServices.length > 0 && (
                    <div className="text-sm text-gray-700">
                        Razem: {totalDuration} min, {formatMoney(totalPrice)}
                    </div>
                )}

                <section>
                    <label className="block text-sm font-medium mb-1">Notatka admina (opcjonalna)</label>
                    <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full border p-2 rounded text-sm"
                        rows={2}
                    />
                </section>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 border rounded text-sm"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formValid || submitting}
                        className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-50"
                    >
                        {submitting ? "Zapisywanie..." : "Utwórz wizytę"}
                    </button>
                </div>
            </div>
        </div>
    )
}