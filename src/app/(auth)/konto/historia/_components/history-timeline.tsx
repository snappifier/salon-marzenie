// src/app/(auth)/konto/historia/_components/history-timeline.tsx
"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import Link from "next/link"
import {AnimatePresence, motion, useReducedMotion} from "motion/react"
import {ArrowUpRight, ChevronDown, RotateCcw, Search} from "lucide-react"
import {cn} from "@/lib/cn"
import {formatMoney} from "@/lib/money"

export interface HistoryRow {
	id: string
	manageToken: string
	monthKey: string
	monthTitle: string
	year: string
	day: string
	dow: string
	time: string
	duration: string
	title: string
	priceGr: number
	priceLabel: string
	staffName: string
	serviceNames: string[]
	haystack: string
}

const ALL = "Wszystkie"

function wizytaNoun(n: number): string {
	if (n === 1) return "wizyta"
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "wizyty"
	return "wizyt"
}

interface Props {
	rows: HistoryRow[]
	years: string[]
	services: string[]
}

export function HistoryTimeline({rows, years, services}: Props) {
	const [query, setQuery] = useState("")
	const [year, setYear] = useState(ALL)
	const [service, setService] = useState(ALL)

	const q = query.trim().toLowerCase()

	const filtered = useMemo(
		() =>
			rows.filter(
				(r) =>
					(year === ALL || r.year === year) &&
					(service === ALL || r.serviceNames.includes(service)) &&
					(q === "" || r.haystack.includes(q)),
			),
		[rows, year, service, q],
	)

	const groups = useMemo(() => {
		const map = new Map<
			string,
			{monthKey: string; monthTitle: string; year: string; count: number; sumGr: number; rows: HistoryRow[]}
		>()
		for (const r of filtered) {
			let g = map.get(r.monthKey)
			if (!g) {
				g = {monthKey: r.monthKey, monthTitle: r.monthTitle, year: r.year, count: 0, sumGr: 0, rows: []}
				map.set(r.monthKey, g)
			}
			g.count++
			g.sumGr += r.priceGr
			g.rows.push(r)
		}
		return Array.from(map.values())
	}, [filtered])

	const hasFilters = year !== ALL || service !== ALL || q !== ""

	function reset() {
		setQuery("")
		setYear(ALL)
		setService(ALL)
	}

	return (
		<>
			<div className="flex flex-wrap gap-2.5 items-center mb-4.5 p-3.5 bg-surface border border-border-subtle rounded-lg">
				<div className="relative flex-1 min-w-55">
					<Search
						size={16}
						strokeWidth={2}
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
					/>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Szukaj po zabiegu, fryzjerce, dacie…"
						className={cn(
							"w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface border border-border-subtle rounded-full text-primary outline-none placeholder:text-secondary",
							"transition-[border-color,background-color] duration-150 ease-out",
							"focus:border-interactive focus:bg-surface",
						)}
					/>
				</div>
				<FilterSelect label="Rok:" value={year} options={[ALL, ...years]} onChange={setYear} />
				<FilterSelect label="Zabieg:" value={service} options={[ALL, ...services]} onChange={setService} />
			</div>

			{groups.length === 0 ? (
				<div className="text-center px-6 py-12 bg-surface border border-dashed border-border-subtle rounded-lg">
					<p className="text-sm text-secondary mb-3">Brak wizyt dla wybranych filtrów.</p>
					{hasFilters && (
						<button
							type="button"
							onClick={reset}
							className={cn(
								"text-xs font-medium text-interactive",
								"transition-[color] duration-150 ease-out hover-supported:hover:underline",
							)}
						>
							Wyczyść filtry
						</button>
					)}
				</div>
			) : (
				groups.map((g) => (
					<section key={g.monthKey} className="mb-9">
						<div className="flex items-baseline gap-3.5 mb-3.5 pb-2.5 border-b border-border-subtle">
							<h2 className="font-display font-medium text-[22px] text-primary tracking-tight">
								{g.monthTitle} <em className="italic text-interactive font-normal">{g.year}</em>
							</h2>
							<span className="text-xs text-secondary">
								{g.count} {wizytaNoun(g.count)} · {formatMoney(g.sumGr)}
							</span>
						</div>
						{g.rows.map((r) => (
							<Row key={r.id} row={r} />
						))}
					</section>
				))
			)}
		</>
	)
}

function Row({row}: {row: HistoryRow}) {
	const metaItems = [`${row.time} · ${row.duration}`, row.staffName].filter(Boolean)
	const actionClass = cn(
		"inline-flex items-center gap-1.5 px-2.5 py-1.25 text-xs font-medium rounded-full bg-transparent",
		"transition-[color,background-color] duration-150 ease-out",
		"text-secondary hover-supported:hover:text-interactive hover-supported:hover:bg-surface-muted",
		"[&_svg]:text-secondary hover-supported:hover:[&_svg]:text-interactive",
	)

	return (
		<div className="grid grid-cols-[56px_1fr] gap-4.5 py-3.5 border-b border-border-subtle last:border-b-0 items-start">
			<div className="text-center px-1 py-2.25 bg-surface border border-border-subtle rounded-md">
				<div className="font-display font-medium text-lg text-primary leading-none tracking-[-0.01em]">
					{row.day}
				</div>
				<div className="text-[9px] uppercase text-secondary tracking-[0.18em] mt-1 font-medium">
					{row.dow}
				</div>
			</div>

			<div
				className={cn(
					"bg-surface border border-border-subtle rounded-lg px-5 py-4",
					"transition-[border-color,box-shadow] duration-150 ease-out",
					"hover-supported:hover:border-accent-100 hover-supported:hover:shadow-sm",
				)}
			>
				<div className="flex justify-between items-baseline gap-3 mb-1.5 flex-wrap">
					<div className="font-display font-medium text-base text-primary tracking-[-0.01em] leading-[1.3]">
						{row.title}
					</div>
					<div className="font-display font-medium text-[15px] text-primary shrink-0">
						{row.priceLabel}
					</div>
				</div>

				<div className="text-xs text-secondary flex items-center gap-2 flex-wrap">
					{metaItems.map((m, i) => (
						<span key={i} className="flex items-center gap-2">
							{i > 0 && <span className="text-secondary/50">·</span>}
							{m}
						</span>
					))}
				</div>

				<div className="flex gap-2 mt-3 pt-3 border-t border-border-subtle flex-wrap">
					<Link href="/rezerwacja" className={actionClass}>
						<RotateCcw size={13} strokeWidth={1.8} />
						Powtórz
					</Link>
					<Link href={`/moja-wizyta/${row.manageToken}`} className={actionClass}>
						<ArrowUpRight size={13} strokeWidth={1.8} />
						Szczegóły
					</Link>
				</div>
			</div>
		</div>
	)
}

interface FilterSelectProps {
	label: string
	value: string
	options: string[]
	onChange: (value: string) => void
}

function FilterSelect({label, value, options, onChange}: FilterSelectProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const reduce = useReducedMotion()

	useEffect(() => {
		if (!open) return
		function onPointer(e: PointerEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false)
		}
		document.addEventListener("pointerdown", onPointer)
		document.addEventListener("keydown", onKey)
		return () => {
			document.removeEventListener("pointerdown", onPointer)
			document.removeEventListener("keydown", onKey)
		}
	}, [open])

	const variants = reduce
		? {initial: {opacity: 0}, animate: {opacity: 1}, exit: {opacity: 0}}
		: {
				initial: {opacity: 0, scale: 0.97, y: -4},
				animate: {opacity: 1, scale: 1, y: 0},
				exit: {opacity: 0, scale: 0.97, y: -4},
			}

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={() => setOpen((o) => !o)}
				className={cn(
					"inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] bg-surface border rounded-full text-primary cursor-pointer",
					"transition-[border-color] duration-150 ease-out hover-supported:hover:border-accent-100",
					open ? "border-accent-100" : "border-border-subtle",
				)}
			>
				<span className="text-secondary font-normal">{label}</span>
				<span className="text-primary font-medium">{value}</span>
				<ChevronDown
					size={12}
					strokeWidth={2}
					className={cn(
						"text-secondary transition-transform duration-150 ease-out",
						open && "rotate-180",
					)}
				/>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						role="listbox"
						initial={variants.initial}
						animate={variants.animate}
						exit={variants.exit}
						transition={{duration: 0.15, ease: [0.23, 1, 0.32, 1]}}
						style={{transformOrigin: "top right"}}
						className="absolute right-0 top-full mt-1.5 z-30 min-w-44 max-h-72 overflow-auto bg-surface border border-border-subtle rounded-lg shadow-md py-1.5"
					>
						{options.map((opt) => (
							<button
								key={opt}
								type="button"
								role="option"
								aria-selected={opt === value}
								onClick={() => {
									onChange(opt)
									setOpen(false)
								}}
								className={cn(
									"w-full text-left px-3.5 py-2 text-[13px]",
									"transition-[background-color,color] duration-150 ease-out",
									"hover-supported:hover:bg-surface-muted hover-supported:hover:text-primary",
									opt === value ? "text-interactive font-medium bg-surface-muted" : "text-primary",
								)}
							>
								{opt}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
