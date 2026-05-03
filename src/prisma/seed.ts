import { DayOfWeek } from "@/generated/prisma/client"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

async function main() {
    console.log("Seeding database...")

    // Wyczyść w odpowiedniej kolejności (FK constraints)
    await prisma.notification.deleteMany()
    await prisma.bookingItem.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.timeOff.deleteMany()
    await prisma.workingHours.deleteMany()
    await prisma.staffService.deleteMany()
    await prisma.salonClosedDay.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.service.deleteMany()
    await prisma.category.deleteMany()
    await prisma.adminUser.deleteMany()
    await prisma.settings.deleteMany()

    // === USTAWIENIA SALONU ===
    await prisma.settings.create({
        data: {
            id: "settings",
            minCancelHoursBefore: 24,
            minBookingHoursAhead: 2,
            maxBookingDaysAhead: 60,
            slotIntervalMin: 15,
            salonName: "Salon Marzenie",
            salonPhone: "+48123456789",
            salonEmail: "kontakt@salon-marzenie.pl",
            salonAddress: "ul. Przykładowa 1, 00-001 Warszawa",
            adminNotificationEmail: "admin@salon-marzenie.pl",
            adminNotifyOnCancel: true,
            salonOpenMin: 8 * 60,
            salonCloseMin: 20 * 60,
        },
    })

    // === ADMIN ===
    const adminPassword = await hash("admin123", 10)
    await prisma.adminUser.create({
        data: {
            email: "admin@salon-marzenie.pl",
            passwordHash: adminPassword,
            firstName: "Anna",
            lastName: "Kowalska",
        },
    })

    // === KATEGORIE ===
    const catManicure = await prisma.category.create({ data: { name: "Manicure", slug: "manicure", order: 1 } })
    const catPedicure = await prisma.category.create({ data: { name: "Pedicure", slug: "pedicure", order: 2 } })
    const catBrwiRzesy = await prisma.category.create({ data: { name: "Brwi i rzęsy", slug: "brwi-rzesy", order: 3 } })
    const catTwarz = await prisma.category.create({ data: { name: "Pielęgnacja twarzy", slug: "twarz", order: 4 } })
    const catDepilacja = await prisma.category.create({ data: { name: "Depilacja", slug: "depilacja", order: 5 } })

    // === USŁUGI ===
    const services = await Promise.all([
        prisma.service.create({ data: { name: "Manicure klasyczny", categoryId: catManicure.id, defaultDurationMin: 45, defaultBufferAfterMin: 10, defaultPriceGr: 6000 } }),
        prisma.service.create({ data: { name: "Manicure hybrydowy", categoryId: catManicure.id, defaultDurationMin: 60, defaultBufferAfterMin: 10, defaultPriceGr: 9000 } }),
        prisma.service.create({ data: { name: "Manicure żelowy", categoryId: catManicure.id, defaultDurationMin: 90, defaultBufferAfterMin: 15, defaultPriceGr: 13000 } }),
        prisma.service.create({ data: { name: "Pedicure klasyczny", categoryId: catPedicure.id, defaultDurationMin: 60, defaultBufferAfterMin: 15, defaultPriceGr: 9000 } }),
        prisma.service.create({ data: { name: "Pedicure hybrydowy", categoryId: catPedicure.id, defaultDurationMin: 75, defaultBufferAfterMin: 15, defaultPriceGr: 12000 } }),
        prisma.service.create({ data: { name: "Henna brwi", categoryId: catBrwiRzesy.id, defaultDurationMin: 30, defaultBufferAfterMin: 5, defaultPriceGr: 4000 } }),
        prisma.service.create({ data: { name: "Regulacja brwi", categoryId: catBrwiRzesy.id, defaultDurationMin: 20, defaultBufferAfterMin: 5, defaultPriceGr: 3000 } }),
        prisma.service.create({ data: { name: "Laminacja brwi", categoryId: catBrwiRzesy.id, defaultDurationMin: 60, defaultBufferAfterMin: 10, defaultPriceGr: 12000 } }),
        prisma.service.create({ data: { name: "Lifting rzęs", categoryId: catBrwiRzesy.id, defaultDurationMin: 75, defaultBufferAfterMin: 10, defaultPriceGr: 15000 } }),
        prisma.service.create({ data: { name: "Oczyszczanie wodorowe", categoryId: catTwarz.id, defaultDurationMin: 90, defaultBufferAfterMin: 15, defaultPriceGr: 25000 } }),
        prisma.service.create({ data: { name: "Mezoterapia mikroigłowa", categoryId: catTwarz.id, defaultDurationMin: 75, defaultBufferAfterMin: 15, defaultPriceGr: 35000 } }),
        prisma.service.create({ data: { name: "Peeling kawitacyjny", categoryId: catTwarz.id, defaultDurationMin: 60, defaultBufferAfterMin: 10, defaultPriceGr: 18000 } }),
        prisma.service.create({ data: { name: "Depilacja woskiem - nogi całe", categoryId: catDepilacja.id, defaultDurationMin: 45, defaultBufferAfterMin: 10, defaultPriceGr: 9000 } }),
        prisma.service.create({ data: { name: "Depilacja woskiem - bikini", categoryId: catDepilacja.id, defaultDurationMin: 30, defaultBufferAfterMin: 10, defaultPriceGr: 6000 } }),
    ])

    // === PRACOWNICE ===
    const ania = await prisma.staff.create({ data: { firstName: "Ania", lastName: "Nowak", email: "ania@salon-marzenie.pl", phone: "+48111111111", color: "#f472b6" } })
    const marta = await prisma.staff.create({ data: { firstName: "Marta", lastName: "Wiśniewska", email: "marta@salon-marzenie.pl", phone: "+48222222222", color: "#a78bfa" } })
    const kasia = await prisma.staff.create({ data: { firstName: "Kasia", lastName: "Kowalczyk", email: "kasia@salon-marzenie.pl", phone: "+48333333333", color: "#60a5fa" } })
    const ola = await prisma.staff.create({ data: { firstName: "Ola", lastName: "Lewandowska", email: "ola@salon-marzenie.pl", phone: "+48444444444", color: "#34d399" } })
    const beata = await prisma.staff.create({ data: { firstName: "Beata", lastName: "Zielińska", email: "beata@salon-marzenie.pl", phone: "+48555555555", color: "#fbbf24" } })

    // === PRZYPISANIA UMIEJĘTNOŚCI ===
    const [manKlas, manHyb, manZel, pedKlas, pedHyb, henna, regBrwi, lamBrwi, liftRzes, oczWod, mezo, peelKaw, depNog, depBik] = services

    const assignments: Array<{ staffId: string; serviceId: string }> = [
        // Ania - manicure/pedicure + brwi
        { staffId: ania.id, serviceId: manKlas.id },
        { staffId: ania.id, serviceId: manHyb.id },
        { staffId: ania.id, serviceId: manZel.id },
        { staffId: ania.id, serviceId: pedKlas.id },
        { staffId: ania.id, serviceId: pedHyb.id },
        { staffId: ania.id, serviceId: henna.id },
        { staffId: ania.id, serviceId: regBrwi.id },
        // Marta - twarz + brwi
        { staffId: marta.id, serviceId: oczWod.id },
        { staffId: marta.id, serviceId: mezo.id },
        { staffId: marta.id, serviceId: peelKaw.id },
        { staffId: marta.id, serviceId: henna.id },
        { staffId: marta.id, serviceId: regBrwi.id },
        { staffId: marta.id, serviceId: lamBrwi.id },
        // Kasia - manicure + brwi/rzęsy
        { staffId: kasia.id, serviceId: manKlas.id },
        { staffId: kasia.id, serviceId: manHyb.id },
        { staffId: kasia.id, serviceId: henna.id },
        { staffId: kasia.id, serviceId: regBrwi.id },
        { staffId: kasia.id, serviceId: lamBrwi.id },
        { staffId: kasia.id, serviceId: liftRzes.id },
        // Ola - depilacja + pedicure
        { staffId: ola.id, serviceId: pedKlas.id },
        { staffId: ola.id, serviceId: pedHyb.id },
        { staffId: ola.id, serviceId: depNog.id },
        { staffId: ola.id, serviceId: depBik.id },
        // Beata - wszystko (manager)
        ...services.map((s) => ({ staffId: beata.id, serviceId: s.id })),
    ]

    await prisma.staffService.createMany({ data: assignments })

    // === GODZINY PRACY ===
    const wh = (staffId: string, day: DayOfWeek, startMin: number, endMin: number) => ({ staffId, dayOfWeek: day, startMin, endMin })

    await prisma.workingHours.createMany({
        data: [
            // Ania: pn-pt 9-17
            wh(ania.id, "MONDAY", 9 * 60, 17 * 60),
            wh(ania.id, "TUESDAY", 9 * 60, 17 * 60),
            wh(ania.id, "WEDNESDAY", 9 * 60, 17 * 60),
            wh(ania.id, "THURSDAY", 9 * 60, 17 * 60),
            wh(ania.id, "FRIDAY", 9 * 60, 17 * 60),
            // Marta: wt-sb 11-19
            wh(marta.id, "TUESDAY", 11 * 60, 19 * 60),
            wh(marta.id, "WEDNESDAY", 11 * 60, 19 * 60),
            wh(marta.id, "THURSDAY", 11 * 60, 19 * 60),
            wh(marta.id, "FRIDAY", 11 * 60, 19 * 60),
            wh(marta.id, "SATURDAY", 11 * 60, 19 * 60),
            // Kasia: pn,śr,pt 8-14, sb 9-15
            wh(kasia.id, "MONDAY", 8 * 60, 14 * 60),
            wh(kasia.id, "WEDNESDAY", 8 * 60, 14 * 60),
            wh(kasia.id, "FRIDAY", 8 * 60, 14 * 60),
            wh(kasia.id, "SATURDAY", 9 * 60, 15 * 60),
            // Ola: pn-pt 10-18
            wh(ola.id, "MONDAY", 10 * 60, 18 * 60),
            wh(ola.id, "TUESDAY", 10 * 60, 18 * 60),
            wh(ola.id, "WEDNESDAY", 10 * 60, 18 * 60),
            wh(ola.id, "THURSDAY", 10 * 60, 18 * 60),
            wh(ola.id, "FRIDAY", 10 * 60, 18 * 60),
            // Beata: pn-sb 8-20
            wh(beata.id, "MONDAY", 8 * 60, 20 * 60),
            wh(beata.id, "TUESDAY", 8 * 60, 20 * 60),
            wh(beata.id, "WEDNESDAY", 8 * 60, 20 * 60),
            wh(beata.id, "THURSDAY", 8 * 60, 20 * 60),
            wh(beata.id, "FRIDAY", 8 * 60, 20 * 60),
            wh(beata.id, "SATURDAY", 8 * 60, 20 * 60),
        ],
    })

    // === URLOPY (testowe) ===
    const inTwoWeeks = new Date()
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14)
    const inThreeWeeks = new Date()
    inThreeWeeks.setDate(inThreeWeeks.getDate() + 21)

    await prisma.timeOff.create({
        data: {
            staffId: marta.id,
            startAt: inTwoWeeks,
            endAt: inThreeWeeks,
            reason: "Urlop wypoczynkowy",
        },
    })

    // === DNI ZAMKNIĘTE SALONU ===
    const allSaints = new Date(new Date().getFullYear() + 1, 10, 1)
    await prisma.salonClosedDay.create({
        data: { date: allSaints, reason: "Wszystkich Świętych" },
    })

    // === KLIENCI TESTOWI ===
    await prisma.customer.create({
        data: {
            firstName: "Joanna",
            lastName: "Kowalska",
            phone: "+48600100200",
            email: "joanna.k@example.com",
            notes: "Alergia na lakiery z formaldehydem",
        },
    })
    await prisma.customer.create({
        data: {
            firstName: "Magdalena",
            lastName: "Nowak",
            phone: "+48600200300",
            email: "m.nowak@example.com",
        },
    })

    console.log("Seed complete.")
    console.log("Admin login: admin@salon-marzenie.pl / admin123")
}

main()
    .catch((e) => {
        console.error("Seed failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })