// src/app/(public)/page.tsx
import {getCategoriesWithServices} from "@/features/landing/queries"
import {getNextAvailableSlot} from "@/features/booking/next-slot"
import {landing} from "@/lib/content"
import {formatRelativeSlot} from "@/lib/date"
import {formatMoneyCompact} from "@/lib/money"
import {Hero} from "@/components/public/landing/hero"
import {Services} from "@/components/public/landing/services"
import {Pricing, type PriceGroup} from "@/components/public/landing/pricing"
import {Reviews} from "@/components/public/landing/reviews"
import {Faq} from "@/components/public/landing/faq"
import {StickyBar} from "@/components/public/sticky-bar"

export default async function HomePage() {
	const [categories, nextSlot] = await Promise.all([
		getCategoriesWithServices(),
		getNextAvailableSlot(),
	])

	const priceGroups: PriceGroup[] = categories.map((cat) => ({
		title: cat.name,
		items: cat.services.map((s) => ({
			name: s.name,
			time: `${s.defaultDurationMin} min`,
			price: formatMoneyCompact(s.defaultPriceGr),
		})),
	}))

	return (
		<>
			<Hero />

			<div className="w-full px-[7%]">
				<Services />
				<Pricing groups={priceGroups} />
				<Reviews />
				<Faq items={landing.faq} />
			</div>

			<StickyBar nextSlotLabel={nextSlot ? formatRelativeSlot(nextSlot) : null} />
		</>
	)
}
