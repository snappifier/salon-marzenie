import {
    getActiveStaffForCalendar,
    getServicesForAdminBooking,
    getStaffByServiceMap,
} from "@/features/booking/calendar-queries"
import {Calendar} from "@/components/admin-calendar/calendar"

export default async function CalendarPage() {
    const [staff, services, staffByService] = await Promise.all([
        getActiveStaffForCalendar(),
        getServicesForAdminBooking(),
        getStaffByServiceMap(),
    ])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Kalendarz</h1>
            <Calendar
                staff={staff}
                services={services}
                staffByService={staffByService}
            />
        </div>
    )
}