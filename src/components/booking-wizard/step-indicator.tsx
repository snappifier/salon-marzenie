// src/components/booking-wizard/step-indicator.tsx
"use client"

import {cn} from "@/lib/cn"

interface Props {
	currentStep: number
	totalSteps: number
	stepLabel: string
}

export function StepIndicator({currentStep, totalSteps, stepLabel}: Props) {
	return (
		<div className="space-y-2">
			<div
				className="flex items-center gap-1.5"
				role="progressbar"
				aria-valuenow={currentStep}
				aria-valuemin={1}
				aria-valuemax={totalSteps}
				aria-label={`Krok ${currentStep} z ${totalSteps}: ${stepLabel}`}
			>
				{Array.from({length: totalSteps}, (_, i) => {
					const stepNum = i + 1
					const isPast = stepNum < currentStep
					const isCurrent = stepNum === currentStep
					return (
						<div
							key={stepNum}
							className={cn(
								"flex-1 h-[3px] rounded-sm transition-[background-color] duration-300 ease-out",
								isCurrent && "bg-interactive",
								isPast && "bg-accent-100",
								!isCurrent && !isPast && "bg-surface-muted",
							)}
							aria-hidden="true"
						/>
					)
				})}
			</div>
			<div className="text-[11px] uppercase tracking-[0.18em] font-medium text-secondary">
				Krok <strong className="font-medium text-interactive">{currentStep}</strong> z {totalSteps}{stepLabel ? `: ${stepLabel}` : ""}
			</div>
		</div>
	)
}
