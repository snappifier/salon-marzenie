// src/app/(public)/error.tsx
"use client"

import {useEffect} from "react"
import Link from "next/link"
import {Button, buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {PageHeading} from "@/components/public/page-heading"

interface Props {
    error: Error & {digest?: string}
    reset: () => void
}

export default function Error({error, reset}: Props) {
    useEffect(() => {
        console.error("Public route error:", error)
    }, [error])

    return (
        <Container className="py-24 text-center">
            <PageHeading
                as="h2"
                title={<>Coś poszło <em className="italic text-interactive">nie tak</em></>}
                description="Spróbuj odświeżyć stronę. Jeśli problem się powtarza, zadzwoń do salonu."
            />
            <div className="flex gap-3 justify-center">
                <Button onClick={reset}>Spróbuj ponownie</Button>
                <Link href="/" className={buttonStyles({variant: "secondary"})}>
                    Strona główna
                </Link>
            </div>
        </Container>
    )
}