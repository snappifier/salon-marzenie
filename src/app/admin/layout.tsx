// src/app/admin/layout.tsx
import {redirect} from "next/navigation"
import {auth} from "@/lib/auth"
import {AdminTopBar} from "@/components/admin-shell/admin-top-bar"
import {ToastProvider} from "@/components/ui/toast"

export default async function AdminLayout({children}: {children: React.ReactNode}) {
	const session = await auth()
	if (!session || session.user.role !== "admin") {
		redirect("/logowanie")
	}

	return (
		<ToastProvider>
			<div className="min-h-screen flex flex-col bg-cream">
				<AdminTopBar userName={session.user?.name ?? "Admin"} />
				<main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
					<div className="mx-auto max-w-7xl w-full">{children}</div>
				</main>
			</div>
		</ToastProvider>
	)
}
