"use client"

import {useRef, useState} from "react"
import FullCalendar from "@fullcalendar/react"
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type {EventClickArg, EventInput} from "@fullcalendar/core"
import type {DateClickArg} from "@fullcalendar/interaction"
import {fetchCalendarEvents, type CalendarEvent} from "@/features/booking/calendar-actions"
import {EventDetailDialog} from "./event-detail-dialog"
import {AddBookingDialog} from "./add-booking-dialog"
import {DAY_OF_WEEK_TO_NUMBER, minutesToTimeString} from "@/lib/date"
import type {DayOfWeek} from "@/generated/prisma/client"

type StaffResource = {
    id: string
    firstName: string
    lastName: string
    color: string
    workingHours: Array<{dayOfWeek: DayOfWeek; startMin: number; endMin: number}>
    timeOffs: Array<{id: string; startAt: Date; endAt: Date; reason: string | null}>
}

type Service = {
    id: string
    name: string
    categoryName: string
    defaultDurationMin: number
    defaultPriceGr: number
}

type Props = {
    staff: StaffResource[]
    services: Service[]
    staffByService: Record<string, Array<{id: string; firstName: string; lastName: string}>>
}

export function Calendar({staff, services, staffByService}: Props) {
    const calendarRef = useRef<FullCalendar | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent["extendedProps"] | null>(null)
    const [addContext, setAddContext] = useState<{start: Date; staffId: string | null} | null>(null)

    function handleDateClick(arg: DateClickArg) {
        const resourceId = (arg as DateClickArg & {resource?: {id: string}}).resource?.id ?? null
        setAddContext({start: arg.date, staffId: resourceId})
    }

    function handleAddSuccess() {
        setAddContext(null)
        calendarRef.current?.getApi().refetchEvents()
    }

    function handleEventClick(arg: EventClickArg) {
        if (arg.event.display === "background") return
        const props = arg.event.extendedProps as CalendarEvent["extendedProps"]
        setSelectedEvent(props)
    }

    const resources = staff.map((s) => ({
        id: s.id,
        title: `${s.firstName} ${s.lastName}`,
        eventColor: s.color,
        businessHours: s.workingHours.map((wh) => ({
            daysOfWeek: [DAY_OF_WEEK_TO_NUMBER[wh.dayOfWeek]],
            startTime: minutesToTimeString(wh.startMin),
            endTime: minutesToTimeString(wh.endMin),
        })),
    }))

    const timeOffEvents: EventInput[] = staff.flatMap((s) =>
        s.timeOffs.map((to) => ({
            id: `timeoff-${to.id}`,
            resourceId: s.id,
            start: to.startAt.toISOString(),
            end: to.endAt.toISOString(),
            display: "background",
            backgroundColor: "rgba(150, 150, 150, 0.4)",
            title: to.reason ?? "Urlop",
        })),
    )

    return (
        <div>
            <FullCalendar
                ref={calendarRef}
                dateClick={handleDateClick}
                plugins={[resourceTimeGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="resourceTimeGridDay"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "resourceTimeGridDay,timeGridWeek",
                }}
                buttonText={{
                    today: "Dziś",
                    day: "Dzień",
                    week: "Tydzień",
                }}
                views={{
                    resourceTimeGridDay: {
                        type: "resourceTimeGrid",
                        duration: {days: 1},
                        buttonText: "Dzień",
                    },
                    timeGridWeek: {
                        type: "timeGrid",
                        duration: {weeks: 1},
                        buttonText: "Tydzień",
                    },
                }}
                resources={resources}
                eventSources={[
                    {
                        events: async (info, successCallback, failureCallback) => {
                            try {
                                const events = await fetchCalendarEvents(
                                    info.start.toISOString(),
                                    info.end.toISOString(),
                                )
                                successCallback(events)
                            } catch (e) {
                                failureCallback(e as Error)
                            }
                        },
                    },
                    {
                        events: timeOffEvents,
                    },
                ]}
                eventClick={handleEventClick}
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:15:00"
                slotLabelInterval="01:00:00"
                allDaySlot={false}
                locale="pl"
                firstDay={1}
                nowIndicator
                height="auto"
            />

            {addContext && (
                <AddBookingDialog
                    prefilledStart={addContext.start}
                    prefilledStaffId={addContext.staffId}
                    services={services}
                    staffByService={staffByService}
                    onClose={() => setAddContext(null)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {selectedEvent && (
                <EventDetailDialog
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    )
}