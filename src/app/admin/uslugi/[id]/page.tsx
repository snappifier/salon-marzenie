import {notFound} from "next/navigation"
import {ServiceForm} from "@/components/services/service-form"
import {updateService} from "@/features/services/actions"
import {getServiceById, getAllCategories} from "@/features/services/queries"

type Props = {
    params: Promise<{id: string}>
}

export default async function EditServicePage({params}: Props) {
    const {id} = await params
    const [service, categories] = await Promise.all([
        getServiceById(id),
        getAllCategories(),
    ])

    if (!service) notFound()

    const boundUpdate = updateService.bind(null, id)

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edycja usługi</h1>
            <ServiceForm action={boundUpdate} categories={categories} initialData={service} />
        </div>
    )
}