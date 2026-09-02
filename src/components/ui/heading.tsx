// src/components/ui/heading.tsx
import {cn} from "@/lib/cn"

type Level = "display" | "h1" | "h2" | "h3"

// Waga zależy od poziomu, tak jak na stronie głównej: duże nagłówki
// sekcji są font-normal, tytuły kart font-medium.
const weights: Record<Level, string> = {
	display: "font-normal",
	h1: "font-normal",
	h2: "font-normal",
	h3: "font-medium",
}

// Rozmiary podane wprost w px. Skala tokenów przeniesiona z untitled1 ma
// text-2xl = 40px, co dla tytułu karty jest o wiele za dużo.
const levels: Record<Level, string> = {
	display: "text-[clamp(40px,7vw,60px)] leading-[1.2] tracking-[-0.01em]",
	h1: "text-[clamp(32px,5vw,48px)] leading-[1.15] tracking-[-0.01em]",
	h2: "text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.01em]",
	h3: "text-[20px] leading-8 tracking-tight",
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
				"font-display text-primary text-balance",
				weights[level],
				levels[level],
				className,
			)}
			{...props}
		/>
	)
}
