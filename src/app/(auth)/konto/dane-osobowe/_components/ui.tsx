// src/app/(auth)/konto/dane-osobowe/_components/ui.tsx
import {cn} from "@/lib/cn"

export const inputClass = cn(
	"px-3.5 py-2.75 text-sm bg-surface border border-border-subtle rounded-md text-primary w-full outline-none",
	"transition-[border-color] duration-150 ease-out",
	"hover-supported:hover:border-border-subtle focus:border-interactive",
	"placeholder:text-secondary",
)

export function Card({
	id,
	title,
	em,
	desc,
	children,
}: {
	id?: string
	title: string
	em: string
	desc: string
	children: React.ReactNode
}) {
	return (
		<section id={id} className="bg-surface border border-border-subtle rounded-lg mb-5 scroll-mt-6">
			<div className="px-7 pt-5.5 pb-4">
				<h3 className="font-display font-medium text-[19px] text-primary tracking-[-0.01em] mb-0.5">
					{title} <em className="italic text-interactive font-normal">{em}</em>
				</h3>
				<p className="text-[13px] text-secondary">{desc}</p>
			</div>
			<div className="px-7 pb-6.5 pt-1.5">{children}</div>
		</section>
	)
}

export function Field({
	label,
	htmlFor,
	hint,
	full,
	error,
	children,
}: {
	label: React.ReactNode
	htmlFor: string
	hint?: string
	full?: boolean
	error?: string
	children: React.ReactNode
}) {
	return (
		<div className={cn("flex flex-col gap-1.5", full && "sm:col-span-2")}>
			<label
				htmlFor={htmlFor}
				className="text-[11px] uppercase tracking-[0.18em] text-secondary font-medium"
			>
				{label}
			</label>
			{children}
			{error ? (
				<span className="text-xs text-error">{error}</span>
			) : hint ? (
				<span className="text-xs text-secondary">{hint}</span>
			) : null}
		</div>
	)
}
