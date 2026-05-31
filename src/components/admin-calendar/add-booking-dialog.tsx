// src/components/admin-calendar/add-booking-dialog.tsx
"use client"

import {useEffect, useState} from "react"
import {X} from "lucide-react"
import {Modal} from "@/components/ui/modal"
import {Field} from "@/components/ui/field"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/cn"
import {formatMoney} from "@/lib/money"
import {formatDate, formatTime, dateToIsoDay} from "@/lib/date"
import {plPhoneSchema} from "@/lib/validation"
import {adminCreateBooking, searchCustomers} from "@/features/booking/admin-actions"
import type {CalendarService, StaffByService} from "./calendar-types"

interface CustomerOption {
	id: string
	firstName: string
	lastName: string
	phone: string
}

interface Props {
	prefilledStart: Date
	prefilledStaffId: string | null
	services: CalendarService[]
	staffByService: StaffByService
	onClose: () => void
	onSuccess: () => void
}

interface SelectedService {
	serviceId: string
	staffId: string
}

const selectClass = cn(
	"h-10 rounded-md border border-border-default bg-white px-3 text-sm text-graphite-900",
	"transition-[border-color,box-shadow] duration-150 ease-out",
	"focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15 focus-visible:border-rose-500",
)

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
		const defaultStaffId =
			prefilledStaffId && candidates.some((c) => c.id === prefilledStaffId)
				? prefilledStaffId
				: (candidates[0]?.id ?? "")
		if (!defaultStaffId) return
		setSelectedServices((prev) => [...prev, {serviceId, staffId: defaultStaffId}])
	}

	function removeService(idx: number) {
		setSelectedServices((prev) => prev.filter((_, i) => i !== idx))
	}

	function setServiceStaff(idx: number, staffId: string) {
		setSelectedServices((prev) => prev.map((s, i) => (i === idx ? {...s, staffId} : s)))
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
		<Modal
			open
			onClose={onClose}
			size="lg"
			title="Nowa wizyta"
			footer={
				<div className="flex justify-end gap-2">
					<Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
						Anuluj
					</Button>
					<Button size="sm" onClick={handleSubmit} disabled={!formValid || submitting}>
						{submitting ? "Zapisywanie..." : "Utwórz wizytę"}
					</Button>
				</div>
			}
		>
			<div className="space-y-5">
				<p className="text-sm text-graphite-600">
					{formatDate(prefilledStart)}, <span className="tabular-nums">{formatTime(prefilledStart)}</span>
				</p>

				{/* Klient */}
				<section className="space-y-2.5">
					<div className="flex items-center justify-between">
						<h4 className="text-[13px] font-medium text-graphite-900">Klient</h4>
						<div className="inline-flex rounded-full border border-border-soft bg-white p-0.5">
							<PillButton active={mode === "existing"} onClick={() => setMode("existing")}>
								Istniejąca
							</PillButton>
							<PillButton active={mode === "new"} onClick={() => setMode("new")}>
								Nowa
							</PillButton>
						</div>
					</div>

					{mode === "existing" &&
						(selectedCustomer ? (
							<div className="flex items-center justify-between rounded-lg border border-border-soft bg-warm/40 px-3 py-2.5">
								<div className="min-w-0 text-sm">
									<div className="font-medium text-graphite-900">
										{selectedCustomer.firstName} {selectedCustomer.lastName}
									</div>
									<div className="text-graphite-600">{selectedCustomer.phone}</div>
								</div>
								<button
									type="button"
									onClick={() => setSelectedCustomer(null)}
									className="text-sm font-medium text-rose-600 transition-[color] duration-150 ease-out hover-supported:hover:text-rose-700"
								>
									Zmień
								</button>
							</div>
						) : (
							<div className="space-y-2">
								<Field
									type="text"
									value={customerSearch}
									onChange={(e) => setCustomerSearch(e.target.value)}
									placeholder="Szukaj po imieniu, nazwisku, telefonie..."
									aria-label="Wyszukaj klienta"
								/>
								{customerResults.length > 0 && (
									<ul className="max-h-44 overflow-y-auto rounded-lg border border-border-soft">
										{customerResults.map((c) => (
											<li key={c.id} className="border-b border-border-soft last:border-0">
												<button
													type="button"
													onClick={() => {
														setSelectedCustomer(c)
														setCustomerSearch("")
														setCustomerResults([])
													}}
													className="w-full px-3 py-2 text-left text-sm transition-[background-color] duration-150 ease-out hover-supported:hover:bg-rose-50/40"
												>
													<div className="font-medium text-graphite-900">
														{c.firstName} {c.lastName}
													</div>
													<div className="text-graphite-600">{c.phone}</div>
												</button>
											</li>
										))}
									</ul>
								)}
							</div>
						))}

					{mode === "new" && (
						<div className="grid grid-cols-2 gap-3">
							<Field
								label="Imię"
								value={newCustomer.firstName}
								onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
							/>
							<Field
								label="Nazwisko"
								value={newCustomer.lastName}
								onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
							/>
							<div className="col-span-2">
								<Field
									label="Telefon"
									type="tel"
									value={newCustomer.phone}
									onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
								/>
							</div>
							<div className="col-span-2">
								<Field
									label="Email (opcjonalny)"
									type="email"
									value={newCustomer.email}
									onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
								/>
							</div>
						</div>
					)}
				</section>

				{/* Usługi */}
				<section className="space-y-2.5">
					<h4 className="text-[13px] font-medium text-graphite-900">Usługi</h4>

					{selectedServices.length > 0 && (
						<div className="space-y-2">
							{selectedServices.map((sel, idx) => {
								const svc = services.find((s) => s.id === sel.serviceId)
								const candidates = staffByService[sel.serviceId] ?? []
								if (!svc) return null
								return (
									<div
										key={idx}
										className="flex items-center gap-2 rounded-lg border border-border-soft px-3 py-2"
									>
										<div className="min-w-0 flex-1">
											<div className="truncate text-sm font-medium text-graphite-900">{svc.name}</div>
											<div className="text-xs text-graphite-500">
												{svc.defaultDurationMin} min · {formatMoney(svc.defaultPriceGr)}
											</div>
										</div>
										<select
											value={sel.staffId}
											onChange={(e) => setServiceStaff(idx, e.target.value)}
											aria-label={`Pracownik dla ${svc.name}`}
											className={selectClass}
										>
											{candidates.map((s) => (
												<option key={s.id} value={s.id}>
													{s.firstName} {s.lastName}
												</option>
											))}
										</select>
										<button
											type="button"
											onClick={() => removeService(idx)}
											aria-label="Usuń usługę"
											className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-graphite-500 transition-[background-color,color] duration-150 ease-out hover-supported:hover:bg-error-bg hover-supported:hover:text-error active:scale-[0.94]"
										>
											<X size={16} />
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
						aria-label="Dodaj usługę do wizyty"
						className={cn(selectClass, "w-full")}
					>
						<option value="">+ Dodaj usługę...</option>
						{services.map((svc) => (
							<option key={svc.id} value={svc.id}>
								{svc.categoryName}: {svc.name} ({svc.defaultDurationMin} min)
							</option>
						))}
					</select>

					{selectedServices.length > 0 && (
						<div className="text-sm text-graphite-700">
							Razem: <span className="tabular-nums">{totalDuration} min</span> ·{" "}
							<span className="tabular-nums">{formatMoney(totalPrice)}</span>
						</div>
					)}
				</section>

				<Textarea
					label="Notatka (opcjonalna)"
					value={adminNote}
					onChange={(e) => setAdminNote(e.target.value)}
					rows={2}
				/>

				{error && <p className="text-sm text-error">{error}</p>}
			</div>
		</Modal>
	)
}

function PillButton({active, onClick, children}: {active: boolean; onClick: () => void; children: React.ReactNode}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"rounded-full px-3 py-1 text-sm font-medium",
				"transition-[background-color,color] duration-150 ease-out",
				active ? "bg-rose-600 text-white" : "text-graphite-600 hover-supported:hover:text-graphite-900",
			)}
		>
			{children}
		</button>
	)
}
