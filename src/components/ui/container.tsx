import {cn} from "@/lib/cn"

type Size = "default" | "narrow" | "prose"

const sizes: Record<Size, string> = {
    default: "max-w-[1440px]",
    narrow: "max-w-[880px]",
    prose: "max-w-[640px]",
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    size?: Size
}

export function Container({className, size = "default", ...props}: Props) {
    return <div className={cn(sizes[size], "mx-auto px-6", className)} {...props} />
}