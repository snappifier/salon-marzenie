// src/app/admin/error.tsx
"use client"

import {useEffect} from "react"
import Link from "next/link"
import {AlertCircle, ArrowLeft, RefreshCw} from "lucide-react"
import {Button, buttonStyles} from "@/components/ui/button"
import {Heading} from "@/components/ui/heading"

interface Props {
	error: Error & {digest?: string}
	reset: () => void
}

export default function AdminError({error, reset}: Props) {
	useEffect(() => {
		console.error("[admin error boundary]", error)
	}, [error])

	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md text-center">
				<div
					className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error-bg text-error mb-5"
					aria-hidden="true"
				>
					<AlertCircle size={24} strokeWidth={1.8} />
				</div>
				<Heading level="h3" className="mb-2">Coś poszło nie tak</Heading>
				<p className="text-sm text-graphite-600 leading-relaxed mb-6">
					Wystąpił nieoczekiwany błąd. Spróbuj ponownie. Jeśli problem nie ustąpi, zadzwoń do administratora technicznego.
				</p>
				<div className="flex flex-col sm:flex-row gap-2 justify-center">
					<Button variant="primary" type="button" onClick={reset}>
						<RefreshCw size={16} />
						Spróbuj ponownie
					</Button>
					<Link className={buttonStyles({variant: "secondary"})} href="/admin">
						<ArrowLeft size={16} />
						Powrót do panelu
					</Link>
				</div>
				{error.digest && (
					<p className="mt-8 text-[11px] font-mono text-graphite-400">
						ID błędu: {error.digest}
					</p>
				)}
			</div>
		</div>
	)
}
