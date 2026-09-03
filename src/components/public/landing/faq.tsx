// src/components/public/landing/faq.tsx
"use client"

import {useState} from "react"

export interface FaqItem {
	q: string
	a: string
}

interface Props {
	items: FaqItem[]
}

export function Faq({items}: Props) {
	const [open, setOpen] = useState(-1)

	return (
		<section id="faq" className="max-w-[1120px] mx-auto px-0 pb-[clamp(48px,7vw,96px)] scroll-mt-[96px]">
			<div className="max-w-[760px] mx-auto">
				<h2 className="font-display font-normal text-[clamp(32px,5vw,40px)] leading-[48px] mb-[clamp(24px,4vw,40px)] text-center">
					Pytania i odpowiedzi
				</h2>

				{items.map((f, i) => {
					const isOpen = open === i
					const panelId = `faq-panel-${i}`

					return (
						<div key={f.q} className="border-t border-border-subtle">
							<h3>
								<button
									type="button"
									onClick={() => setOpen(isOpen ? -1 : i)}
									aria-expanded={isOpen}
									aria-controls={panelId}
									className="w-full bg-transparent py-8 flex items-start justify-between gap-12 cursor-pointer text-left text-primary text-base font-normal"
								>
									<span>{f.q}</span>
									<span aria-hidden="true" className="text-interactive text-lg leading-6 shrink-0">
										{isOpen ? "–" : "+"}
									</span>
								</button>
							</h3>

							{isOpen && (
								<p id={panelId} className="m-0 pb-12 pr-0 sm:pr-24 text-secondary text-base max-w-[70ch]">
									{f.a}
								</p>
							)}
						</div>
					)
				})}
			</div>
		</section>
	)
}
