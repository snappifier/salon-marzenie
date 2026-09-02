// src/components/ui/checkbox-field.tsx
import {useId} from "react"
import {Check} from "lucide-react"
import {cn} from "@/lib/cn"

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
	label: string
	description?: string
	ref?: React.Ref<HTMLInputElement>
}

export function CheckboxField({label, description, className, id, ref, ...props}: Props) {
	const generatedId = useId()
	const inputId = id ?? generatedId
	return (
		<label
			className={cn("flex items-start gap-3 cursor-pointer group", props.disabled && "cursor-not-allowed opacity-60", className)}
			htmlFor={inputId}
		>
			<span className="relative inline-flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
				<input
					id={inputId}
					ref={ref}
					type="checkbox"
					className="peer sr-only"
					{...props}
				/>
				<span
					className={cn(
						"absolute inset-0 rounded-md border bg-surface",
						"transition-[background-color,border-color,box-shadow] duration-150 ease-out",
						"border-border-subtle",
						"peer-checked:bg-interactive peer-checked:border-interactive",
						"peer-focus-visible:ring-3 peer-focus-visible:ring-interactive/25",
						"group-hover:border-interactive",
					)}
					aria-hidden="true"
				/>
				<Check
					className={cn(
						"relative w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-150 ease-out",
						"peer-checked:opacity-100",
					)}
					strokeWidth={3}
					aria-hidden="true"
				/>
			</span>
			<span className="min-w-0">
				<span className="block text-sm font-medium text-primary leading-tight">{label}</span>
				{description && <span className="block text-xs text-secondary mt-1">{description}</span>}
			</span>
		</label>
	)
}
