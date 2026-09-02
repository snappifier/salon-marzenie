"use client"

import {useState} from "react"
import {motion} from "motion/react"
import {ArrowLeft, ArrowRight, Check} from "lucide-react"
import {useWizardStore} from "./wizard-store"
import {groupVariants, itemVariants} from "./animations"
import {plPhoneSchema, optionalEmailSchema} from "@/lib/validation"
import {Button} from "@/components/ui/button"
import {Field} from "@/components/ui/field"
import {Textarea} from "@/components/ui/textarea"
import {Heading} from "@/components/ui/heading"
import {cn} from "@/lib/cn"

interface StepDetailsProps {
    isLoggedIn?: boolean
}

export function StepDetails({isLoggedIn = false}: StepDetailsProps) {
    const customer = useWizardStore((s) => s.customer)
    const setCustomer = useWizardStore((s) => s.setCustomer)
    const nextStep = useWizardStore((s) => s.nextStep)
    const prevStep = useWizardStore((s) => s.prevStep)

    const [emailTouched, setEmailTouched] = useState(false)
    const [phoneTouched, setPhoneTouched] = useState(false)

    const phoneParse = plPhoneSchema.safeParse(customer.phone)
    const phoneOk = phoneParse.success
    const phoneErrorMsg = !phoneOk ? phoneParse.error.issues[0]?.message : undefined

    const emailParse = optionalEmailSchema.safeParse(customer.email)
    const emailOk = emailParse.success
    const emailErrorMsg = !emailOk ? emailParse.error.issues[0]?.message : undefined

    const accountOk = isLoggedIn || !customer.createAccount || (customer.email.trim().length > 0 && customer.password.length >= 8)
    const isValid =
        customer.firstName.trim().length > 0 &&
        customer.lastName.trim().length > 0 &&
        phoneOk &&
        emailOk &&
        accountOk

    const showEmailError = emailTouched && customer.email.trim().length > 0 && !emailOk
    const showPhoneError = phoneTouched && customer.phone.trim().length > 0 && !phoneOk

    return (
        <motion.div className="space-y-7" variants={groupVariants}>
            <motion.div variants={itemVariants}>
                <Heading level="h3" className="mb-1">Twoje dane</Heading>
                <p className="text-sm text-secondary leading-relaxed">
                    {isLoggedIn
                        ? "Dane uzupełnione z Twojego konta. SMS-a z potwierdzeniem wyślemy na zapisany numer."
                        : "Wyślemy SMS-a z potwierdzeniem na podany numer."}
                </p>
            </motion.div>

            <motion.div className="space-y-5" variants={groupVariants}>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={itemVariants}>
                    <Field
                        label="Imię"
                        value={customer.firstName}
                        onChange={(e) => setCustomer({firstName: e.target.value})}
                        required
                        autoComplete="given-name"
                    />
                    <Field
                        label="Nazwisko"
                        value={customer.lastName}
                        onChange={(e) => setCustomer({lastName: e.target.value})}
                        required
                        autoComplete="family-name"
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Field
                        label="Telefon"
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({phone: e.target.value})}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="+48 123 456 789"
                        hint="9 cyfr (Polska) lub międzynarodowy z prefiksem"
                        error={showPhoneError ? phoneErrorMsg : undefined}
                        required
                        autoComplete="tel"
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Field
                        label={isLoggedIn || !customer.createAccount ? "Email (opcjonalnie)" : "Email"}
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({email: e.target.value})}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="adres@email.pl"
                        autoComplete="email"
                        required={!isLoggedIn && customer.createAccount}
                        error={showEmailError ? emailErrorMsg : undefined}
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Textarea
                        label="Notatka do wizyty (opcjonalnie)"
                        value={customer.customerNote}
                        onChange={(e) => setCustomer({customerNote: e.target.value})}
                        rows={2}
                        placeholder="Alergie, preferencje, dodatkowe informacje"
                    />
                </motion.div>
            </motion.div>

            {!isLoggedIn && (
                <motion.div
                    className="pt-5 border-t border-border-subtle space-y-4"
                    variants={itemVariants}
                >
                    <Checkbox
                        checked={customer.createAccount}
                        onChange={(v) => setCustomer({createAccount: v})}
                        label="Załóż konto"
                        hint="Zobaczysz historię swoich wizyt i łatwiej zrobisz kolejną rezerwację."
                    />

                    {customer.createAccount && (
                        <div className="pl-8 max-w-md">
                            <Field
                                label="Hasło"
                                type="password"
                                value={customer.password}
                                onChange={(e) => setCustomer({password: e.target.value})}
                                hint="Minimum 8 znaków"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    <Checkbox
                        checked={customer.marketingConsent}
                        onChange={(v) => setCustomer({marketingConsent: v})}
                        label="Zgoda marketingowa"
                        hint="Wyrażam zgodę na otrzymywanie informacji o promocjach i nowych usługach."
                    />
                </motion.div>
            )}

            <motion.p
                className="text-[11px] text-secondary leading-relaxed"
                variants={itemVariants}
            >
                Zaznaczając „Dalej" potwierdzasz zapoznanie się z{" "}
                <a href="/polityka-prywatnosci" className="underline hover:text-interactive transition-[color] duration-150 ease-out">
                    polityką prywatności
                </a>.
            </motion.p>

            <motion.div
                className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 pt-4 pb-2 bg-surface/95 backdrop-blur-sm border-t border-border-subtle"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between gap-3">
                    <Button variant="secondary" type="button" onClick={prevStep}>
                        <ArrowLeft size={16} />
                        Wstecz
                    </Button>
                    <Button type="button" onClick={nextStep} disabled={!isValid}>
                        Dalej
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}

interface CheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    hint?: string
}

function Checkbox({checked, onChange, label, hint}: CheckboxProps) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                className="sr-only"
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div
                className={cn(
                    "shrink-0 mt-0.5 w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center",
                    "transition-[background-color,border-color] duration-150 ease-out",
                    checked
                        ? "bg-interactive border-interactive text-white"
                        : "bg-surface border-border-subtle group-hover:border-border-strong",
                )}
                aria-hidden="true"
            >
                <Check
                    className={cn(
                        "transition-[opacity] duration-150 ease-out",
                        checked ? "opacity-100" : "opacity-0",
                    )}
                    size={12}
                    strokeWidth={3}
                />
            </div>
            <div className="flex-1">
                <div className="text-sm text-primary font-medium leading-snug">{label}</div>
                {hint && <div className="text-xs text-secondary leading-relaxed mt-0.5">{hint}</div>}
            </div>
        </label>
    )
}
