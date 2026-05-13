"use client"

import {useState} from "react"
import {Check, Copy} from "lucide-react"
import {cn} from "@/lib/cn"

interface Props {
    url: string
    displayLabel?: string
}

export function CopyLink({url, displayLabel}: Props) {
    const [copied, setCopied] = useState(false)

    function handleCopy() {
        if (!navigator.clipboard) return
        navigator.clipboard
            .writeText(url)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
            .catch(() => {})
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-graphite-50 border border-border-soft">
            <div className="flex-1 min-w-0 text-[12px] text-graphite-700 truncate tabular-nums">
                {displayLabel ?? url}
            </div>
            <button
                className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded",
                    "transition-[color,background-color] duration-150 ease-out",
                    copied
                        ? "text-success"
                        : "text-rose-600 hover-supported:hover:bg-rose-50",
                )}
                type="button"
                onClick={handleCopy}
                aria-label="Skopiuj link"
            >
                {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2.5} />}
                {copied ? "Skopiowano" : "Kopiuj"}
            </button>
        </div>
    )
}
