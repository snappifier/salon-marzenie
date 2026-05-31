// src/features/booking/manage-actions.ts
"use server"

import {revalidatePath, revalidateTag} from "next/cache"
import {prisma} from "@/lib/prisma"
import {canCancelByPolicy, canCancelByStatus, canConfirmByPolicy, canConfirmByStatus} from "./manage-logic"

export type CancelBookingResult =
	| {success: true}
	| {success: false; error: string}

export async function cancelBooking(token: string): Promise<CancelBookingResult> {
	const booking = await prisma.booking.findUnique({
		where: {manageToken: token},
		include: {items: {orderBy: {startAt: "asc"}, take: 1}},
	})

	if (!booking) {
		return {success: false, error: "Nie znaleziono rezerwacji."}
	}

	const settings = await prisma.settings.findUnique({where: {id: "settings"}})
	if (!settings) throw new Error("Settings not found")

	if (!canCancelByStatus(booking.status, settings.requireConfirmation)) {
		if (booking.status === "CANCELLED") {
			return {success: false, error: "Rezerwacja jest już anulowana."}
		}
		if (booking.status === "CONFIRMED") {
			return {success: false, error: "Rezerwacja jest potwierdzona — anulowanie online niedostępne. Skontaktuj się z salonem telefonicznie."}
		}
		return {success: false, error: "Nie można anulować zakończonej wizyty."}
	}

	const firstItem = booking.items[0]
	if (!firstItem) {
		return {success: false, error: "Rezerwacja nie ma zabiegów - skontaktuj się z salonem."}
	}

	if (!canCancelByPolicy(firstItem.startAt, settings.minCancelHoursBefore, new Date())) {
		return {
			success: false,
			error: `Wizytę można anulować najpóźniej ${settings.minCancelHoursBefore}h przed jej rozpoczęciem. Skontaktuj się z salonem.`,
		}
	}

	await prisma.booking.update({
		where: {id: booking.id},
		data: {
			status: "CANCELLED",
			cancelledAt: new Date(),
			cancelledBy: "CUSTOMER",
		},
	})

	revalidatePath(`/moja-wizyta/${token}`)
	revalidateTag("bookings", "max")
	return {success: true}
}

export type ConfirmBookingResult =
	| {success: true}
	| {success: false; error: string}

export async function confirmBooking(token: string): Promise<ConfirmBookingResult> {
	const booking = await prisma.booking.findUnique({
		where: {manageToken: token},
		include: {items: {orderBy: {startAt: "asc"}, take: 1}},
	})

	if (!booking) {
		return {success: false, error: "Nie znaleziono rezerwacji."}
	}

	if (!canConfirmByStatus(booking.status)) {
		if (booking.status === "CONFIRMED") {
			return {success: false, error: "Rezerwacja jest już potwierdzona."}
		}
		if (booking.status === "CANCELLED") {
			return {success: false, error: "Rezerwacja jest anulowana."}
		}
		return {success: false, error: "Nie można potwierdzić tej rezerwacji."}
	}

	const firstItem = booking.items[0]
	if (!firstItem) {
		return {success: false, error: "Rezerwacja nie ma zabiegów - skontaktuj się z salonem."}
	}

	const settings = await prisma.settings.findUnique({where: {id: "settings"}})
	if (!settings) throw new Error("Settings not found")

	const result = canConfirmByPolicy(
		firstItem.startAt,
		settings.confirmWindowMinHours,
		settings.confirmWindowMaxHours,
		new Date(),
	)
	if (result === "too_early") {
		return {success: false, error: `Możesz potwierdzić wizytę najwcześniej ${settings.confirmWindowMaxHours}h przed terminem.`}
	}
	if (result === "too_late") {
		return {success: false, error: "Okno potwierdzenia minęło. Skontaktuj się z salonem."}
	}

	await prisma.booking.update({
		where: {id: booking.id},
		data: {status: "CONFIRMED"},
	})

	revalidatePath(`/moja-wizyta/${token}`)
	revalidateTag("bookings", "max")
	return {success: true}
}
