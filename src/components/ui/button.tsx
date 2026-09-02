import {cn} from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

const variantClasses: Record<Variant, string> = {
    primary: cn(
        "bg-interactive text-white shadow-sm",
        "hover-supported:hover:bg-interactive-hover hover-supported:hover:shadow-md",
        "active:scale-[0.97]",
    ),
    secondary: cn(
        "bg-transparent text-primary border border-border-subtle",
        "hover-supported:hover:border-primary hover-supported:hover:bg-surface",
        "active:scale-[0.97]",
    ),
    ghost: cn(
        "bg-transparent text-interactive",
        "hover-supported:hover:text-interactive-hover hover-supported:hover:bg-surface-muted",
        "active:scale-[0.97]",
    ),
    danger: cn(
        "bg-danger text-white",
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
    "transition-[background-color,color,border-color,opacity,transform,box-shadow] duration-[240ms] ease-out",
    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-interactive/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
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