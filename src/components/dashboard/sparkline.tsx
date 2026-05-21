// src/components/dashboard/sparkline.tsx
import {cn} from "@/lib/cn"

interface SparklineProps {
	className?: string
	data: number[]
	"aria-label"?: string
}

export function Sparkline({className, data, "aria-label": ariaLabel}: SparklineProps) {
	if (data.length === 0) return null
	const max = Math.max(...data, 1)
	const min = 0
	const w = 200
	const h = 56
	const stepX = data.length > 1 ? w / (data.length - 1) : w
	const pad = 4
	const range = max - min || 1

	const points = data.map((v, i) => {
		const x = data.length > 1 ? i * stepX : w / 2
		const y = h - pad - ((v - min) / range) * (h - pad * 2)
		return {x, y, v}
	})

	const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
	const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)},${h} L${points[0].x.toFixed(2)},${h} Z`
	const last = points[points.length - 1]

	return (
		<svg
			className={cn("w-full h-14", className)}
			viewBox={`0 0 ${w} ${h}`}
			preserveAspectRatio="none"
			aria-label={ariaLabel}
			role="img"
		>
			<defs>
				<linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#9A6671" stopOpacity="0.25" />
					<stop offset="100%" stopColor="#9A6671" stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={areaPath} fill="url(#sparkline-fill)" />
			<path d={linePath} fill="none" stroke="#9A6671" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={last.x} cy={last.y} r="3" fill="#9A6671" />
		</svg>
	)
}
