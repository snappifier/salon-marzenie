import {ServiceForm} from "@/components/services/service-form"
import {createService} from "@/features/services/actions"
import {getAllCategories} from "@/features/services/queries"

export default async function NewServicePage() {
    const categories = await getAllCategories()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Nowa usługa</h1>
            <ServiceForm action={createService} categories={categories} />
        </div>
    )
}