// src/app/(auth)/konto/powiadomienia/_components/notifications-settings.tsx
"use client"

import {useState} from "react"
import Link from "next/link"
import {cn} from "@/lib/cn"
import {buttonStyles} from "@/components/ui/button"

const selectClass = cn(
	"px-3.5 py-2.75 text-sm bg-surface border border-border-subtle rounded-md text-primary w-full max-w-xs outline-none",
	"transition-[border-color,opacity] duration-150 ease-out",
	"hover-supported:hover:border-border-subtle focus:border-interactive",
	"disabled:opacity-50 disabled:cursor-not-allowed",
)

interface Settings {
	sms: boolean
	email: boolean
	confirmation: boolean
	reminder: boolean
	change: boolean
	promo: boolean
	birthday: boolean
	reminderTiming: string
}

// Hardcoded defaults - wiring to logic comes later.
const DEFAULTS: Settings = {
	sms: true,
	email: true,
	confirmation: true,
	reminder: true,
	change: true,
	promo: false,
	birthday: true,
	reminderTiming: "48h",
}

function Switch({
	checked,
	onChange,
	labelId,
}: {
	checked: boolean
	onChange: (value: boolean) => void
	labelId: string
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-labelledby={labelId}
			onClick={() => onChange(!checked)}
			className={cn(
				"relative inline-flex h-6 w-11 shrink-0 rounded-full border cursor-pointer",
				"transition-[background-color,border-color] duration-150 ease-out",
				checked ? "bg-interactive border-interactive" : "bg-surface-muted border-border-subtle",
			)}
		>
			<span
				className={cn(
					"absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-sm",
					"transition-transform duration-150 ease-out",
					checked && "translate-x-5",
				)}
			/>
		</button>
	)
}

function ToggleRow({
	id,
	title,
	desc,
	checked,
	onChange,
}: {
	id: string
	title: string
	desc: string
	checked: boolean
	onChange: (value: boolean) => void
}) {
	return (
		<div className="flex justify-between items-center gap-4 py-4 border-b border-border-subtle last:border-b-0">
			<div className="min-w-0">
				<h4 id={`${id}-label`} className="font-medium text-sm text-primary mb-0.5">
					{title}
				</h4>
				<p className="text-xs text-secondary leading-relaxed max-w-135">{desc}</p>
			</div>
			<Switch checked={checked} onChange={onChange} labelId={`${id}-label`} />
		</div>
	)
}

function CardSection({
	title,
	em,
	desc,
	children,
}: {
	title: string
	em: string
	desc: string
	children: React.ReactNode
}) {
	return (
		<section className="bg-surface border border-border-subtle rounded-lg mb-5">
			<div className="px-7 pt-5.5 pb-1">
				<h3 className="font-display font-medium text-[19px] text-primary tracking-[-0.01em] mb-0.5">
					{title} <em className="italic text-interactive font-normal">{em}</em>
				</h3>
				<p className="text-[13px] text-secondary">{desc}</p>
			</div>
			<div className="px-7 pb-3 pt-1">{children}</div>
		</section>
	)
}

export function NotificationsSettings() {
	const [s, setS] = useState<Settings>(DEFAULTS)

	function set<K extends keyof Settings>(key: K, value: Settings[K]) {
		setS((prev) => ({...prev, [key]: value}))
	}

	return (
		<div>
			<CardSection
				title="Kanały"
				em="dostarczania"
				desc="Wybierz, jak chcesz otrzymywać powiadomienia."
			>
				<ToggleRow
					id="sms"
					title="SMS"
					desc="Krótkie wiadomości tekstowe na Twój numer telefonu."
					checked={s.sms}
					onChange={(v) => set("sms", v)}
				/>
				<ToggleRow
					id="email"
					title="Email"
					desc="Powiadomienia i potwierdzenia na Twój adres email."
					checked={s.email}
					onChange={(v) => set("email", v)}
				/>
			</CardSection>

			<CardSection
				title="Twoje"
				em="wizyty"
				desc="Powiadomienia związane z Twoimi rezerwacjami."
			>
				<ToggleRow
					id="confirmation"
					title="Potwierdzenie rezerwacji"
					desc="Wiadomość po zarezerwowaniu wizyty z podsumowaniem terminu i zabiegów."
					checked={s.confirmation}
					onChange={(v) => set("confirmation", v)}
				/>
				<ToggleRow
					id="reminder"
					title="Przypomnienie o wizycie"
					desc="Przypomnienie przed nadchodzącą wizytą, żeby nic Ci nie umknęło."
					checked={s.reminder}
					onChange={(v) => set("reminder", v)}
				/>

				<div className="flex justify-between items-center gap-4 py-4 border-b border-border-subtle">
					<div className="min-w-0">
						<label
							htmlFor="reminderTiming"
							className="font-medium text-sm text-primary mb-0.5 block"
						>
							Czas przypomnienia
						</label>
						<p className="text-xs text-secondary leading-relaxed max-w-135">
							Z jakim wyprzedzeniem wysłać przypomnienie.
						</p>
					</div>
					<select
						id="reminderTiming"
						value={s.reminderTiming}
						disabled={!s.reminder}
						onChange={(e) => set("reminderTiming", e.target.value)}
						className={selectClass}
					>
						<option value="48h">48h przed wizytą</option>
						<option value="24h">24h przed wizytą</option>
						<option value="day-2h">Dzień wcześniej i 2h przed</option>
					</select>
				</div>

				<ToggleRow
					id="change"
					title="Zmiana lub odwołanie wizyty"
					desc="Powiadomienie, gdy termin Twojej wizyty się zmieni lub zostanie odwołany."
					checked={s.change}
					onChange={(v) => set("change", v)}
				/>
			</CardSection>

			<CardSection
				title="Marketing"
				em="i oferty"
				desc="Wiadomości, które nie dotyczą bezpośrednio Twoich wizyt."
			>
				<ToggleRow
					id="promo"
					title="Promocje i oferty specjalne"
					desc="Informacje o rabatach, pakietach i nowych zabiegach w studiu."
					checked={s.promo}
					onChange={(v) => set("promo", v)}
				/>
				<ToggleRow
					id="birthday"
					title="Oferta urodzinowa"
					desc="Drobny upominek i specjalna oferta w okolicy Twoich urodzin."
					checked={s.birthday}
					onChange={(v) => set("birthday", v)}
				/>
				<p className="text-xs text-secondary pt-3">
					Pełną zgodę marketingową zarządzasz też w sekcji{" "}
					<Link
						href="/konto/dane-osobowe#gdpr"
						className="text-interactive font-medium hover-supported:hover:underline"
					>
						RODO i prywatność
					</Link>
					.
				</p>
			</CardSection>

			<div className="flex gap-2.5 items-center justify-end flex-wrap">
				<button
					type="button"
					onClick={() => setS(DEFAULTS)}
					className={buttonStyles({variant: "secondary", size: "sm"})}
				>
					Przywróć domyślne
				</button>
				<button type="button" className={buttonStyles({size: "sm"})}>
					Zapisz ustawienia
				</button>
			</div>
		</div>
	)
}
