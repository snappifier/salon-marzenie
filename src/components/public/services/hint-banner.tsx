import {Info} from "lucide-react"
import {Reveal} from "@/components/ui/reveal"

export function HintBanner() {
    return (
        <Reveal>
            <div className="bg-paper-300 border border-border-subtle rounded-lg p-5 md:p-6 flex items-start gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-paper-400 text-interactive-hover flex items-center justify-center">
                    <Info size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <div className="font-display font-medium text-[15px] text-primary mb-0.5">
                        Możesz wybrać kilka usług naraz
                    </div>
                    <p className="text-[13px] text-secondary leading-relaxed">
                        Klikając „Zarezerwuj" przy konkretnej usłudze przejdziesz do wizardu, gdzie dodasz kolejne jeśli chcesz.
                    </p>
                </div>
            </div>
        </Reveal>
    )
}