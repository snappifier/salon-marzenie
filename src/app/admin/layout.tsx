import {headers} from "next/headers"
import {redirect} from "next/navigation"
import {auth} from "@/lib/auth"
import {Sidebar} from "@/components/admin-sidebar/sidebar"

export default async function AdminLayout({children}: {children: React.ReactNode}) {
	const hdrs = await headers()
	const pathname = hdrs.get("x-pathname") ?? ""

	if (pathname === "/admin/login") {
		return <>{children}</>
	}

	const session = await auth()
	if (!session || session.user.role !== "admin") {
		redirect("/admin/login")
	}

	return (
		<div className="min-h-screen flex">
			<Sidebar userName={session.user?.name ?? "Admin"} />
			<main className="flex-1 p-8 overflow-auto">{children}</main>
		</div>
	)
}
