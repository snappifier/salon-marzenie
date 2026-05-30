// src/components/settings/settings-form.tsx
"use client"

import {useActionState, useEffect, useId, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import type {Settings, SalonClosedDay} from "@/generated/prisma/client"
import {updateSettings, type SettingsFormState} from "@/features/settings/actions"
import {addClosedDay, removeClosedDay, type ClosedDayState} from "@/features/settings/closed-days"
import {minutesToTimeString} from "@/lib/date"
import {format} from "date-fns"
import {pl} from "date-fns/locale"
import {TabStrip, type Tab} from "@/components/ui/tab-strip"
import {Field} from "@/components/ui/field"
import {Button} from "@/components/ui/button"
import {useToast} from "@/components/ui/toast"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {PageHeader} from "@/components/admin-shell/page-header"
import {cn} from "@/lib/cn"

type Props = {
	settings: Settings
	closedDays: SalonClosedDay[]
}

const TABS: Tab[] = [
	{id: "salon", label: "Salon"},
	{id: "polityka", label: "Polityka"},
	{id: "godziny", label: "Godziny"},
	{id: "konto", label: "Konto"},
]

const initialState: SettingsFormState = {}

export function SettingsForm({settings, closedDays}: Props) {
	const [state, formAction, isPending] = useActionState(updateSettings, initialState)
	const toast = useToast()

	const [activeTab, setActiveTab] = useState("salon")
	const [dirty, setDirty] = useState(false)
	const [requireConfirmation, setRequireConfirmation] = useState(settings.requireConfirmation)

	const openTime = settings.salonOpenMin !== null ? minutesToTimeString(settings.salonOpenMin) : ""
	const closeTime = settings.salonCloseMin !== null ? minutesToTimeString(settings.salonCloseMin) : ""

	const requireConfirmationId = useId()

	useEffect(() => {
		if (state.success) {
			setDirty(false)
			toast.success("Ustawienia zapisane")
		}
	}, [state.success])

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Administracja"
				title="Ustawienia"
				subtitle="Zarządzaj danymi salonu, polityką rezerwacji i powiadomieniami."
			/>

			<form
				action={formAction}
				onChange={() => setDirty(true)}
				className="flex flex-col gap-6"
			>
				<TabStrip
					tabs={TABS}
					active={activeTab}
					onChange={setActiveTab}
					layoutId="settings-tabs"
					aria-label="Sekcje ustawień"
				/>

				{/* Tab: Salon */}
				<div
					role="tabpanel"
					id="panel-salon"
					aria-labelledby="tab-salon"
					hidden={activeTab !== "salon"}
				>
					<div className="flex flex-col gap-5 max-w-2xl">
						<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide">Dane salonu</h2>

						<Field
							name="salonName"
							label="Nazwa salonu"
							defaultValue={settings.salonName}
							required
							error={state.fieldErrors?.salonName?.[0]}
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field
								name="salonPhone"
								type="tel"
								label="Telefon"
								defaultValue={settings.salonPhone ?? ""}
								placeholder="+48..."
								error={state.fieldErrors?.salonPhone?.[0]}
							/>
							<Field
								name="salonEmail"
								type="email"
								label="Email"
								defaultValue={settings.salonEmail ?? ""}
								error={state.fieldErrors?.salonEmail?.[0]}
							/>
						</div>

						<Field
							name="salonAddress"
							label="Adres"
							defaultValue={settings.salonAddress ?? ""}
							error={state.fieldErrors?.salonAddress?.[0]}
						/>

						<div className="pt-2">
							<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide mb-4">Dane firmy</h2>
							<div className="flex flex-col gap-4">
								<Field
									name="companyOwnerName"
									label="Imię i nazwisko właściciela"
									defaultValue={settings.companyOwnerName ?? ""}
									error={state.fieldErrors?.companyOwnerName?.[0]}
								/>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Field
										name="nip"
										label="NIP"
										defaultValue={settings.nip ?? ""}
										error={state.fieldErrors?.nip?.[0]}
									/>
									<Field
										name="regon"
										label="REGON"
										defaultValue={settings.regon ?? ""}
										error={state.fieldErrors?.regon?.[0]}
									/>
								</div>
								<Field
									name="facebookUrl"
									type="url"
									label="Facebook URL"
									defaultValue={settings.facebookUrl ?? ""}
									placeholder="https://facebook.com/..."
									error={state.fieldErrors?.facebookUrl?.[0]}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Tab: Polityka */}
				<div
					role="tabpanel"
					id="panel-polityka"
					aria-labelledby="tab-polityka"
					hidden={activeTab !== "polityka"}
				>
					<div className="flex flex-col gap-5 max-w-2xl">
						<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide">Reguły rezerwacji</h2>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field
								name="minCancelHoursBefore"
								type="number"
								label="Min. czas anulowania (godz.)"
								defaultValue={settings.minCancelHoursBefore}
								hint="Klient nie może anulować w ciągu X godz. przed wizytą"
								error={state.fieldErrors?.minCancelHoursBefore?.[0]}
							/>
							<Field
								name="minBookingHoursAhead"
								type="number"
								label="Min. czas rezerwacji online (godz.)"
								defaultValue={settings.minBookingHoursAhead}
								hint="Klient nie może rezerwować na bieżącą godzinę"
								error={state.fieldErrors?.minBookingHoursAhead?.[0]}
							/>
							<Field
								name="maxBookingDaysAhead"
								type="number"
								label="Max. wyprzedzenie (dni)"
								defaultValue={settings.maxBookingDaysAhead}
								hint="Ile dni naprzód można rezerwować"
								error={state.fieldErrors?.maxBookingDaysAhead?.[0]}
							/>

							<div className="space-y-1.5">
								<label className="block text-[13px] font-medium text-graphite-900">
									Krok slotów (min)
								</label>
								<select
									name="slotIntervalMin"
									defaultValue={settings.slotIntervalMin}
									className={cn(
										"w-full h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
										"transition-[border-color,box-shadow] duration-150 ease-out",
										"focus:outline-none focus:ring-3 focus:ring-rose-500/15",
										state.fieldErrors?.slotIntervalMin
											? "border-error focus:border-error"
											: "border-border-default focus:border-rose-500",
									)}
								>
									<option value={15}>15 minut</option>
									<option value={30}>30 minut</option>
									<option value={60}>60 minut</option>
								</select>
								{state.fieldErrors?.slotIntervalMin && (
									<p className="text-xs text-error">{state.fieldErrors.slotIntervalMin[0]}</p>
								)}
							</div>
						</div>

						<div className="border-t border-border-soft pt-5">
							<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide mb-4">Potwierdzenie wizyt</h2>

							<div className="flex items-start gap-3 mb-4">
								<input
									id={requireConfirmationId}
									name="requireConfirmation"
									type="checkbox"
									defaultChecked={settings.requireConfirmation}
									onChange={(e) => setRequireConfirmation(e.target.checked)}
									className="mt-0.5 w-4 h-4 rounded border-border-default accent-rose-600 cursor-pointer"
								/>
								<label
									htmlFor={requireConfirmationId}
									className="text-sm text-graphite-900 cursor-pointer leading-snug"
								>
									Wymagaj potwierdzenia przez klienta
								</label>
							</div>

							<div hidden={!requireConfirmation} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
								<Field
									name="confirmWindowMaxHours"
									type="number"
									label="Najwcześniej można potwierdzić (godz. przed wizytą)"
									defaultValue={settings.confirmWindowMaxHours}
									error={state.fieldErrors?.confirmWindowMaxHours?.[0]}
								/>
								<Field
									name="confirmWindowMinHours"
									type="number"
									label="Najpóźniej można potwierdzić (godz. przed wizytą)"
									defaultValue={settings.confirmWindowMinHours}
									error={state.fieldErrors?.confirmWindowMinHours?.[0]}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Tab: Godziny */}
				<div
					role="tabpanel"
					id="panel-godziny"
					aria-labelledby="tab-godziny"
					hidden={activeTab !== "godziny"}
				>
					<div className="flex flex-col gap-5 max-w-2xl">
						<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide">Godziny otwarcia</h2>

						<div className="space-y-3">
							<div className="flex flex-wrap items-end gap-4">
								<div className="space-y-1.5">
									<label className="block text-[13px] font-medium text-graphite-900">
										Otwarcie
									</label>
									<input
										name="salonOpen"
										type="time"
										defaultValue={openTime}
										className={cn(
											"h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
											"transition-[border-color,box-shadow] duration-150 ease-out",
											"focus:outline-none focus:ring-3 focus:ring-rose-500/15",
											"border-border-default focus:border-rose-500",
										)}
									/>
								</div>

								<span className="text-graphite-400 pb-2.5">—</span>

								<div className="space-y-1.5">
									<label className="block text-[13px] font-medium text-graphite-900">
										Zamknięcie
									</label>
									<input
										name="salonClose"
										type="time"
										defaultValue={closeTime}
										className={cn(
											"h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
											"transition-[border-color,box-shadow] duration-150 ease-out",
											"focus:outline-none focus:ring-3 focus:ring-rose-500/15",
											"border-border-default focus:border-rose-500",
										)}
									/>
								</div>
							</div>

							<p className="text-xs text-graphite-500 max-w-md">
								Jeśli zostawisz puste, godziny pracy decydują grafiki pracowników.
								Jeśli ustawisz godziny globalne, pracownicy nie mogą mieć grafików wykraczających poza ten zakres.
							</p>
						</div>
					</div>
				</div>

				{/* Tab: Konto */}
				<div
					role="tabpanel"
					id="panel-konto"
					aria-labelledby="tab-konto"
					hidden={activeTab !== "konto"}
				>
					<div className="flex flex-col gap-5 max-w-2xl">
						<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide">Powiadomienia</h2>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field
								name="adminNotificationPhone"
								type="tel"
								label="Telefon do powiadomień"
								defaultValue={settings.adminNotificationPhone ?? ""}
								placeholder="+48..."
								error={state.fieldErrors?.adminNotificationPhone?.[0]}
							/>
							<Field
								name="adminNotificationEmail"
								type="email"
								label="Email do powiadomień"
								defaultValue={settings.adminNotificationEmail ?? ""}
								error={state.fieldErrors?.adminNotificationEmail?.[0]}
							/>
						</div>

						<div className="flex items-start gap-3">
							<input
								id="adminNotifyOnCancel"
								name="adminNotifyOnCancel"
								type="checkbox"
								defaultChecked={settings.adminNotifyOnCancel}
								className="mt-0.5 w-4 h-4 rounded border-border-default accent-rose-600 cursor-pointer"
							/>
							<label
								htmlFor="adminNotifyOnCancel"
								className="text-sm text-graphite-900 cursor-pointer leading-snug"
							>
								Powiadom mnie gdy klient anuluje wizytę
							</label>
						</div>
					</div>
				</div>

				{/* Global error */}
				{state.error && (
					<p className="text-sm text-error max-w-2xl">{state.error}</p>
				)}

				{/* Sticky save bar */}
				{(dirty || isPending) && (
					<div
						className={cn(
							"sticky bottom-0 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6",
							"border-t border-border-soft bg-cream/95 backdrop-blur",
							"py-3 flex items-center justify-between gap-4",
						)}
					>
						<p className="text-sm text-graphite-600">Masz niezapisane zmiany.</p>
						<Button
							type="submit"
							disabled={isPending}
							size="sm"
						>
							{isPending ? "Zapisywanie..." : "Zapisz"}
						</Button>
					</div>
				)}
			</form>
			{/* Closed days — separate form, outside the settings form to avoid nesting */}
			<div hidden={activeTab !== "godziny"}>
				<ClosedDaysSection closedDays={closedDays} />
			</div>
		</div>
	)
}

const initialAddState: ClosedDayState = {}

function ClosedDaysSection({closedDays}: {closedDays: SalonClosedDay[]}) {
	const router = useRouter()
	const [addState, addAction, isAddPending] = useActionState(addClosedDay, initialAddState)
	const toast = useToast()
	const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
	const [, startTransition] = useTransition()

	useEffect(() => {
		if (addState.success) {
			toast.success("Dodano dzień zamknięty")
			router.refresh()
		}
	}, [addState.success, router])

	function handleRemoveConfirm(id: string) {
		startTransition(async () => {
			await removeClosedDay(id)
			router.refresh()
			setPendingRemoveId(null)
		})
	}

	return (
		<div className="flex flex-col gap-5 max-w-2xl pt-6 border-t border-border-soft mt-2">
			<h2 className="text-[13px] font-semibold text-graphite-500 uppercase tracking-wide">Dni zamknięte</h2>

			{closedDays.length === 0 ? (
				<p className="text-sm text-graphite-400">Brak dni zamkniętych.</p>
			) : (
				<ul className="flex flex-col gap-2">
					{closedDays.map((day) => {
						const label = format(new Date(day.date), "d MMMM yyyy", {locale: pl})
						return (
							<li
								key={day.id}
								className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white border border-border-soft"
							>
								<div className="flex flex-col gap-0.5 min-w-0">
									<span className="text-sm text-graphite-900">{label}</span>
									{day.reason && (
										<span className="text-xs text-graphite-400 truncate">{day.reason}</span>
									)}
								</div>
								<Button
									className="shrink-0"
									variant="ghost"
									size="sm"
									type="button"
									onClick={() => setPendingRemoveId(day.id)}
								>
									Usuń
								</Button>
								<ConfirmDialog
									open={pendingRemoveId === day.id}
									onClose={() => setPendingRemoveId(null)}
									onConfirm={() => handleRemoveConfirm(day.id)}
									title="Usunąć dzień zamknięty?"
									description={label}
									confirmLabel="Usuń"
									variant="danger"
								/>
							</li>
						)
					})}
				</ul>
			)}

			<form
				action={addAction}
				className="flex flex-col gap-3"
			>
				<div className="flex flex-wrap gap-3 items-end">
					<div className="space-y-1.5">
						<label className="block text-[13px] font-medium text-graphite-900">
							Data
						</label>
						<input
							name="date"
							type="date"
							required
							className={cn(
								"h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
								"transition-[border-color,box-shadow] duration-150 ease-out",
								"focus:outline-none focus:ring-3 focus:ring-rose-500/15",
								"border-border-default focus:border-rose-500",
							)}
						/>
					</div>
					<div className="flex-1 min-w-[160px] space-y-1.5">
						<label className="block text-[13px] font-medium text-graphite-900">
							Powód (opcjonalnie)
						</label>
						<input
							name="reason"
							type="text"
							placeholder="np. święto, remont"
							className={cn(
								"w-full h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
								"transition-[border-color,box-shadow] duration-150 ease-out",
								"focus:outline-none focus:ring-3 focus:ring-rose-500/15",
								"border-border-default focus:border-rose-500",
							)}
						/>
					</div>
					<Button
						className="shrink-0"
						type="submit"
						size="sm"
						disabled={isAddPending}
					>
						{isAddPending ? "Dodawanie..." : "Dodaj"}
					</Button>
				</div>
				{addState.error && (
					<p className="text-xs text-error">{addState.error}</p>
				)}
			</form>
		</div>
	)
}
