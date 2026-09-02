import {getSessionSafe} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {getSettings} from "@/features/settings/queries"
import {toPublicSalonInfo} from "@/lib/dto"
import {MotionProvider} from "@/components/public/motion-provider"
import {PublicHeader, type HeaderCustomer} from "@/components/public/header"
import {PublicFooter} from "@/components/public/footer"
import {ScrollToTop} from "@/components/public/scroll-to-top"
import {SmoothHeight} from "@/components/public/smooth-height"
import {CookieBanner} from "@/components/public/cookie-banner"

export default async function PublicLayout({children}: {children: React.ReactNode}) {
    const [settings, session] = await Promise.all([getSettings(), getSessionSafe()])
    const salon = toPublicSalonInfo(settings)

    let customer: HeaderCustomer | null = null
    if (session?.user?.role === "customer" && session.user.id) {
        const row = await prisma.customer.findUnique({
            where: {id: session.user.id},
            select: {firstName: true, lastName: true},
        })
        if (row) customer = {firstName: row.firstName, lastName: row.lastName}
    }

    return (
        <MotionProvider>
            <ScrollToTop />
            <PublicHeader customer={customer} />
            <main className="min-h-screen w-full">
                <SmoothHeight>{children}</SmoothHeight>
            </main>
            <PublicFooter salon={salon} />
            <CookieBanner />
        </MotionProvider>
    )
}
