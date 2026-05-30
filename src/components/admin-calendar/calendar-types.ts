// src/components/admin-calendar/calendar-types.ts
import type {DayOfWeek} from "@/generated/prisma/client"

export type ViewMode = "day" | "week" | "month"
export type ResourceMode = "combined" | "perStaff"

export interface StaffResource {
	id: string
	firstName: string
	lastName: string
	color: string
	workingHours: Array<{dayOfWeek: DayOfWeek; startMin: number; endMin: number}>
	timeOffs: Array<{id: string; startAt: Date; endAt: Date; reason: string | null}>
}

export interface CalendarService {
	id: string
	name: string
	categoryName: string
	defaultDurationMin: number
	defaultPriceGr: number
}

export type StaffByService = Record<string, Array<{id: string; firstName: string; lastName: string}>>
