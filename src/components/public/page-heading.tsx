// src/components/public/page-heading.tsx
import {Eyebrow} from "@/components/ui/eyebrow"
import {cn} from "@/lib/cn"

interface Props {
	className?: string
	eyebrow?: string
	title: React.ReactNode
	description?: React.ReactNode
	align?: "center" | "left"
	as?: "h1" | "h2"
}

// Nagłówek ekranów zadaniowych: ten sam język co strona główna
// (Cormorant, font-normal, burgundowa kursywa na akcencie), ale niższa
// skala — 28-40px zamiast 40-60px, żeby formularze i listy zostały gęste.
export function PageHeading({
	className,
	eyebrow,
	title,
	description,
	align = "center",
	as: Tag = "h1",
}: Props) {
	const centered = align === "center"

	return (
		<div
			className={cn(
				"mb-[clamp(24px,4vw,40px)] animate-mz-fade",
				centered && "max-w-xl mx-auto text-center",
				className,
			)}
		>
			{eyebrow && <Eyebrow className="mb-3 block">{eyebrow}</Eyebrow>}
			<Tag className="font-display font-normal text-[clamp(28px,5vw,40px)] leading-[1.15] tracking-[-0.01em] text-balance">
				{title}
			</Tag>
			{description && (
				<p className={cn("text-secondary leading-[25px] mt-4", !centered && "max-w-[560px]")}>
					{description}
				</p>
			)}
		</div>
	)
}
