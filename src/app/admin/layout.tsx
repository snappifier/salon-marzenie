import {auth} from "@/lib/auth"
import {Sidebar} from "@/components/admin-sidebar/sidebar"

export default async function AdminLayout({children}: {children: React.ReactNode}) {
    const session = await auth()

    if (!session) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar userName={session.user?.name ?? "Admin"} />
            <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
    )
}