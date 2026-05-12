import {cn} from "@/lib/cn"

type Level = "display" | "h1" | "h2" | "h3"

const levels: Record<Level, string> = {
    display: "text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.025em]",
    h1: "text-[clamp(2rem,5vw,3rem)] leading-[1.1] tracking-[-0.02em]",
    h2: "text-[clamp(1.75rem,4vw,2.625rem)] leading-[1.15] tracking-[-0.02em]",
    h3: "text-2xl leading-tight tracking-tight",
}

const defaultElement: Record<Level, "h1" | "h2" | "h3"> = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
}

interface Props extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: Level
    as?: "h1" | "h2" | "h3" | "h4"
}

export function Heading({className, level = "h2", as, ...props}: Props) {
    const Component = as ?? defaultElement[level]
    return (
        <Component
            className={cn(
                "font-serif font-medium text-graphite-900 text-balance",
                levels[level],
                className,
            )}
            {...props}
        />
    )
}