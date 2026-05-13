import Link from "next/link"
import {ArrowRight} from "lucide-react"
import {buttonStyles} from "@/components/ui/button"
import {formatMoney} from "@/lib/money"
import {cn} from "@/lib/cn"
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
        <div
            className={cn(
                "group flex flex-col h-full p-5 md:p-6 rounded-xl bg-white",
                "border border-border-soft",
                "transition-[border-color,box-shadow] duration-200 ease-out",
                "hover-supported:hover:border-rose-300 hover-supported:hover:shadow-sm",
            )}
        >
            <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="font-serif font-medium text-[19px] text-graphite-900 leading-tight tracking-tight">
                    {service.name}
                </h3>
                <div className="font-serif font-medium text-[20px] text-graphite-900 tracking-tight tabular-nums whitespace-nowrap shrink-0">
                    {formatMoney(service.defaultPriceGr)}
                </div>
            </div>

            {service.description && (
                <p className="text-[13px] text-graphite-600 leading-relaxed">
                    {service.description}
                </p>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-border-soft -mx-5 md:-mx-6 px-5 md:px-6 mt-5 md:mt-6">
                <div className="text-xs text-graphite-400">
                    {formatDuration(service.defaultDurationMin)}
                </div>
                <Link
                    className={buttonStyles({size: "sm", variant: "secondary"})}
                    href={`/rezerwacja?service=${service.id}`}
                >
                    Zarezerwuj
                    <ArrowRight
                        className="transition-[transform] duration-150 ease-out md:group-hover:translate-x-0.5"
                        size={14}
                    />
                </Link>
            </div>
        </div>
    )
}
