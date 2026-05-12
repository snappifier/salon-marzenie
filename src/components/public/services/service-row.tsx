import Link from "next/link"
import {buttonStyles} from "@/components/ui/button"
import {formatMoney} from "@/lib/money"
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
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] gap-x-4 md:gap-x-8 gap-y-3 py-5 md:py-6 border-b border-border-soft last:border-b-0 items-end md:items-center transition-[padding] duration-200 ease-out md:hover-supported:hover:px-3">
            <div className="col-span-2 md:col-span-1 min-w-0">
                <div className="font-serif font-medium text-[19px] text-graphite-900 leading-tight tracking-tight mb-1">
                    {service.name}
                </div>
                {service.description && (
                    <p className="text-[13px] text-graphite-600 leading-relaxed mb-1.5 max-w-[520px]">
                        {service.description}
                    </p>
                )}
                <div className="text-xs text-graphite-400">
                    {formatDuration(service.defaultDurationMin)}
                </div>
            </div>

            <div className="font-serif font-medium text-lg md:text-[22px] text-graphite-900 tracking-tight tabular-nums whitespace-nowrap md:text-right">
                {formatMoney(service.defaultPriceGr)}
            </div>

            <div className="justify-self-end">
                <Link
                    href={`/rezerwacja?service=${service.id}`}
                    className={buttonStyles({size: "sm", variant: "secondary"})}
                >
                    Zarezerwuj
                </Link>
            </div>
        </div>
    )
}