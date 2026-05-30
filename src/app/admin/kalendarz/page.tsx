// src/app/admin/kalendarz/page.tsx
import {
	getActiveStaffForCalendar,
	getServicesForAdminBooking,
	getStaffByServiceMap,
} from "@/features/booking/calendar-queries"
import {getSettings} from "@/features/settings/queries"
import {PageHeader} from "@/components/admin-shell/page-header"
import {SalonCalendar} from "@/components/admin-calendar/salon-calendar"
import type {ViewMode} from "@/components/admin-calendar/calendar-types"

const VALID_VIEWS: ViewMode[] = ["day", "week", "month"]

// Zakres godzin pokazywany w kalendarzu wyliczamy z realnych grafików zespołu
// (a nie sztywnego 7-22), żeby nie scrollować przez puste godziny. Padding 30 min
// z każdej strony, zaokrąglony do pełnej godziny. Fallback: Settings, potem 8-20.
function deriveHourRange(
	staff: Array<{workingHours: Array<{startMin: number; endMin: number}>}>,
	settings: {salonOpenMin: number | null; salonCloseMin: number | null},
): {openMin: number; closeMin: number} {
	const starts = staff.flatMap((s) => s.workingHours.map((w) => w.startMin))
	const ends = staff.flatMap((s) => s.workingHours.map((w) => w.endMin))
	const rawOpen = starts.length ? Math.min(...starts) : (settings.salonOpenMin ?? 480)
	const rawClose = ends.length ? Math.max(...ends) : (settings.salonCloseMin ?? 1200)
	const openMin = Math.max(0, Math.floor((rawOpen - 30) / 60) * 60)
	const closeMin = Math.min(1440, Math.ceil((rawClose + 30) / 60) * 60)
	return closeMin > openMin ? {openMin, closeMin} : {openMin: 480, closeMin: 1200}
}

type Props = {
	searchParams: Promise<{date?: string; view?: string}>
}

export default async function CalendarPage({searchParams}: Props) {
	const sp = await searchParams
	const [staff, services, staffByService, settings] = await Promise.all([
		getActiveStaffForCalendar(),
		getServicesForAdminBooking(),
		getStaffByServiceMap(),
		getSettings(),
	])

	const initialDate = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined
	const initialView = VALID_VIEWS.includes(sp.view as ViewMode) ? (sp.view as ViewMode) : undefined
	const {openMin, closeMin} = deriveHourRange(staff, settings)

	return (
		<div className="flex flex-col gap-6">
			<PageHeader eyebrow="Harmonogram" title="Kalendarz" />
			<SalonCalendar
				staff={staff}
				services={services}
				staffByService={staffByService}
				salonOpenMin={openMin}
				salonCloseMin={closeMin}
				initialDate={initialDate}
				initialView={initialView}
			/>
		</div>
	)
}
