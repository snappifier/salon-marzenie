// src/app/admin/klienci/nowy/page.tsx
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"
import {CustomerForm} from "@/components/customers/customer-form"

export default function NewCustomerPage() {
	return (
		<Container className="px-0" size="narrow">
			<div className="flex flex-col gap-6">
				<a
					className="inline-flex items-center gap-1 self-start text-xs font-medium text-graphite-600 hover-supported:hover:text-rose-600 transition-[color] duration-150 ease-out"
					href="/admin/klienci"
				>
					<span aria-hidden="true">←</span>
					<span>Wszystkie klientki</span>
				</a>

				<header className="flex flex-col gap-2">
					<Eyebrow>Nowa klientka</Eyebrow>
					<Heading className="text-balance" level="h1">
						Dodaj <span className="italic font-normal text-rose-600">klientkę</span>
					</Heading>
					<p className="text-sm text-graphite-600 max-w-md">
						Telefon jest wymagany — będziemy go używać do powiadomień SMS o wizycie.
					</p>
				</header>

				<CustomerForm mode="create" />
			</div>
		</Container>
	)
}
