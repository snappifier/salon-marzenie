// src/components/public/landing/pricing.tsx
"use client"

import {useState} from "react"

export interface PriceGroup {
	title: string
	items: {name: string; time: string; price: string}[]
}

interface Props {
	groups: PriceGroup[]
}

export function Pricing({groups}: Props) {
	const [open, setOpen] = useState(0)

	return (
		<section id="cennik" className="bg-surface-muted mx-[-7%] px-[7%] py-[clamp(48px,7vw,80px)] scroll-mt-[96px]">
			<div className="max-w-[1120px] mx-auto">
				<div className="max-w-xl mx-auto mb-[clamp(32px,5vw,48px)] text-center">
					<h2 className="font-display font-normal text-[clamp(32px,5vw,40px)] leading-[25px] mb-8">Cennik</h2>
					<p className="text-secondary">Ceny obejmują konsultację i produkty użyte podczas zabiegu.</p>
				</div>

				<div className="max-w-[760px] mx-auto bg-surface border border-border-subtle rounded-lg overflow-hidden">
					{groups.map((g, i) => {
						const isOpen = open === i
						const panelId = `cennik-panel-${i}`

						return (
							<div key={g.title} className="border-b border-border-subtle last:border-b-0">
								<h3>
									<button
										type="button"
										onClick={() => setOpen(isOpen ? -1 : i)}
										aria-expanded={isOpen}
										aria-controls={panelId}
										className="w-full text-left bg-transparent flex items-center justify-between gap-8 px-10 sm:px-16 py-6 cursor-pointer hover-supported:hover:bg-surface-muted transition-[background-color]"
									>
										<span className="font-display text-xl leading-18">{g.title}</span>
										<span aria-hidden="true" className="text-interactive text-[24px] leading-none">
											{isOpen ? "–" : "+"}
										</span>
									</button>
								</h3>

								{isOpen && (
									<div id={panelId} className="px-10 sm:px-16 pb-12 pt-6 flex flex-col gap-8">
										{g.items.map((it) => (
											<div key={it.name} className="flex justify-between items-baseline gap-12 flex-wrap">
												<div className="flex-1 min-w-[200px]">
													<div className="text-primary">{it.name}</div>
													<div className="text-sm text-secondary">{it.time}</div>
												</div>
												<div className="whitespace-nowrap text-primary">{it.price}</div>
											</div>
										))}
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
