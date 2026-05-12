import {getSettings} from "@/features/settings/queries"
import {toPublicSalonInfo} from "@/lib/dto"
import {MotionProvider} from "@/components/public/motion-provider"
import {PublicHeader} from "@/components/public/header"
import {PublicFooter} from "@/components/public/footer"
import {SmoothHeight} from "@/components/public/smooth-height"

export default async function PublicLayout({children}: {children: React.ReactNode}) {
    const settings = await getSettings()
    const salon = toPublicSalonInfo(settings)

    return (
        <MotionProvider>
            <PublicHeader />
            <main className="min-h-screen">
                <SmoothHeight>{children}</SmoothHeight>
            </main>
            <PublicFooter salon={salon} />
        </MotionProvider>
    )
}
