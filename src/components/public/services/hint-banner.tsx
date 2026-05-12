import {Info} from "lucide-react"
import {Reveal} from "@/components/ui/reveal"

export function HintBanner() {
    return (
        <Reveal>
            <div className="bg-warm border border-border-soft rounded-2xl p-5 md:p-6 flex items-start gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Info size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <div className="font-serif font-medium text-[15px] text-graphite-900 mb-0.5">
                        Możesz wybrać kilka usług naraz
                    </div>
                    <p className="text-[13px] text-graphite-600 leading-relaxed">
                        Klikając „Zarezerwuj" przy konkretnej usłudze przejdziesz do wizardu, gdzie dodasz kolejne jeśli chcesz.
                    </p>
                </div>
            </div>
        </Reveal>
    )
}