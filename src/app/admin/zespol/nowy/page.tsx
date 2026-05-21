// src/app/admin/zespol/nowy/page.tsx
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {StaffForm} from "@/components/staff/staff-form"

export default function NewStaffPage() {
	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/zespol"
				>
					<span aria-hidden="true">←</span>
					<span>Cały zespół</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>Nowy pracownik</Eyebrow>
					<Heading className="text-balance" level="h1">
						Dodaj <span className="italic font-normal text-rose-600">pracownika</span>
					</Heading>
					<p className="text-sm text-graphite-600 max-w-md">
						Po dodaniu ustaw grafik pracy i przypisz usługi w zakładkach na profilu.
					</p>
				</header>

				<StaffForm mode="create" />
			</div>
		</Container>
	)
}
