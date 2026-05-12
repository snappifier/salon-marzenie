"use client"

import {useEffect} from "react"
import Link from "next/link"
import {Button, buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Heading} from "@/components/ui/heading"

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
            <Heading level="h2" className="mb-4">Coś poszło nie tak</Heading>
            <p className="text-graphite-600 mb-8 max-w-md mx-auto">
                Spróbuj odświeżyć stronę. Jeśli problem się powtarza, zadzwoń do salonu.
            </p>
            <div className="flex gap-3 justify-center">
                <Button onClick={reset}>Spróbuj ponownie</Button>
                <Link href="/" className={buttonStyles({variant: "secondary"})}>
                    Strona główna
                </Link>
            </div>
        </Container>
    )
}