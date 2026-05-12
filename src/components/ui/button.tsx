import {cn} from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

const variantClasses: Record<Variant, string> = {
    primary: cn(
        "bg-rose-600 text-white shadow-sm",
        "hover-supported:hover:bg-rose-700",
        "active:scale-[0.97]",
    ),
    secondary: cn(
        "bg-transparent text-graphite-900 border border-graphite-200",
        "hover-supported:hover:border-graphite-900 hover-supported:hover:bg-white",
        "active:scale-[0.97]",
    ),
    ghost: cn(
        "bg-transparent text-rose-600",
        "hover-supported:hover:text-rose-700 hover-supported:hover:bg-rose-50",
        "active:scale-[0.97]",
    ),
    danger: cn(
        "bg-error text-white",
        "hover-supported:hover:opacity-90",
        "active:scale-[0.97]",
    ),
}

const sizeClasses: Record<Size, string> = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-7 text-base",
}

const baseClasses = cn(
    "inline-flex items-center justify-center gap-2 font-medium rounded-full whitespace-nowrap",
    "transition-[background-color,color,border-color,opacity,transform] duration-150 ease-out",
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
)

export interface ButtonStyleOptions {
    variant?: Variant
    size?: Size
    className?: string
}

export function buttonStyles({variant = "primary", size = "md", className}: ButtonStyleOptions = {}): string {
    return cn(baseClasses, variantClasses[variant], sizeClasses[size], className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
    ref?: React.Ref<HTMLButtonElement>
}

export function Button({className, variant, size, ref, ...props}: ButtonProps) {
    return <button ref={ref} className={buttonStyles({variant, size, className})} {...props} />
}