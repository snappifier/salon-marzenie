// src/app/(auth)/konto/dane-osobowe/_components/personal-data-form.tsx
"use client"

import {useActionState} from "react"
import {Check, Mail, Phone} from "lucide-react"
import {cn} from "@/lib/cn"
import {buttonStyles} from "@/components/ui/button"
import {updatePersonalData, type PersonalDataState} from "@/features/account/actions"
import {Card, Field, inputClass} from "./ui"

interface Props {
	initial: {firstName: string; lastName: string; email: string; phone: string}
}

const initialState: PersonalDataState = {}

const trailingIcon = "absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"

export function PersonalDataForm({initial}: Props) {
	const [state, formAction, isPending] = useActionState(updatePersonalData, initialState)
	const fe = state.fieldErrors ?? {}

	return (
		<form action={formAction}>
			<Card
				id="basic"
				title="Dane"
				em="podstawowe"
				desc="Imię i nazwisko — używane w potwierdzeniach i przy wizycie."
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Field label="Imię" htmlFor="firstName" error={fe.firstName}>
						<input
							id="firstName"
							name="firstName"
							type="text"
							defaultValue={initial.firstName}
							className={cn(inputClass, fe.firstName && "border-error")}
						/>
					</Field>
					<Field label="Nazwisko" htmlFor="lastName" error={fe.lastName}>
						<input
							id="lastName"
							name="lastName"
							type="text"
							defaultValue={initial.lastName}
							className={cn(inputClass, fe.lastName && "border-error")}
						/>
					</Field>
				</div>
			</Card>

			<Card
				id="contact"
				title="Dane"
				em="kontaktowe"
				desc="Telefon do powiadomień SMS, email do potwierdzeń i przypomnień."
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Field
						label="Email"
						htmlFor="email"
						error={fe.email}
						hint="Zostaw puste, jeśli nie chcesz podawać adresu."
					>
						<div className="relative">
							<input
								id="email"
								name="email"
								type="email"
								defaultValue={initial.email}
								className={cn(inputClass, "pr-10", fe.email && "border-error")}
							/>
							<Mail size={16} strokeWidth={2} className={trailingIcon} />
						</div>
					</Field>
					<Field label="Telefon" htmlFor="phone" error={fe.phone}>
						<div className="relative">
							<input
								id="phone"
								name="phone"
								type="tel"
								defaultValue={initial.phone}
								className={cn(inputClass, "pr-10", fe.phone && "border-error")}
							/>
							<Phone size={16} strokeWidth={2} className={trailingIcon} />
						</div>
					</Field>
				</div>
			</Card>

			<div className="flex gap-3 items-center flex-wrap mb-5">
				{state.ok && (
					<span className="text-xs text-success inline-flex items-center gap-1.5">
						<Check size={13} strokeWidth={2.4} />
						Zapisano zmiany.
					</span>
				)}
				{state.error && <span className="text-xs text-error">{state.error}</span>}
				<div className="flex-1" />
				<button
					type="reset"
					disabled={isPending}
					className={buttonStyles({variant: "secondary", size: "sm"})}
				>
					Anuluj zmiany
				</button>
				<button type="submit" disabled={isPending} className={buttonStyles({size: "sm"})}>
					{isPending ? "Zapisywanie…" : "Zapisz"}
				</button>
			</div>
		</form>
	)
}
