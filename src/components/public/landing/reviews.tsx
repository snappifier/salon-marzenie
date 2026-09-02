// src/components/public/landing/reviews.tsx
import {landing} from "@/lib/content"

export function Reviews() {
	return (
		<section id="opinie" className="max-w-[1120px] mx-auto py-[clamp(48px,7vw,96px)] scroll-mt-[96px]">
			<h2 className="font-display font-normal text-[clamp(32px,5vw,40px)] leading-[48px] mb-[clamp(32px,5vw,56px)] text-center">
				Co mówią klientki
			</h2>

			<div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
				{landing.reviews.map((r) => (
					<figure key={r.author} className="m-0 flex flex-col gap-10 border border-border-subtle p-8 rounded-md">
						<blockquote className="m-0 font-display text-lg leading-[30px] tracking-tight text-primary">
							{r.text.replace(/^PLACEHOLDER:\s*/, "")}
						</blockquote>
						<figcaption className="text-sm text-secondary pt-8 border-t border-border-subtle">
							{r.author} · {r.source}
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	)
}
