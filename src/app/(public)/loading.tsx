export default function Loading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex items-center gap-3 text-secondary text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-interactive animate-pulse" aria-hidden="true" />
                <span>Ładowanie...</span>
            </div>
        </div>
    )
}