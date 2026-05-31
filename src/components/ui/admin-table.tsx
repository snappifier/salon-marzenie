// src/components/ui/admin-table.tsx
"use client"

import {cn} from "@/lib/cn"

export interface Column<T> {
	id: string
	header: string
	cell: (row: T) => React.ReactNode
	width?: string
	mobileHidden?: boolean
	align?: "left" | "right" | "center"
}

interface AdminTableProps<T> {
	className?: string
	data: T[]
	columns: Column<T>[]
	rowKey: (row: T) => string
	onRowClick?: (row: T) => void
	mobileCardRender?: (row: T) => React.ReactNode
	emptyState?: React.ReactNode
}

const alignClass: Record<NonNullable<Column<unknown>["align"]>, string> = {
	left: "text-left",
	right: "text-right",
	center: "text-center",
}

export function AdminTable<T>({
	className,
	data,
	columns,
	rowKey,
	onRowClick,
	mobileCardRender,
	emptyState,
}: AdminTableProps<T>) {
	if (data.length === 0 && emptyState) {
		return <>{emptyState}</>
	}

	return (
		<div className={cn("w-full", className)}>
			<div className="hidden md:block overflow-hidden rounded-2xl bg-white border border-border-soft">
				<table className="w-full text-sm">
					<thead className="bg-warm">
						<tr>
							{columns.map((col) => (
								<th
									key={col.id}
									scope="col"
									className={cn(
										"px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-graphite-600",
										alignClass[col.align ?? "left"],
										col.width,
									)}
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, idx) => (
							<tr
								key={rowKey(row)}
								className={cn(
									idx > 0 && "border-t border-border-soft",
									"transition-[background-color] duration-150 ease-out",
									onRowClick && "cursor-pointer hover-supported:hover:bg-rose-50/30 active:bg-rose-50/60",
								)}
								onClick={onRowClick ? () => onRowClick(row) : undefined}
								onKeyDown={
									onRowClick
										? (e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault()
													onRowClick(row)
												}
											}
										: undefined
								}
								tabIndex={onRowClick ? 0 : undefined}
								role={onRowClick ? "button" : undefined}
							>
								{columns.map((col) => (
									<td
										key={col.id}
										className={cn(
											"px-5 py-3.5 align-middle text-graphite-900",
											alignClass[col.align ?? "left"],
										)}
									>
										{col.cell(row)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="md:hidden flex flex-col gap-3">
				{data.map((row) =>
					mobileCardRender ? (
						<div key={rowKey(row)}>{mobileCardRender(row)}</div>
					) : (
						<MobileCard
							key={rowKey(row)}
							onClick={onRowClick ? () => onRowClick(row) : undefined}
						>
							<dl className="flex flex-col gap-2">
								{columns
									.filter((col) => !col.mobileHidden)
									.map((col) => (
										<div
											key={col.id}
											className="flex items-baseline justify-between gap-3"
										>
											<dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-graphite-600 shrink-0">
												{col.header}
											</dt>
											<dd
												className={cn(
													"min-w-0 text-sm text-graphite-900",
													alignClass[col.align ?? "right"],
												)}
											>
												{col.cell(row)}
											</dd>
										</div>
									))}
							</dl>
						</MobileCard>
					),
				)}
			</div>
		</div>
	)
}

interface MobileCardProps {
	className?: string
	children: React.ReactNode
	onClick?: () => void
}

export function MobileCard({className, children, onClick}: MobileCardProps) {
	const isInteractive = Boolean(onClick)
	return (
		<div
			className={cn(
				"rounded-2xl bg-white border border-border-soft p-4",
				"transition-[background-color,border-color] duration-150 ease-out",
				isInteractive
					&& "cursor-pointer hover-supported:hover:bg-rose-50/30 hover-supported:hover:border-rose-200/60 active:scale-[0.995]",
				className,
			)}
			onClick={onClick}
			onKeyDown={
				isInteractive
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								onClick?.()
							}
						}
					: undefined
			}
			tabIndex={isInteractive ? 0 : undefined}
			role={isInteractive ? "button" : undefined}
		>
			{children}
		</div>
	)
}
