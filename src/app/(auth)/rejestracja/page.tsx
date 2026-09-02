"use client"

import Link from "next/link"
import {useActionState, useState} from "react"
import {Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck} from "lucide-react"
import {Eyebrow} from "@/components/ui/eyebrow"
import {buttonStyles} from "@/components/ui/button"
import {cn} from "@/lib/cn"
import {registerAction} from "@/app/(auth)/rejestracja/actions";

const benefits = [
	{
		num: "01",
		title: "Rezerwacja jednym kliknięciem",
		desc: "Wybierz termin – dane uzupełniają się same z Twojego profilu.",
	},
	{
		num: "02",
		title: "Historia i przypomnienia",
		desc: "Sprawdzisz kiedy ostatnio robiłaś paznokcie i co zaplanowałaś.",
	},
	{
		num: "03",
		title: "Bez spamu",
		desc: "Tylko przypomnienia o wizycie SMS-em – nic więcej, jeśli nie chcesz.",
	},
] as const

const STRENGTH_LABELS = ["–", "Słabe", "Niezłe", "Dobre", "Bardzo dobre"] as const
const STRENGTH_STAGES = [0, 1, 1, 2, 3] as const

const stageBarClass: Record<number, string> = {
	0: "",
	1: "bg-error",
	2: "bg-warning",
	3: "bg-success",
}

const stageLabelClass: Record<number, string> = {
	0: "text-secondary",
	1: "text-error",
	2: "text-warning",
	3: "text-success",
}

function scorePassword(pw: string): 0 | 1 | 2 | 3 | 4 {
	if (!pw) return 0
	let score = 0
	if (pw.length >= 8) score++
	if (pw.length >= 12) score++
	if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
	if (/\d/.test(pw)) score++
	if (/[^A-Za-z0-9]/.test(pw)) score++
	return Math.min(4, score) as 0 | 1 | 2 | 3 | 4
}

export default function RejestracjaPage() {
	const [showPassword, setShowPassword] = useState(false)
	const [password, setPassword] = useState("")
	const [consentTerms, setConsentTerms] = useState(false)
	const [consentSms, setConsentSms] = useState(true)
	const [consentNews, setConsentNews] = useState(false)
	const [state, formAction, isPending] = useActionState(registerAction, {error: null})

	const score = scorePassword(password)
	const stage = STRENGTH_STAGES[score]

	return (
		<div className="grid min-h-dvh grid-cols-1 lg:h-dvh lg:grid-cols-[1.05fr_1fr]">

			<aside className="relative flex flex-col justify-between overflow-hidden bg-paper-300 px-7 pt-8 pb-10 min-h-70 lg:px-14 lg:py-8">

				<div className="relative z-10 animate-mz-fade">
					<Link href="/" className="inline-block font-display text-[25px] italic font-medium tracking-[-0.01em] text-primary">
						Marzenie
						<span className="-mt-0.5 block font-body text-[9px] not-italic font-medium uppercase tracking-[0.18em] text-secondary">
							studio kosmetyki estetycznej
						</span>
					</Link>
				</div>

				<div className="relative z-10 max-w-115 py-10 animate-mz-fade lg:py-0" style={{animationDelay: "80ms"}}>
					<Eyebrow className="mb-4 block">Twoje konto</Eyebrow>
					<h1 className="mb-4 font-display font-normal text-primary text-[clamp(32px,4vw,48px)] leading-[1.2] tracking-[-0.01em] text-balance">
						Załóż konto{" "}
						<em className="font-normal italic text-interactive">
							i przyspiesz następną rezerwację.
						</em>
					</h1>
					<p className="max-w-95 text-[15px] leading-relaxed text-secondary">
						Konto trzyma Twoje dane, historię wizyt i ulubione zabiegi. Żaden formularz przy następnej rezerwacji.
					</p>
				</div>

				<div className="relative z-10 hidden flex-col gap-4 animate-mz-fade lg:flex" style={{animationDelay: "160ms"}}>
					{benefits.map((b) => (
						<div key={b.num} className="flex items-start gap-3.5">
							<div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface font-display italic text-[13px] font-medium text-interactive">
								{b.num}
							</div>
							<div>
								<strong className="block font-display text-[15px] font-medium leading-snug tracking-[-0.01em] text-primary">
									{b.title}
								</strong>
								<span className="text-[13px] leading-snug text-secondary">{b.desc}</span>
							</div>
						</div>
					))}
				</div>
			</aside>

			<section className="flex flex-col bg-surface px-6 py-10 pb-14 lg:justify-center lg:overflow-y-auto lg:px-14 lg:py-14 lg:pt-40">
				<div className="mx-auto w-full max-w-120">

					<div className="animate-mz-fade">
						<Link
							href="/"
							className={cn(
								"inline-flex items-center gap-1.5 text-[13px] text-secondary",
								"transition-[color] duration-150 ease-out",
								"hover-supported:hover:text-interactive",
							)}
						>
							<ArrowLeft className="size-3.5" />
							Wróć do strony głównej
						</Link>
					</div>

					<div className="mt-8 mb-7 animate-mz-fade" style={{animationDelay: "80ms"}}>
						<Eyebrow className="mb-2.5 block">Rejestracja</Eyebrow>
						<h2 className="mb-2 font-display font-normal text-primary text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.01em]">
							Załóż <em className="font-normal italic text-interactive">konto klienta</em>
						</h2>
						<p className="text-sm text-secondary">
							Masz już konto?{" "}
							<Link href="/logowanie" className="font-medium text-interactive hover-supported:hover:underline">
								Zaloguj się
							</Link>
						</p>
					</div>

					<form action={formAction} className="space-y-4 animate-mz-fade" style={{animationDelay: "160ms"}}>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<TextField
								id="firstName"
								name="firstName"
								label="Imię"
								required
								autoComplete="given-name"
								placeholder="Anna"
							/>
							<TextField
								id="lastName"
								name="lastName"
								label="Nazwisko"
								required
								autoComplete="family-name"
								placeholder="Kowalska"
							/>
						</div>

						<TextField
							id="phone"
							name="phone"
							type="tel"
							label="Numer telefonu"
							required
							autoComplete="tel"
							placeholder="+48 600 100 200"
							hint="Użyjemy go do potwierdzenia wizyty SMS-em."
						/>

						<TextField
							id="email"
							name="email"
							type="email"
							label="Email"
							optionalNote="opcjonalnie"
							autoComplete="email"
							placeholder="anna@example.com"
							hint="Możesz logować się samym numerem telefonu."
						/>

						<div>
							<label htmlFor="password" className="mb-1.5 block text-xs font-medium text-primary">
								Hasło <span className="text-interactive">*</span>
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									name="password"
									required
									minLength={8}
									autoComplete="new-password"
									placeholder="Min. 8 znaków"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={cn(
										"w-full rounded-md border border-border-subtle bg-surface py-3 pl-3.5 pr-11 text-[15px] text-primary",
										"placeholder:text-secondary",
										"transition-[border-color,box-shadow] duration-150 ease-out",
										"focus:outline-none focus-visible:border-interactive focus-visible:ring-3 focus-visible:ring-interactive/15",
									)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
									aria-pressed={showPassword}
									className={cn(
										"absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex cursor-pointer items-center justify-center rounded-sm p-2 text-secondary",
										"transition-[color,background-color] duration-150 ease-out",
										"hover-supported:hover:text-interactive hover-supported:hover:bg-surface-muted",
									)}
								>
									{showPassword ? <EyeOff className="size-[18px]" strokeWidth={1.6} /> : <Eye className="size-[18px]" strokeWidth={1.6} />}
								</button>
							</div>
							<PasswordStrength score={score} stage={stage} />
						</div>

						<div className="mt-2 space-y-3 rounded-md border border-border-subtle bg-paper-300 px-[18px] py-4">
							<ConsentRow id="c-terms" checked={consentTerms} onChange={setConsentTerms} required>
								Akceptuję{" "}
								<Link href="/regulamin" className="text-interactive underline decoration-accent-100 underline-offset-[2px]">
									regulamin
								</Link>{" "}
								i{" "}
								<Link href="/polityka-prywatnosci" className="text-interactive underline decoration-accent-100 underline-offset-[2px]">
									politykę prywatności
								</Link>{" "}
								studia Marzenie. <span className="text-interactive">*</span>
							</ConsentRow>

							<ConsentRow id="c-sms" checked={consentSms} onChange={setConsentSms}>
								Chcę otrzymywać przypomnienia o wizycie SMS-em.
							</ConsentRow>

							<ConsentRow id="c-news" checked={consentNews} onChange={setConsentNews}>
								Chcę dostawać informacje o nowych zabiegach i promocjach (max. 1× w miesiącu).
							</ConsentRow>
						</div>

						{state.error && (
							<p className="text-sm text-error" role="alert">
								{state.error}
							</p>
						)}

						<button
							type="submit"
							disabled={isPending}
							className={cn(buttonStyles({size: "lg", className: "w-full"}), "shadow-sm")}
						>
							{isPending ? "Zakładanie konta..." : "Załóż konto"}
							<ArrowRight className="size-4" strokeWidth={2} />
						</button>

						<div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-secondary">
							<ShieldCheck className="size-3 text-success" strokeWidth={2} />
							Twoje dane są szyfrowane i nigdy nie udostępniamy ich osobom trzecim.
						</div>
					</form>

					<p className="mt-6 text-center text-[13px] text-secondary animate-mz-fade" style={{animationDelay: "320ms"}}>
						Nie chcesz zakładać konta?{" "}
						<Link href="/rezerwacja" className="font-medium text-interactive hover-supported:hover:underline">
							Zarezerwuj jako gość
						</Link>
					</p>

				</div>
			</section>

		</div>
	)
}

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
	id: string
	label: string
	required?: boolean
	optionalNote?: string
	hint?: string
}

function TextField({id, label, required, optionalNote, hint, type = "text", ...props}: TextFieldProps) {
	return (
		<div>
			<label htmlFor={id} className="mb-1.5 block text-xs font-medium text-primary">
				{label}
				{required && <span className="text-interactive"> *</span>}
				{optionalNote && (
					<span className="ml-1 text-[11px] font-normal lowercase text-secondary">
						{optionalNote}
					</span>
				)}
			</label>
			<input
				id={id}
				type={type}
				required={required}
				className={cn(
					"w-full rounded-md border border-border-subtle bg-surface px-3.5 py-3 text-[15px] text-primary",
					"placeholder:text-secondary",
					"transition-[border-color,box-shadow] duration-150 ease-out",
					"focus:outline-none focus-visible:border-interactive focus-visible:ring-3 focus-visible:ring-interactive/15",
				)}
				{...props}
			/>
			{hint && <p className="mt-1.5 text-[11px] leading-snug text-secondary">{hint}</p>}
		</div>
	)
}

function PasswordStrength({score, stage}: {score: number; stage: number}) {
	return (
		<>
			<div className="mt-2 flex gap-1">
				{Array.from({length: 4}).map((_, i) => (
					<div
						key={i}
						className={cn(
							"h-[3px] flex-1 rounded-full transition-[background-color] duration-200 ease-out",
							i < score && stage > 0 ? stageBarClass[stage] : "bg-surface-muted",
						)}
					/>
				))}
			</div>
			<div className="mt-1.5 flex items-baseline justify-between text-[11px]">
				<span className="text-secondary">
					Min. 8 znaków, najlepiej z cyfrą i znakiem specjalnym
				</span>
				<span className={cn("font-medium", stageLabelClass[stage])}>
					{STRENGTH_LABELS[score]}
				</span>
			</div>
		</>
	)
}

interface ConsentRowProps {
	id: string
	checked: boolean
	onChange: (v: boolean) => void
	required?: boolean
	children: React.ReactNode
}

function ConsentRow({id, checked, onChange, required, children}: ConsentRowProps) {
	return (
		<div className="flex items-start gap-2.5">
			<span className="relative mt-px inline-flex shrink-0">
				<input
					id={id}
					type="checkbox"
					checked={checked}
					required={required}
					onChange={(e) => onChange(e.target.checked)}
					className={cn(
						"peer size-[18px] shrink-0 cursor-pointer appearance-none rounded-[4px] border border-border-subtle bg-surface",
						"transition-[background-color,border-color] duration-150 ease-out",
						"checked:bg-interactive checked:border-interactive",
						"focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-interactive/15",
					)}
				/>
				<svg
					viewBox="0 0 18 18"
					className="pointer-events-none absolute inset-0 m-auto size-3 text-white opacity-0 transition-opacity duration-150 ease-out peer-checked:opacity-100"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M4 9.5l3.2 3.2L14 6" />
				</svg>
			</span>
			<label htmlFor={id} className="cursor-pointer select-none text-[12.5px] leading-snug text-secondary">
				{children}
			</label>
		</div>
	)
}
