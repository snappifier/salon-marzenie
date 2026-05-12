import {useId} from "react"
import {cn} from "@/lib/cn"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    hint?: string
    error?: string
    ref?: React.Ref<HTMLInputElement>
}

export function Field({label, hint, error, className, id, ref, ...props}: Props) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint ? `${inputId}-hint` : undefined
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-[13px] font-medium text-graphite-900"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                ref={ref}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                className={cn(
                    "w-full h-11 px-3.5 text-base bg-white border rounded-md text-graphite-900",
                    "transition-[border-color,box-shadow] duration-150 ease-out",
                    "placeholder:text-graphite-400",
                    "focus:outline-none focus:ring-3 focus:ring-rose-500/15",
                    error
                        ? "border-error focus:border-error focus:ring-error/15"
                        : "border-border-default focus:border-rose-500",
                    className,
                )}
                {...props}
            />
            {hint && !error && (
                <p id={hintId} className="text-xs text-graphite-600">{hint}</p>
            )}
            {error && (
                <p id={errorId} role="alert" className="text-xs text-error">{error}</p>
            )}
        </div>
    )
}