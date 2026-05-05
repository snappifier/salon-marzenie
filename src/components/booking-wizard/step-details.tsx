"use client"

import {useWizardStore} from "./wizard-store"
import {plPhoneSchema} from "@/lib/validation";

export function StepDetails() {
    const customer = useWizardStore((s) => s.customer)
    const setCustomer = useWizardStore((s) => s.setCustomer)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const isValid =
        customer.firstName.trim().length > 0 &&
        customer.lastName.trim().length > 0 &&
        plPhoneSchema.safeParse(customer.phone).success &&
        (!customer.createAccount || (customer.email.trim().length > 0 && customer.password.length >= 8))

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Twoje dane</h2>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Imię *</label>
                        <input
                            value={customer.firstName}
                            onChange={(e) => setCustomer({firstName: e.target.value})}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Nazwisko *</label>
                        <input
                            value={customer.lastName}
                            onChange={(e) => setCustomer({lastName: e.target.value})}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-1">Telefon *</label>
                    <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({phone: e.target.value})}
                        className="w-full border p-2 rounded"
                        placeholder="+48123456789"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        9 cyfr (Polska) lub międzynarodowy z prefiksem (np. +49). Wyślemy SMS-a z potwierdzeniem.
                    </p>
                </div>

                <div>
                    <label className="block text-sm mb-1">
                        Email {customer.createAccount && "*"}
                    </label>
                    <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({email: e.target.value})}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Notatka do wizyty</label>
                    <textarea
                        value={customer.customerNote}
                        onChange={(e) => setCustomer({customerNote: e.target.value})}
                        className="w-full border p-2 rounded"
                        rows={2}
                        placeholder="Opcjonalnie - alergie, preferencje, dodatkowe informacje"
                    />
                </div>
            </div>

            <div className="border-t pt-4 space-y-3">
                <label className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        checked={customer.createAccount}
                        onChange={(e) => setCustomer({createAccount: e.target.checked})}
                        className="w-4 h-4 mt-1"
                    />
                    <div>
                        <div className="text-sm">Załóż konto</div>
                        <div className="text-xs text-gray-500">
                            Dzięki kontu zobaczysz historię swoich wizyt i łatwiej zrobisz kolejną rezerwację.
                        </div>
                    </div>
                </label>

                {customer.createAccount && (
                    <div className="ml-6">
                        <label className="block text-sm mb-1">Hasło * (min. 8 znaków)</label>
                        <input
                            type="password"
                            value={customer.password}
                            onChange={(e) => setCustomer({password: e.target.value})}
                            className="w-full border p-2 rounded max-w-md"
                            required
                        />
                    </div>
                )}

                <label className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        checked={customer.marketingConsent}
                        onChange={(e) => setCustomer({marketingConsent: e.target.checked})}
                        className="w-4 h-4 mt-1"
                    />
                    <div className="text-sm">
                        Wyrażam zgodę na otrzymywanie informacji marketingowych (promocje, nowe usługi).
                    </div>
                </label>
            </div>

            <div className="flex justify-between pt-4 border-t">
                <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border rounded"
                >
                    Wstecz
                </button>
                <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isValid}
                    className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                    Dalej
                </button>
            </div>
        </div>
    )
}