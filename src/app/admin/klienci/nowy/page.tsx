import {CustomerForm} from "@/components/customers/customer-form"
import {createCustomer} from "@/features/customers/actions"

export default function NewCustomerPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Nowy klient</h1>
            <CustomerForm action={createCustomer} />
        </div>
    )
}