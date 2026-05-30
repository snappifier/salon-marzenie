"use client"

import Link from "next/link"
import {useActionState, useState} from "react"
import {AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Phone, ShieldCheck, Star} from "lucide-react"
import {Eyebrow} from "@/components/ui/eyebrow"
import {buttonStyles} from "@/components/ui/button"
import {ButterflyWatermark} from "@/components/public/butterfly-watermark"
import {cn} from "@/lib/cn"
import {customerLoginAction, type LoginState} from "@/app/(auth)/logowanie/actions"

const initialState: LoginState = {error: null}

export default function LogowaniePage() {
	const [showPassword, setShowPassword] = useState(false)
	const [remember, setRemember] = useState(true)
	const [state, formAction, isPending] = useActionState(customerLoginAction, initialState)

	return (
		<div className="grid min-h-dvh grid-cols-1 lg:h-dvh lg:grid-cols-[1.05fr_1fr]">

			<aside className="relative flex flex-col justify-between overflow-hidden bg-warm px-7 pt-8 pb-10 min-h-[280px] lg:px-14 lg:py-8">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse 700px 500px at 80% 80%, var(--color-rose-50) 0%, transparent 65%)",
					}}
				/>
				<ButterflyWatermark className="pointer-events-none absolute -bottom-10 -right-8 w-[280px] opacity-45 lg:-bottom-20 lg:-right-16 lg:w-[460px]" />

				<div className="relative z-10 reveal-in">
					<Link href="/" className="inline-block font-serif text-2xl italic font-medium tracking-[-0.01em] text-graphite-900">
						Marzenie
						<span className="-mt-0.5 block font-sans text-[9px] not-italic font-medium uppercase tracking-[0.18em] text-graphite-400">
							studio kosmetyki estetycznej
						</span>
					</Link>
				</div>

				<div className="relative z-10 max-w-[460px] py-10 reveal-in lg:py-0" style={{animationDelay: "80ms"}}>
					<Eyebrow className="mb-4 block">Twoje konto</Eyebrow>
					<h1 className="mb-4 font-serif font-medium text-graphite-900 text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.025em] text-balance">
						Wracasz do nas?{" "}
						<em className="font-normal italic text-rose-600">
							Zaloguj się i zarezerwuj jednym kliknięciem.
						</em>
					</h1>
					<p className="max-w-[380px] text-[15px] leading-relaxed text-graphite-600">
						Twoje dane, historia wizyt i ulubione zabiegi - wszystko w jednym miejscu, gotowe na następny termin.
					</p>
				</div>

				<div
					className="relative z-10 hidden max-w-[420px] rounded-lg border border-border-soft bg-white px-[22px] py-5 shadow-sm reveal-in lg:block"
					style={{animationDelay: "160ms"}}
				>
					<p className="mb-3 font-serif italic text-base leading-snug text-graphite-900">
						&bdquo;Najwygodniej rezerwować online wieczorem - logujesz się, klikasz termin i już.&rdquo;
					</p>
					<div className="flex items-center gap-2.5 border-t border-border-soft pt-3">
						<div className="flex gap-px text-rose-500">
							{Array.from({length: 5}).map((_, i) => (
								<Star key={i} className="size-[11px]" fill="currentColor" strokeWidth={0} />
							))}
						</div>
						<span className="text-xs font-medium text-graphite-600">Magdalena S., Google</span>
					</div>
				</div>
			</aside>

			<section className="flex flex-col bg-cream px-6 py-10 pb-14 lg:justify-center lg:px-14 lg:py-14">
				<div className="mx-auto w-full max-w-[480px]">

					<div className="reveal-in">
						<Link
							href="/"
							className={cn(
								"inline-flex items-center gap-1.5 text-[13px] text-graphite-400",
								"transition-[color] duration-150 ease-out",
								"hover-supported:hover:text-rose-600",
							)}
						>
							<ArrowLeft className="size-3.5" />
							Wróć do strony głównej
						</Link>
					</div>

					<div className="mt-8 mb-8 reveal-in" style={{animationDelay: "80ms"}}>
						<Eyebrow className="mb-2.5 block">Logowanie</Eyebrow>
						<h2 className="mb-2 font-serif font-medium text-graphite-900 text-[32px] leading-[1.15] tracking-[-0.02em]">
							Witaj <em className="font-normal italic text-rose-600">z powrotem</em>
						</h2>
						<p className="text-sm text-graphite-600">
							Nie masz jeszcze konta?{" "}
							<Link
								href="/rejestracja"
								className="font-medium text-rose-600 hover-supported:hover:underline"
							>
								Załóż konto
							</Link>
						</p>
					</div>

					<form action={formAction} className="space-y-4 reveal-in" style={{animationDelay: "160ms"}}>
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
							<label htmlFor="login" className="mb-1.5 block text-xs font-medium text-graphite-900">
								Email lub numer telefonu <span className="text-rose-500">*</span>
							</label>
							<input
								id="login"
								type="text"
								name="login"
								required
								autoComplete="username"
								placeholder="anna@example.com lub +48 600 100 200"
								className={cn(
									"w-full rounded-md border border-border-default bg-white px-3.5 py-3.5 text-[15px] text-graphite-900",
									"placeholder:text-graphite-400",
									"transition-[border-color,box-shadow] duration-150 ease-out",
									"focus:outline-none focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15",
								)}
							/>
						</div>

						<div>
							<div className="mb-1.5 flex items-baseline justify-between">
								<label htmlFor="password" className="block text-xs font-medium text-graphite-900">
									Hasło <span className="text-rose-500">*</span>
								</label>
								<Link href="/reset-hasla" className="text-[10px] font-medium text-rose-600 hover-supported:hover:underline">
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
									className={cn(
										"w-full rounded-md border border-border-default bg-white py-3.5 pl-3.5 pr-11 text-[15px] text-graphite-900",
										"placeholder:text-graphite-400",
										"transition-[border-color,box-shadow] duration-150 ease-out",
										"focus:outline-none focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15",
									)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
									aria-pressed={showPassword}
									className={cn(
										"cursor-pointer absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-sm p-2 text-graphite-400",
										"transition-[color,background-color] duration-150 ease-out",
										"hover-supported:hover:text-rose-600 hover-supported:hover:bg-rose-50",
									)}
								>
									{showPassword ? <EyeOff className="size-[18px]" strokeWidth={1.6} /> : <Eye className="size-[18px]" strokeWidth={1.6} />}
								</button>
							</div>
						</div>

						<label
							htmlFor="remember"
							className="mt-5 mb-6 flex select-none items-center gap-2.5 pt-1 text-[13px] text-graphite-600"
						>
							<span className="relative inline-flex">
								<input
									id="remember"
									type="checkbox"
									checked={remember}
									onChange={(e) => setRemember(e.target.checked)}
									className={cn(
										"peer size-[18px] shrink-0 appearance-none rounded-[4px] border border-border-default bg-white",
										"transition-[background-color,border-color] duration-150 ease-out",
										"checked:bg-rose-500 checked:border-rose-500",
										"focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15",
										"cursor-pointer",
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
							Pozostań zalogowana na tym urządzeniu
						</label>

						<button
							type="submit"
							disabled={isPending}
							className={cn(
								buttonStyles({size: "lg", className: "w-full"}),
								"shadow-sm",
							)}
						>
							{isPending ? "Logowanie..." : "Zaloguj się"}
							{!isPending && <ArrowRight className="size-4" strokeWidth={2} />}
						</button>

						<div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-graphite-400">
							<ShieldCheck className="size-3 text-success" strokeWidth={2} />
							Połączenie szyfrowane. Twoje dane są bezpieczne.
						</div>

						<div className="my-2 flex items-center gap-3.5 text-[11px] uppercase tracking-[0.14em] text-graphite-400">
							<span className="h-px flex-1 bg-border-soft" />
							albo
							<span className="h-px flex-1 bg-border-soft" />
						</div>

						<Link
							href="tel:+48600100200"
							className={cn(
								"flex items-center justify-center gap-2 rounded-md border border-border-soft bg-warm px-4 py-3.5 text-[13px] text-graphite-600",
								"transition-[border-color,color] duration-150 ease-out",
								"hover-supported:hover:border-rose-300 hover-supported:hover:text-graphite-900",
							)}
						>
							<Phone className="size-3.5" strokeWidth={2} />
							Zarezerwuj telefonicznie:{" "}
							<strong className="font-serif font-medium text-graphite-900">+48 600 100 200</strong>
						</Link>
					</form>

					<p className="mt-7 text-center text-[13px] text-graphite-600 reveal-in" style={{animationDelay: "320ms"}}>
						Pierwszy raz u nas?{" "}
						<Link href="/rejestracja" className="font-medium text-rose-600 hover-supported:hover:underline">
							Załóż konto
						</Link>{" "}
						i przyspiesz następną rezerwację.
					</p>

				</div>
			</section>

		</div>
	)
}
