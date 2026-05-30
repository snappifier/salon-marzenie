// src/app/(auth)/konto/dane-osobowe/_components/ui.tsx
import {cn} from "@/lib/cn"

export const inputClass = cn(
	"px-3.5 py-2.75 text-sm bg-white border border-border-soft rounded-md text-graphite-900 w-full outline-none",
	"transition-[border-color] duration-150 ease-out",
	"hover-supported:hover:border-border-default focus:border-rose-400",
	"placeholder:text-graphite-400",
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
		<section id={id} className="bg-white border border-border-soft rounded-lg mb-5 scroll-mt-6">
			<div className="px-7 pt-5.5 pb-4">
				<h3 className="font-serif font-medium text-[19px] text-graphite-900 tracking-[-0.01em] mb-0.5">
					{title} <em className="italic text-rose-600 font-normal">{em}</em>
				</h3>
				<p className="text-[13px] text-graphite-400">{desc}</p>
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
				className="text-[11px] uppercase tracking-[0.14em] text-graphite-400 font-medium"
			>
				{label}
			</label>
			{children}
			{error ? (
				<span className="text-xs text-error">{error}</span>
			) : hint ? (
				<span className="text-xs text-graphite-400">{hint}</span>
			) : null}
		</div>
	)
}
