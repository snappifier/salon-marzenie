import {cn} from "@/lib/cn"

export function Eyebrow({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "text-[11px] font-medium uppercase tracking-[0.18em] text-interactive",
                className,
            )}
            {...props}
        />
    )
}