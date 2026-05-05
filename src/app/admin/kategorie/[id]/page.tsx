import {notFound} from "next/navigation"
import {CategoryForm} from "@/components/categories/category-form"
import {updateCategory} from "@/features/categories/actions"
import {getCategoryById} from "@/features/categories/queries"

type Props = {
    params: Promise<{id: string}>
}

export default async function EditCategoryPage({params}: Props) {
    const {id} = await params
    const category = await getCategoryById(id)

    if (!category) notFound()

    const boundUpdate = updateCategory.bind(null, id)

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edycja kategorii</h1>
            <CategoryForm action={boundUpdate} initialData={category} />
        </div>
    )
}