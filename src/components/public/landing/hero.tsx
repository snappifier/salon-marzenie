// src/components/public/landing/hero.tsx
import Image from "next/image"
import Link from "next/link"
import {landing, site} from "@/lib/content"

export function Hero() {
	return (
		<section id="top" className="w-full px-[7%] pt-[50px] pb-[clamp(48px,7vw,80px)]">
			<div className="mx-auto text-center animate-mz-fade">
				<div className="w-full flex justify-center items-center pb-4 gap-6 mb-10">
					<Image
						src="/logo.png"
						alt=""
						width={240}
						height={240}
						priority
						className="h-[clamp(64px,15vw,120px)] w-auto"
					/>
					<div className="flex flex-col font-display text-left tracking-tight leading-[1.01]">
						<p className="text-[clamp(13px,3.6vw,18px)]">{landing.hero.eyebrow}</p>
						<p className="text-[clamp(30px,9vw,70px)] font-medium text-interactive">{site.salonName}</p>
					</div>
				</div>

				<h1 className="font-display font-normal text-[clamp(40px,7vw,60px)] leading-[1.2] mb-12 tracking-[-0.01em] text-balance max-w-[760px] mx-auto">
					{landing.hero.headline}{" "}
					<em className="italic text-interactive">{landing.hero.headlineHighlight}</em>
				</h1>

				<p className="text-lg leading-10 text-secondary mx-auto mb-8 max-w-3xl text-balance">
					{landing.hero.subtitle}
				</p>

				<div className="flex flex-wrap gap-8 justify-center items-center">
					<Link
						href="/rezerwacja"
						className="bg-interactive text-white rounded-full px-8 py-1 text-base font-medium leading-12 transition-[color,background-color,border-color] duration-[240ms] ease-out hover-supported:hover:bg-interactive-hover hover-supported:hover:shadow-md"
					>
						Zarezerwuj wizytę
					</Link>
					<Link
						href="#cennik"
						className="text-base leading-6 text-secondary border-b border-border-subtle pb-1 transition-[color,border-color] duration-200 ease-out hover-supported:hover:text-interactive hover-supported:hover:border-interactive"
					>
						Zobacz cennik
					</Link>
				</div>
			</div>

			<div className="mt-[clamp(40px,6vw,64px)] animate-mz-fade-only relative w-full aspect-[21/9] min-h-[280px] rounded-lg border border-border-subtle overflow-hidden">
				<Image
					src="/srodek_salon.jpg"
					alt="Wnętrze salonu Marzenie"
					fill
					sizes="86vw"
					className="object-cover brightness-65"
				/>
			</div>
		</section>
	)
}
