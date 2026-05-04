export interface TimeRange {
    start: Date,
    end: Date
}

export function subtractRange(ranges: TimeRange[], cutStart: Date, cutEnd: Date) : TimeRange[] {
    const result: TimeRange[] = []

    for (const range of ranges) {
        if (cutEnd <= range.start || cutStart >= range.end) {
            result.push(range)
            continue
        }

        if (cutStart <= range.start && cutEnd >= range.end) {
            continue
        }

        if (cutStart <= range.start && cutEnd < range.end) {
            result.push({ start: cutEnd, end: range.end })
            continue
        }

        if (cutStart > range.start && cutEnd >= range.end) {
            result.push({ start: range.start, end: cutStart })
            continue
        }

        if (cutStart > range.start && cutEnd < range.end) {
            result.push({ start: range.start, end: cutStart })
            result.push({ start: cutEnd, end: range.end })
        }
    }
    return result
}