// src/components/public/services/services-hero.tsx
import {Container} from "@/components/ui/container"

export function ServicesHero() {
	return (
		<section className="pt-[50px] pb-[clamp(32px,5vw,56px)]">
			<Container>
				<div className="max-w-xl mx-auto text-center animate-mz-fade">
					<h1 className="font-display font-normal text-[clamp(40px,7vw,60px)] leading-[1.2] mb-6 tracking-[-0.01em] text-balance">
						Pełna oferta <em className="italic text-interactive">w jednym miejscu</em>
					</h1>
					<p className="text-secondary leading-[25px]">
						Wszystkie zabiegi z cenami i czasami trwania. Klikaj &bdquo;Zarezerwuj&rdquo; przy konkretnej
						usłudze albo skorzystaj z menu kategorii niżej.
					</p>
				</div>
			</Container>
		</section>
	)
}
