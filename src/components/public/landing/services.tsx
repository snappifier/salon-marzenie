// src/components/public/landing/services.tsx
import Link from "next/link"
import {getCategoriesWithServices} from "@/features/landing/queries"
import {landing} from "@/lib/content"
import {formatMoneyCompact} from "@/lib/money"

function durationRange(minutes: number[]): string {
	const min = Math.min(...minutes)
	const max = Math.max(...minutes)
	return min === max ? `${min} min` : `${min}–${max} min`
}

export async function Services() {
	const categories = await getCategoriesWithServices()

	return (
		<section id="oferta" className="max-w-[1120px] mx-auto py-[clamp(48px,7vw,60px)] scroll-mt-[96px]">
			<div className="max-w-xl mx-auto mb-[clamp(32px,5vw,56px)] text-center">
				<h2 className="font-display font-normal text-[clamp(32px,5vw,40px)] leading-[25px] mb-8">Zabiegi</h2>
				<p className="text-secondary leading-[25px]">
					Każdą wizytę zaczynamy od rozmowy o tym, czego potrzebuje Twoja skóra. Plan zabiegu dobieramy dopiero potem.
				</p>
			</div>

			<div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
				{categories.map((cat) => {
					const prices = cat.services.map((s) => s.defaultPriceGr)
					const durations = cat.services.map((s) => s.defaultDurationMin)
					// Kategorie nie mają opisu w bazie — bierzemy tekst redakcyjny,
					// a gdy go brak, pierwszy opis usługi z tej kategorii.
					const description =
						landing.categoryDescriptions[cat.slug] ??
						cat.services.find((s) => s.description)?.description

					return (
						<Link
							key={cat.id}
							href={`/uslugi#${cat.slug}`}
							className="border border-border-subtle rounded-lg p-12 flex flex-col gap-6 transition-[border-color] duration-200 ease-out hover-supported:hover:border-interactive"
						>
							<h3 className="font-display font-medium text-xl leading-16">{cat.name}</h3>
							<p className="text-secondary flex-1">
								{description ?? `Zabiegi z kategorii ${cat.name.toLowerCase()}.`}
							</p>
							<div className="flex gap-8 text-sm text-secondary pt-6 border-t border-border-subtle">
								<span className="text-primary">od {formatMoneyCompact(Math.min(...prices))}</span>
								<span>{durationRange(durations)}</span>
							</div>
						</Link>
					)
				})}
			</div>
		</section>
	)
}
