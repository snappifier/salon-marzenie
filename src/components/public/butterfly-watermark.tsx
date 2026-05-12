import {cn} from "@/lib/cn"

interface Props {
    className?: string
}

export function ButterflyWatermark({className}: Props) {
    return (
        <svg
            className={cn("pointer-events-none", className)}
            viewBox="0 0 320 320"
            fill="none"
            aria-hidden="true"
        >
            <g opacity="0.7" >
                <path d="M160 160 C 80 60, 30 100, 50 180 C 70 240, 140 220, 160 160 Z" fill="#E2BCC5" />
                <path d="M160 160 C 240 60, 290 100, 270 180 C 250 240, 180 220, 160 160 Z" fill="#E2BCC5" />
                <path d="M160 160 C 90 200, 70 250, 100 290 C 140 310, 165 240, 160 160 Z" fill="#EFD7DD" />
                <path d="M160 160 C 230 200, 250 250, 220 290 C 180 310, 155 240, 160 160 Z" fill="#EFD7DD" />
            </g>
            {/*<g opacity="0.4">*/}
            {/*    <path d="M40 50 Q 60 30 90 50 Q 110 70 130 60" stroke="#D4A0AC" strokeWidth="1.5" fill="none" strokeLinecap="round" />*/}
            {/*    <path d="M220 280 Q 250 290 280 270 Q 290 250 280 230" stroke="#D4A0AC" strokeWidth="1.5" fill="none" strokeLinecap="round" />*/}
            {/*</g>*/}
        </svg>
    )
}