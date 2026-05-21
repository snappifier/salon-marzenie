// src/components/ui/avatar.tsx
import {autoInitials} from "@/lib/initials"
import {cn} from "@/lib/cn"

type Size = "sm" | "md" | "lg"
type Tone = "rose" | "graphite" | "warm"

const sizeClasses: Record<Size, string> = {
	sm: "w-8 h-8 text-[11px]",
	md: "w-10 h-10 text-[13px]",
	lg: "w-14 h-14 text-base",
}

const toneClasses: Record<Tone, string> = {
	rose: "bg-rose-50 text-rose-700",
	graphite: "bg-graphite-100 text-graphite-700",
	warm: "bg-warm text-graphite-700",
}

interface AvatarProps {
	className?: string
	name: string
	size?: Size
	tone?: Tone
	accentColor?: string
}

export function Avatar({className, name, size = "md", tone = "rose", accentColor}: AvatarProps) {
	const initials = autoInitials(name)
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center rounded-full font-serif font-medium shrink-0",
				sizeClasses[size],
				toneClasses[tone],
				accentColor && "ring-2 ring-offset-2 ring-offset-white",
				className,
			)}
			style={accentColor ? {boxShadow: `0 0 0 2px ${accentColor}33`} : undefined}
			aria-hidden="true"
		>
			{initials}
		</span>
	)
}
