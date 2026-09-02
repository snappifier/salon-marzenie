export function formatMoney(grosze: number): string {
    const zlote = grosze / 100
    return `${zlote.toFixed(2).replace(".", ",")} zł`
}

export function zloteToGrosze(zlote: number): number {
    return Math.round(zlote * 100)
}
/** Jak formatMoney, ale bez końcówki ",00" — do cennika na stronie publicznej. */
export function formatMoneyCompact(grosze: number): string {
    const zlote = grosze / 100
    const value = Number.isInteger(zlote) ? String(zlote) : zlote.toFixed(2).replace(".", ",")
    return `${value} zł`
}
