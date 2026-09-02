// src/components/public/services/service-row.tsx
import Link from "next/link"
import {formatMoneyCompact} from "@/lib/money"
import type {CategoryWithServices} from "@/features/landing/queries"

type Service = CategoryWithServices["services"][number]

interface Props {
	service: Service
}

function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes} min`
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`
}

export function ServiceRow({service}: Props) {
	return (
		<Link
			className="group border border-border-subtle rounded-lg p-6 flex flex-col gap-3 transition-[border-color] duration-200 ease-out hover-supported:hover:border-interactive"
			href={`/rezerwacja?service=${service.id}`}
		>
			<h3 className="font-display font-medium text-lg leading-8">{service.name}</h3>

			{service.description && (
				<p className="text-sm text-secondary flex-1">{service.description}</p>
			)}

			<div className="flex gap-6 text-sm text-secondary pt-4 border-t border-border-subtle">
				<span className="text-primary">{formatMoneyCompact(service.defaultPriceGr)}</span>
				<span>{formatDuration(service.defaultDurationMin)}</span>
				<span className="ml-auto text-interactive">Zarezerwuj</span>
			</div>
		</Link>
	)
}
