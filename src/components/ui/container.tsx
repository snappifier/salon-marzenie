// src/components/ui/container.tsx
import {cn} from "@/lib/cn"

type Size = "default" | "narrow" | "prose"

// Rytm przeniesiony ze strony głównej: 7% marginesu bocznego i 1120px treści.
// Admin nadpisuje padding przez className="px-0", więc go to nie dotyczy.
const sizes: Record<Size, string> = {
	default: "max-w-[1120px]",
	narrow: "max-w-[880px]",
	prose: "max-w-[640px]",
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	size?: Size
}

export function Container({className, size = "default", ...props}: Props) {
	return <div className={cn(sizes[size], "mx-auto px-[7%]", className)} {...props} />
}
