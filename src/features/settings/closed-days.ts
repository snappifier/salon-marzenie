// src/features/settings/closed-days.ts
"use server"

import {revalidatePath} from "next/cache"
import {prisma} from "@/lib/prisma"
import {auth} from "@/lib/auth"

async function requireAdmin() {
	const session = await auth()
	if (!session) throw new Error("Unauthorized")
}

export type ClosedDayState = {error?: string; success?: boolean}

export async function addClosedDay(_prev: ClosedDayState, formData: FormData): Promise<ClosedDayState> {
	await requireAdmin()
	const dateStr = (formData.get("date") as string | null)?.trim()
	const reason = (formData.get("reason") as string | null)?.trim() || null
	if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return {error: "Podaj poprawną datę"}
	const date = new Date(`${dateStr}T00:00:00.000Z`)
	const existing = await prisma.salonClosedDay.findUnique({where: {date}})
	if (existing) return {error: "Ten dzień jest już oznaczony jako zamknięty"}
	await prisma.salonClosedDay.create({data: {date, reason}})
	revalidatePath("/admin/ustawienia")
	return {success: true}
}

export async function removeClosedDay(id: string): Promise<void> {
	await requireAdmin()
	await prisma.salonClosedDay.delete({where: {id}})
	revalidatePath("/admin/ustawienia")
}
