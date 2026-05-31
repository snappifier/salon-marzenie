import {useId} from "react"
import {cn} from "@/lib/cn"

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    hint?: string
    error?: string
    ref?: React.Ref<HTMLTextAreaElement>
}

export function Textarea({label, hint, error, className, id, ref, rows = 3, ...props}: Props) {
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
            <textarea
                id={inputId}
                ref={ref}
                rows={rows}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                className={cn(
                    "w-full px-3.5 py-3 text-base bg-white border rounded-md text-graphite-900 resize-y",
                    "transition-[border-color,box-shadow] duration-150 ease-soft",
                    "placeholder:text-graphite-400",
                    "focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/15",
                    error
                        ? "border-error focus-visible:border-error focus-visible:ring-error/15"
                        : "border-border-default focus-visible:border-rose-500",
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