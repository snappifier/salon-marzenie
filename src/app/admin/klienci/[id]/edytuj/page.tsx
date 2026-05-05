import {notFound} from "next/navigation"
import {CustomerForm} from "@/components/customers/customer-form"
import {updateCustomer} from "@/features/customers/actions"
import {getCustomerById} from "@/features/customers/queries"

type Props = {
    params: Promise<{id: string}>
}

export default async function EditCustomerPage({params}: Props) {
    const {id} = await params
    const customer = await getCustomerById(id)

    if (!customer) notFound()

    const boundUpdate = updateCustomer.bind(null, id)

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Edycja klienta: {customer.firstName} {customer.lastName}
            </h1>
            <CustomerForm action={boundUpdate} initialData={customer} />
        </div>
    )
}