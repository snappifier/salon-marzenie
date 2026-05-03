# Salon Marzenie - System rezerwacji

System rezerwacji wizyt online dla salonu kosmetycznego. Klienci umawiają wizyty, wybierają zabiegi i pracowników, otrzymują potwierdzenia SMS-em i mailem. Admin zarządza grafikiem, pracownikami, usługami i klientami przez panel.

---

## Stack technologiczny

- **Next.js 16** (App Router) + **React 19** - frontend i backend w jednym
- **TypeScript** - typowanie statyczne
- **Prisma 7** + **PostgreSQL** (Neon) - baza danych i ORM z driver adapterem (PrismaPg)
- **Tailwind CSS 4** - stylowanie
- **bcryptjs** - hashowanie haseł admina
- **tsx** - uruchamianie skryptów TypeScript (seed)

### Do dodania w trakcie rozwoju

- **Auth.js (NextAuth v5)** - autoryzacja admina i opcjonalnych kont klientów
- **Zod** - walidacja danych w Server Actions
- **React Hook Form** - obsługa formularzy
- **Framer Motion** (motion/react) - animacje wizard'a rezerwacji
- **shadcn/ui** - bazowe komponenty UI
- **Zustand** - state management dla wizard'a
- **TanStack Query** - cache i fetch dla slotów
- **date-fns** + **date-fns-tz** - operacje na datach
- **FullCalendar** - kalendarz w panelu admina z drag-and-drop
- **Resend** - wysyłka maili
- **SMSAPI.pl** - wysyłka SMS
- **Vitest** - testy jednostkowe logiki dostępności i slotów
- **polish-holidays** - automatyczne zamykanie salonu w święta

---

## Struktura plików - co każdy ma robić

### Pliki konfiguracyjne (root)

- `package.json` - zależności projektu i skrypty npm; w `scripts` siedzi `build` z `prisma generate` przed `next build`
- `prisma.config.ts` - konfiguracja Prismy 7; wskazuje schemę, ścieżkę migracji, datasource URL z `.env`
- `next.config.ts` - konfiguracja Next.js; aktualnie tylko `reactCompiler: true`
- `postcss.config.mjs` - konfiguracja PostCSS dla Tailwinda
- `tsconfig.json` - konfiguracja TypeScripta z aliasem `@/*` na `./src/*`
- `docker-compose.yml` - lokalny Postgres dla developmentu (alternatywa dla Neona)
- `.env` - sekrety lokalne, zawiera `DATABASE_URL` (nie commitować, jest w `.gitignore`)
- `.gitignore` - ignoruje node_modules, .next, .env, /src/generated/prisma

### Aplikacja Next.js (`src/app/`)

- `layout.tsx` - root layout, opakowuje wszystkie strony, renderuje `<html>` i `<body>`, importuje czcionki Geist
- `globals.css` - globalne style Tailwinda i zmienne CSS dla motywów

### Strony publiczne (`src/app/(public)/`)

Folder w nawiasach to "route group" - nie pojawia się w URL-u, służy organizacji.

- `page.tsx` - strona główna salonu (landing); placeholder
- `uslugi/page.tsx` - lista wszystkich zabiegów z opisami i cenami
- `rezerwacja/page.tsx` - wizard rezerwacji (wybór zabiegów → pracowników → terminu → dane)
- `rezerwacja/sukces/[id]/page.tsx` - ekran sukcesu po rezerwacji
- `moja-wizyta/[token]/page.tsx` - klient zarządza swoją wizytą przez magic link

### Panel admina (`src/app/admin/`)

- `layout.tsx` - guard sprawdzający sesję admina, sidebar nawigacji
- `kalendarz/page.tsx` - widok kalendarza z drag-and-drop, główne miejsce pracy admina
- `pracownicy/page.tsx` - CRUD pracowników, godziny pracy, urlopy, przypisane usługi
- `uslugi/page.tsx` - CRUD zabiegów (nazwa, kategoria, czas, bufor, cena)
- `klienci/page.tsx` - lista klientów, historia wizyt, notatki
- `ustawienia/page.tsx` - dni zamknięte salonu, polityka anulowania, dane kontaktu admina

### API routes (`src/app/api/`)

- `slots/route.ts` - GET endpoint zwracający wolne sloty dla wybranych zabiegów + preferencji pracowników + daty
- `cron/reminders/route.ts` - endpoint wywoływany przez Vercel Cron, wysyła przypomnienia 48h przed wizytą

### Logika biznesowa (`src/features/`)

Każdy feature siedzi w jednym folderze - `actions.ts`, `queries.ts`, `logic.ts`, `notifications.ts`, `types.ts`, `slots.ts`.

- `availability/logic.ts` - `getStaffAvailability(staffId, date)` zwracające wolne przedziały po odjęciu rezerwacji, urlopów, dni zamkniętych
- `availability/logic.test.ts` - testy edge case'ów (urlop w trakcie dnia, święto, brak godzin pracy)
- `booking/actions.ts` - Server Actions: createByCustomer, cancelByCustomer, createByAdmin, updateByAdmin, moveItemByAdmin
- `booking/queries.ts` - funkcje czytające bookingi (po dacie, kliencie, pracowniku, tokenie)
- `booking/logic.ts` - czyste funkcje walidacji (czy slot wolny, czy nie za późno na anulowanie, resolveDuration/Buffer/Price)
- `booking/slots.ts` - algorytm znajdowania slotów dla wielu zabiegów z hybrydowym przypisaniem pracowników
- `booking/notifications.ts` - definicje, jakie powiadomienia wysyłać przy jakich zdarzeniach
- `booking/types.ts` - wspólne typy domenowe (BookingDraft, SlotProposal, StaffAssignment)
- `services/actions.ts` - Server Actions do CRUD-a usług
- `services/queries.ts` - funkcje czytające usługi (lista aktywnych, po kategorii)
- `staff/actions.ts` - Server Actions do zarządzania pracownikami i grafikami
- `staff/queries.ts` - funkcje czytające pracowników (lista, kto umie zabieg X, grafik na dzień)
- `customers/actions.ts` - Server Actions do tworzenia/edycji klienta
- `customers/queries.ts` - funkcje czytające klientów (po telefonie, mailu, lista z filtrami)

### Komponenty UI (`src/components/`)

- `booking-wizard/wizard.tsx` - komponent rodzica orkiestrujący kroki, animacje przejść
- `booking-wizard/wizard-store.ts` - Zustand store dla stanu wizard'a (wybrane zabiegi, preferencje, slot)
- `booking-wizard/step-services.tsx` - krok wyboru zabiegów, multi-select pogrupowany po kategoriach
- `booking-wizard/step-staff.tsx` - dla każdego zabiegu wybór pracownika lub "obojętnie"
- `booking-wizard/step-date.tsx` - kalendarz miesięczny z dostępnymi dniami
- `booking-wizard/step-time.tsx` - lista slotów z planem przypisań
- `booking-wizard/step-details.tsx` - dane klienta (imię, telefon, email, RODO)
- `booking-wizard/step-summary.tsx` - podsumowanie i potwierdzenie rezerwacji
- `admin-calendar/calendar.tsx` - główny komponent FullCalendar z eventami i drag-and-drop
- `admin-calendar/event-calendar.tsx` - render pojedynczej wizyty na kalendarzu
- `admin-calendar/booking-dialog.tsx` - modal do tworzenia/edycji wizyty
- `admin-calendar/staff-filter.tsx` - filtr pokazujący/ukrywający kolumny pracowników

### Utilities (`src/lib/`)

- `prisma.ts` - singleton instancji PrismaClient z driver adapterem PrismaPg, gotowy do użycia wszędzie w aplikacji
- `auth.ts` - konfiguracja Auth.js, providery, callbacks (do napisania)
- `sms.ts` - klient SMSAPI.pl, eksportuje `sendSms(to, body)` (do napisania)
- `email.ts` - klient Resend, eksportuje `sendEmail({to, subject, react})` (do napisania)
- `date.ts` - helpery na daty (formatowanie po polsku, konwersja UTC ↔ Europe/Warsaw, parsowanie godzin)
- `money.ts` - helpery na pieniądze (przechowywanie w groszach jako Int, formatowanie do "150 zł")

### Baza danych (`src/prisma/`)

- `schema.prisma` - definicja wszystkich modeli (Service, Staff, StaffService, WorkingHours, TimeOff, SalonClosedDay, Customer, Booking, BookingItem, Notification, AdminUser, Settings, Category)
- `seed.ts` - skrypt napełniający bazę realistycznymi danymi do developmentu
- `migrations/` - historia migracji bazy generowana przez Prismę

### Wygenerowany klient (`src/generated/prisma/`)

Automatycznie generowany przez `prisma generate`. NIE edytować ręcznie. Jest w `.gitignore`. Zawiera typy, klienta, enumy.

---

## Co dalej z projektem - krok po kroku

### Faza 2: Logika dostępności (TERAZ)

**Cel:** mieć działające, otestowane funkcje, na których oprze się reszta systemu.

1. Napisać `getStaffAvailability(staffId, date)` w `src/features/availability/logic.ts` - zwraca listę wolnych przedziałów `[{start, end}]` dla pracownika danego dnia, uwzględniając WorkingHours, TimeOff, SalonClosedDay, święta, istniejące BookingItems z buforami
2. Napisać helpery w `src/features/booking/logic.ts`:
    - `resolveDuration(serviceId, staffId)` - zwraca czas trwania (override lub default)
    - `resolveBuffer(serviceId, staffId)` - zwraca bufor po zabiegu
    - `resolvePrice(serviceId, staffId)` - zwraca cenę
    - `canStaffPerformService(staffId, serviceId)` - sprawdza, czy pracownik umie zabieg
3. Zainstalować Vitest, napisać testy jednostkowe dla każdego edge case'u
4. Zainstalować `polish-holidays` do automatycznego rozpoznawania świąt

### Faza 3: Algorytm slotów

**Cel:** mieć działającą funkcję `findSlotsForServices`.

1. Napisać `findSlotsForServices` w `src/features/booking/slots.ts` - bierze listę zabiegów, preferencje pracowników (konkretny lub "obojętnie"), datę; zwraca propozycje slotów z przypisaniami
2. Pokryć testami trudne case'y (jedna pracownica umie wszystko ale ma urlop; różne kombinacje przypisań)
3. Wystawić endpoint `app/api/slots/route.ts` - cienki wrapper na funkcję

### Faza 4: Auth i panel admina (szkielet)

1. Zainstalować Auth.js v5 i bcryptjs
2. Skonfigurować `src/lib/auth.ts` z providerem Credentials
3. Stworzyć `app/admin/login/page.tsx` z formularzem logowania
4. W `app/admin/layout.tsx` sprawdzać sesję, redirect do logowania jeśli brak
5. Dodać sidebar nawigacji w layoucie admina

### Faza 5: Panel admina - CRUD-y

1. Strona `/admin/uslugi` - lista, dodawanie, edycja, dezaktywacja zabiegów
2. Strona `/admin/pracownicy` - CRUD pracowników z podstronami: godziny pracy, urlopy, przypisane usługi
3. Strona `/admin/klienci` - lista, wyszukiwarka, edycja danych i notatek
4. Strona `/admin/ustawienia` - dni zamknięte, polityka anulowania, dane admina
5. Wszystko przez Server Actions w `features/[feature]/actions.ts` z walidacją Zod

### Faza 6: Panel admina - kalendarz

1. Zainstalować FullCalendar z `resourceTimeGridPlugin`
2. Wyrenderować widok dziennego/tygodniowego kalendarza z kolumnami per pracownik
3. Drag-and-drop event = wywołanie Server Action z luźnymi walidacjami (admin może łamać reguły)
4. Klik na pusty slot = dialog "dodaj wizytę"
5. Klik na event = dialog z edycją (zmiana pracownika, czasu, anulowanie, no-show)

### Faza 7: Frontend klienta - wizard rezerwacji

1. Zainstalować Zustand, Framer Motion, React Hook Form
2. Zbudować Zustand store w `components/booking-wizard/wizard-store.ts`
3. Zaimplementować 6 kroków wizard'a po kolei
4. Animacje przejść między krokami
5. Server Action `createBookingByCustomer` z lockiem w transakcji (anty-overlap)

### Faza 8: Zarządzanie wizytą przez klienta

1. Strona `/moja-wizyta/[token]` pokazuje szczegóły wizyty
2. Przycisk "Anuluj" wywołuje Server Action z polityką (min 24h przed)
3. Jeśli za późno - komunikat "Skontaktuj się z salonem"

### Faza 9: Powiadomienia (SMS i mail)

1. Skonfigurować Resend i SMSAPI.pl, klucze w env vars
2. Napisać `src/lib/sms.ts` i `src/lib/email.ts` z funkcjami `sendSms`, `sendEmail`
3. Po `createBookingByCustomer` zapisać Notification typu CONFIRMATION (od razu) i REMINDER (48h przed)
4. Po `cancelBookingByCustomer` zapisać Notification dla admina
5. Endpoint `app/api/cron/reminders/route.ts` co godzinę pobiera i wysyła pending notyfikacje
6. Skonfigurować Vercel Cron w `vercel.json`

### Faza 10: Strona główna i SEO

1. Landing page z hero, ofertą, opiniami, kontaktem, CTA do rezerwacji
2. Strona `/uslugi` z listą zabiegów, opisami, cenami
3. Stopka z danymi kontaktowymi, godzinami pracy, mapą Google
4. SEO metadata, sitemap, robots.txt, Open Graph
5. Cookie banner i polityka prywatności (RODO)
6. Test RWD na mobilce, lighthouse, optymalizacja obrazków

---

## Workflow developera

### Lokalna praca

```bash
npm run dev
```

Otwórz `http://localhost:3000` w przeglądarce.

### Zmiana schemy bazy danych

```bash
# Edytuj src/prisma/schema.prisma
npx prisma migrate dev --name nazwa_zmiany
```

### Reset bazy lokalnej

```bash
npx prisma migrate reset
npx prisma db seed
```

### Otwarcie GUI bazy danych

```bash
npx prisma studio
```

### Deploy na Vercel

```bash
git add .
git commit -m "opis zmian"
git push
```

Vercel automatycznie deployuje branch `main` na produkcyjny URL w 1-2 minuty.

### Migracja schemy na produkcji

Po pushu zmian schemy do gita, w nowym oknie PowerShella:

```powershell
$env:DATABASE_URL="<PROD_URL_Z_NEONA>"
npx prisma migrate deploy
```

Zmienna znika z PowerShella po zamknięciu okna - lokalny `.env` zostaje nietknięty.

---

## Konwencje kodu

- Server Actions w `features/[feature]/actions.ts`
- Zapytania do bazy w `features/[feature]/queries.ts`
- Czyste funkcje domenowe w `features/[feature]/logic.ts`
- Komponenty grupowane per feature w `components/[feature]/`
- Wszystkie czasy w bazie jako UTC, konwersja do Europe/Warsaw w UI
- Pieniądze przechowywane w groszach jako Int
- Telefony w formacie E.164 (`+48123456789`)
- Soft delete przez pole `active: Boolean` zamiast hard delete

## Konto admina (dev)

- Email: `admin@salon-marzenie.pl`
- Hasło: `admin123`

Hasło ustawione w `src/prisma/seed.ts`. Zmień przed produkcją.

---

## Pełny stack technologiczny

### Już zainstalowane

**Framework i język:**
- Next.js 16 (App Router) - framework fullstackowy
- React 19 - biblioteka UI
- TypeScript 5 - typowanie statyczne

**Baza danych:**
- PostgreSQL - silnik bazy danych
- Neon - hosting Postgresa w chmurze (dev + prod jako oddzielne projekty)
- Prisma 7 - ORM, migracje, klient
- @prisma/adapter-pg - driver adapter dla Prismy 7
- pg - sterownik PostgreSQL dla Node.js

**Stylowanie:**
- Tailwind CSS 4 - framework CSS

**Narzędzia developerskie:**
- bcryptjs - hashowanie haseł admina
- tsx - uruchamianie skryptów TypeScript (potrzebne dla seed)
- dotenv - ładowanie zmiennych środowiskowych

**Hosting i deployment:**
- Vercel - hosting aplikacji, auto-deploy z GitHuba
- GitHub - repozytorium kodu

### Do zainstalowania w trakcie projektu

**Faza 2 - Logika dostępności:**
- Vitest - framework testów jednostkowych
- polish-holidays - polskie święta do automatycznego zamykania salonu
- date-fns - operacje na datach
- date-fns-tz - obsługa stref czasowych

**Faza 4 - Auth i panel admina:**
- Auth.js (NextAuth v5) - autoryzacja admina i opcjonalnych kont klientów
- Zod - walidacja danych w Server Actions

**Faza 5 - Panel admina (CRUD-y):**
- shadcn/ui - bazowe komponenty UI (dialog, select, popover, toast, button, input)
- React Hook Form - obsługa formularzy
- react-hot-toast lub shadcn toast - notyfikacje w UI

**Faza 6 - Kalendarz admina:**
- FullCalendar + plugin resourceTimeGridPlugin - kalendarz z drag-and-drop, kolumny per pracownik

**Faza 7 - Wizard rezerwacji klienta:**
- Zustand - state management dla wieloetapowego wizard'a
- Framer Motion (motion/react) - animacje przejść między krokami
- TanStack Query - cache i fetch slotów po stronie klienta

**Faza 9 - Powiadomienia:**
- Resend - wysyłka maili (transactional)
- SMSAPI.pl - wysyłka SMS (polski rynek)
- Vercel Cron - cykliczne wywołanie endpointu przypomnień

### Opcjonalne (jeśli zajdzie potrzeba)

- Stripe - przedpłaty/zaliczki za wizyty (redukuje no-show'y)
- Google Calendar API - synchronizacja kalendarzy pracownic
- Sentry - monitoring błędów na produkcji
- Posthog lub Plausible - analityka użytkowników
- next-intl - jeśli salon obsługuje turystów (polski + angielski)

### Komendy instalacji per faza

**Faza 2 - Logika dostępności**
```bash
npm i -D vitest
npm i polish-holidays date-fns date-fns-tz
```

**Faza 4 - Auth**
```bash
npm i next-auth@beta zod
```

**Faza 5 - Panel admina (CRUD)**
```bash
npm i react-hook-form @hookform/resolvers
npx shadcn@latest init
npx shadcn@latest add button input dialog select popover toast form
```

**Faza 6 - Kalendarz**
```bash
npm i @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/resource-timegrid @fullcalendar/interaction
```

**Faza 7 - Wizard rezerwacji**
```bash
npm i zustand motion @tanstack/react-query
```

**Faza 9 - Powiadomienia**
```bash
npm i resend
# SMSAPI.pl - klient piszesz sam, ich API to zwykły REST
```

### Czego świadomie nie używamy

- Spring Boot / Java - overkill dla CRUD-a z prostą logiką, dwa runtime'y, dwa repo, dwa razy tyle pracy
- NestJS - dodatkowa warstwa między Tobą a kodem, niepotrzebna dla solo developera
- tRPC - Server Actions w App Routerze załatwiają to samo prościej
- Supabase (jako BaaS) - logika domenowa typu "wygeneruj sloty" nie zmieści się w RLS-ach, lepiej zostać przy Prismie
- Docker lokalnie - Neon jest prostszy i tę samą technologię (Postgres) masz w produkcji
- Redux - zbyt ciężki na tak mały state, Zustand wystarczy