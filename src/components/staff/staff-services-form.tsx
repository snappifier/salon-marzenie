"use client"

import {useActionState} from "react"
import {useRouter} from "next/navigation"
import type {Service, Category, StaffService} from "@/generated/prisma/client"
import {saveStaffServices, type StaffServicesFormState} from "@/features/staff/services-actions"
import {formatMoney} from "@/lib/money"

type ServiceWithCategory = Service & {category: Category}

type Props = {
    staffId: string
    allServices: ServiceWithCategory[]
    currentAssignments: StaffService[]
}

const initialState: StaffServicesFormState = {}

export function StaffServicesForm({staffId, allServices, currentAssignments}: Props) {
    const router = useRouter()
    const allServiceIds = allServices.map((s) => s.id)
    const boundAction = saveStaffServices.bind(null, staffId, allServiceIds)
    const [state, formAction, pending] = useActionState(boundAction, initialState)

    const byServiceId = new Map(currentAssignments.map((a) => [a.serviceId, a]))

    const grouped = new Map<string, {category: Category; services: ServiceWithCategory[]}>()
    for (const service of allServices) {
        const existing = grouped.get(service.categoryId)
        if (existing) {
            existing.services.push(service)
        } else {
            grouped.set(service.categoryId, {category: service.category, services: [service]})
        }
    }

    return (
        <form action={formAction} className="space-y-6">
            {Array.from(grouped.values()).map(({category, services}) => (
                <section key={category.id}>
                    <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
                    <div className="border rounded">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr className="text-left text-sm">
                                <th className="p-2 w-8"></th>
                                <th className="p-2">Usługa</th>
                                <th className="p-2">Domyślnie</th>
                                <th className="p-2">Czas (min)</th>
                                <th className="p-2">Bufor (min)</th>
                                <th className="p-2">Cena (gr)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {services.map((service) => {
                                const assigned = byServiceId.get(service.id)
                                const isAssigned = !!assigned
                                const error = state.rowErrors?.[service.id]

                                return (
                                    <tr key={service.id} className="border-t">
                                        <td className="p-2">
                                            <input
                                                type="checkbox"
                                                name={`${service.id}_assigned`}
                                                defaultChecked={isAssigned}
                                                className="w-4 h-4"
                                            />
                                        </td>
                                        <td className="p-2">{service.name}</td>
                                        <td className="p-2 text-sm text-gray-500">
                                            {service.defaultDurationMin}min / {service.defaultBufferAfterMin}min / {formatMoney(service.defaultPriceGr)}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                name={`${service.id}_duration`}
                                                defaultValue={assigned?.durationOverrideMin ?? ""}
                                                placeholder={String(service.defaultDurationMin)}
                                                className="w-20 border p-1 rounded text-sm"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                name={`${service.id}_buffer`}
                                                defaultValue={assigned?.bufferOverrideMin ?? ""}
                                                placeholder={String(service.defaultBufferAfterMin)}
                                                className="w-20 border p-1 rounded text-sm"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                name={`${service.id}_price`}
                                                defaultValue={assigned?.priceOverrideGr ?? ""}
                                                placeholder={String(service.defaultPriceGr)}
                                                className="w-24 border p-1 rounded text-sm"
                                            />
                                            {error && (
                                                <p className="text-red-600 text-xs mt-1">{error}</p>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}

            {state.error && (
                <p className="text-red-600">{state.error}</p>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                    {pending ? "Zapisywanie..." : "Zapisz przypisania"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/admin/pracownicy")}
                    className="px-4 py-2 border rounded"
                >
                    Powrót
                </button>
            </div>
        </form>
    )
}