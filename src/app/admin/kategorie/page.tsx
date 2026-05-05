import Link from "next/link"
import {getAllCategories} from "@/features/categories/queries"
import {CategoryRowActions} from "@/components/categories/category-row-actions"

export default async function CategoriesPage() {
    const categories = await getAllCategories()

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Kategorie</h1>
                <Link
                    href="/admin/kategorie/nowa"
                    className="px-4 py-2 bg-black text-white rounded"
                >
                    Dodaj kategorię
                </Link>
            </div>

            <table className="w-full border-collapse">
                <thead>
                <tr className="border-b text-left">
                    <th className="p-2">Kolejność</th>
                    <th className="p-2">Nazwa</th>
                    <th className="p-2">Slug</th>
                    <th className="p-2">Liczba usług</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((c) => (
                    <tr key={c.id} className="border-b">
                        <td className="p-2">{c.order}</td>
                        <td className="p-2">{c.name}</td>
                        <td className="p-2 text-gray-500">{c.slug}</td>
                        <td className="p-2">{c._count.services}</td>
                        <td className="p-2">
                            {c.active ? "aktywna" : "nieaktywna"}
                        </td>
                        <td className="p-2">
                            <CategoryRowActions id={c.id} active={c.active} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {categories.length === 0 && (
                <p className="text-gray-500 mt-4">Brak kategorii. Dodaj pierwszą.</p>
            )}
        </div>
    )
}