export function formatMoney(grosze: number): string {
    const zlote = grosze / 100
    return `${zlote.toFixed(2).replace(".", ",")} zł`
}

export function zloteToGrosze(zlote: number): number {
    return Math.round(zlote * 100)
}