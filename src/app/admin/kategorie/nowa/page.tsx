import {CategoryForm} from "@/components/categories/category-form"
import {createCategory} from "@/features/categories/actions"

export default function NewCategoryPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Nowa kategoria</h1>
            <CategoryForm action={createCategory} />
        </div>
    )
}