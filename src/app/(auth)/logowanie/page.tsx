// src/app/(auth)/logowanie/page.tsx
"use client"

import Link from "next/link"
import {useActionState, useState} from "react"
import {AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Phone, ShieldCheck} from "lucide-react"
import {Eyebrow} from "@/components/ui/eyebrow"
import {buttonStyles} from "@/components/ui/button"
import {site} from "@/lib/content"
import {cn} from "@/lib/cn"
import {customerLoginAction, type LoginState} from "@/app/(auth)/logowanie/actions"

const initialState: LoginState = {error: null}

const inputStyles = cn(
	"w-full rounded-md border border-border-subtle bg-surface px-3.5 py-3.5 text-[15px] text-primary",
	"placeholder:text-secondary/60",
	"transition-[border-color,box-shadow] duration-200 ease-out",
	"focus:outline-none focus-visible:border-interactive focus-visible:ring-3 focus-visible:ring-interactive/15",
)

export default function LogowaniePage() {
	const [showPassword, setShowPassword] = useState(false)
	const [remember, setRemember] = useState(true)
	const [state, formAction, isPending] = useActionState(customerLoginAction, initialState)

	return (
		<div className="grid min-h-dvh grid-cols-1 lg:h-dvh lg:grid-cols-[1.05fr_1fr]">

			<aside className="relative flex flex-col justify-between overflow-hidden bg-paper-300 px-7 pt-8 pb-10 min-h-[280px] lg:px-14 lg:py-8">
				<div className="relative z-10 animate-mz-fade">
					<Link href="/" className="inline-block font-display text-[25px] tracking-tight text-primary">
						{site.salonName}
						<span className="-mt-0.5 block font-body text-[9px] font-medium uppercase tracking-caps text-secondary">
							{site.tagline}
						</span>
					</Link>
				</div>

				<div className="relative z-10 max-w-[460px] py-10 animate-mz-fade lg:py-0" style={{animationDelay: "80ms"}}>
					<Eyebrow className="mb-4 block">Twoje konto</Eyebrow>
					<h1 className="mb-6 font-display font-normal text-primary text-[clamp(32px,4vw,48px)] leading-[1.2] tracking-[-0.01em] text-balance">
						Wracasz do nas?{" "}
						<em className="italic text-interactive">Zaloguj się i zarezerwuj jednym kliknięciem.</em>
					</h1>
					<p className="max-w-[380px] text-base leading-7 text-secondary">
						Twoje dane, historia wizyt i ulubione zabiegi — wszystko w jednym miejscu, gotowe na następny termin.
					</p>
				</div>

				<figure
					className="relative z-10 m-0 hidden max-w-[420px] flex-col gap-5 rounded-md border border-border-subtle bg-surface p-6 animate-mz-fade lg:flex"
					style={{animationDelay: "160ms"}}
				>
					<blockquote className="m-0 font-display text-lg leading-[30px] tracking-tight text-primary">
						Najwygodniej rezerwować online wieczorem — logujesz się, klikasz termin i już.
					</blockquote>
					<figcaption className="border-t border-border-subtle pt-4 text-sm text-secondary">
						Magdalena S. · Google
					</figcaption>
				</figure>
			</aside>

			<section className="flex flex-col bg-surface px-6 py-10 pb-14 lg:justify-center lg:px-14 lg:py-14">
				<div className="mx-auto w-full max-w-[480px]">

					<div className="animate-mz-fade">
						<Link
							href="/"
							className={cn(
								"inline-flex items-center gap-1.5 text-[13px] text-secondary",
								"transition-[color,background-color,border-color] duration-200 ease-out",
								"hover-supported:hover:text-interactive",
							)}
						>
							<ArrowLeft className="size-3.5" />
							Wróć do strony głównej
						</Link>
					</div>

					<div className="mt-8 mb-8 animate-mz-fade" style={{animationDelay: "80ms"}}>
						<Eyebrow className="mb-2.5 block">Logowanie</Eyebrow>
						<h2 className="mb-3 font-display font-normal text-primary text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.01em]">
							Witaj <em className="italic text-interactive">z powrotem</em>
						</h2>
						<p className="text-sm text-secondary">
							Nie masz jeszcze konta?{" "}
							<Link href="/rejestracja" className="text-interactive hover-supported:hover:underline">
								Załóż konto
							</Link>
						</p>
					</div>

					<form action={formAction} className="space-y-4 animate-mz-fade" style={{animationDelay: "160ms"}}>
						{state.error && (
							<div
								role="alert"
								className="flex items-start gap-2 rounded-md border border-error/30 bg-error-bg px-3.5 py-3 text-[13px] text-error"
							>
								<AlertCircle className="mt-px size-4 shrink-0" strokeWidth={2} />
								<span>{state.error}</span>
							</div>
						)}

						<div>
							<label htmlFor="login" className="mb-1.5 block text-xs text-primary">
								Email lub numer telefonu <span className="text-interactive">*</span>
							</label>
							<input
								id="login"
								type="text"
								name="login"
								required
								autoComplete="username"
								placeholder="anna@example.com lub +48 600 100 200"
								className={inputStyles}
							/>
						</div>

						<div>
							<div className="mb-1.5 flex items-baseline justify-between gap-3">
								<label htmlFor="password" className="block text-xs text-primary">
									Hasło <span className="text-interactive">*</span>
								</label>
								<Link href="/reset-hasla" className="text-xs text-interactive hover-supported:hover:underline">
									Nie pamiętam hasła
								</Link>
							</div>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									name="password"
									required
									autoComplete="current-password"
									placeholder="Twoje hasło"
									className={cn(inputStyles, "pr-11")}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
									aria-pressed={showPassword}
									className={cn(
										"cursor-pointer absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-sm p-2 text-secondary",
										"transition-[color,background-color,border-color] duration-200 ease-out",
										"hover-supported:hover:text-interactive hover-supported:hover:bg-surface-muted",
									)}
								>
									{showPassword ? <EyeOff className="size-[18px]" strokeWidth={1.6} /> : <Eye className="size-[18px]" strokeWidth={1.6} />}
								</button>
							</div>
						</div>

						<label
							htmlFor="remember"
							className="mt-5 mb-6 flex select-none items-center gap-2.5 pt-1 text-[13px] text-secondary"
						>
							<span className="relative inline-flex">
								<input
									id="remember"
									type="checkbox"
									checked={remember}
									onChange={(e) => setRemember(e.target.checked)}
									className={cn(
										"peer size-[18px] shrink-0 appearance-none rounded-sm border border-border-subtle bg-surface",
										"transition-[color,background-color,border-color] duration-200 ease-out",
										"checked:bg-interactive checked:border-interactive",
										"focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-interactive/15",
										"cursor-pointer",
									)}
								/>
								<svg
									viewBox="0 0 18 18"
									className="pointer-events-none absolute inset-0 m-auto size-3 text-white opacity-0 transition-opacity duration-200 ease-out peer-checked:opacity-100"
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
							Pozostań zalogowana na tym urządzeniu
						</label>

						<button type="submit" disabled={isPending} className={buttonStyles({size: "lg", className: "w-full"})}>
							{isPending ? "Logowanie..." : "Zaloguj się"}
							{!isPending && <ArrowRight className="size-4" strokeWidth={2} />}
						</button>

						<div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-secondary">
							<ShieldCheck className="size-3 text-success" strokeWidth={2} />
							Połączenie szyfrowane. Twoje dane są bezpieczne.
						</div>

						<div className="my-2 flex items-center gap-3.5 text-[11px] uppercase tracking-caps text-secondary">
							<span className="h-px flex-1 bg-border-subtle" />
							albo
							<span className="h-px flex-1 bg-border-subtle" />
						</div>

						<Link
							href="tel:+48600100200"
							className={cn(
								"flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface-muted px-4 py-3.5 text-[13px] text-secondary",
								"transition-[color,background-color,border-color] duration-200 ease-out",
								"hover-supported:hover:border-interactive hover-supported:hover:text-primary",
							)}
						>
							<Phone className="size-3.5" strokeWidth={2} />
							Zarezerwuj telefonicznie:{" "}
							<strong className="font-display font-medium text-primary">+48 600 100 200</strong>
						</Link>
					</form>

					<p className="mt-7 text-center text-[13px] text-secondary animate-mz-fade" style={{animationDelay: "320ms"}}>
						Pierwszy raz u nas?{" "}
						<Link href="/rejestracja" className="text-interactive hover-supported:hover:underline">
							Załóż konto
						</Link>{" "}
						i przyspiesz następną rezerwację.
					</p>

				</div>
			</section>

		</div>
	)
}
