@AGENTS.md
# Salon Marzenie - Project Context for Claude Code

This file is the durable memory for an ongoing project. Read it fully before doing anything in this repo.

---

## What this project is

**Salon Marzenie** is a Polish-language booking and appointment system for a small cosmetic salon (`studio kosmetyki estetycznej`). One physical location, several stylists, owned by a single client (two sisters running it together). Target users: women 25-55 in a smaller Polish city, mostly mobile bookings, often evenings.

**Brand vibe**: not "luxury medical spa", not "glamour glitter beauty", not "modern tech minimalism". The right mental model is **warm, local, professional salon you've been visiting for years**. Feminine, soft, elegant, romantic but not infantile. Powder pink + graphite + warm cream/white, with a butterfly motif from the logo.

**Repo**: github.com/snappifier/salon-marzenie
**Admin credentials (dev)**: admin@salon-marzenie.pl / admin123

---

## Tech stack

- **Next.js 16.2.4** (App Router, React 19, TypeScript)
- **React 19** patterns: `ref` as a normal prop (NOT `forwardRef`), `useActionState` for form mutations
- **Tailwind CSS v4** with `@theme` directive (NO `tailwind.config.ts`)
- **Prisma 7.8** + **PostgreSQL** on Neon
- **Auth.js v5** (NextAuth) for admin auth, customer auth via passwordless tokens
- **motion/react** (formerly `framer-motion` - now this is the package name)
- **lucide-react** for icons
- **clsx + tailwind-merge** via `@/lib/cn`
- **FullCalendar** for admin appointment calendar
- **Zustand** for booking wizard state
- **date-fns + date-fns-tz** for date handling (timezone: Europe/Warsaw)
- **Zod** for schema validation
- **bcryptjs** for password hashing

No shadcn, no Radix. All UI primitives are custom-built. This was a deliberate decision early in the project.

---

## CRITICAL: Code Style Conventions

These are non-negotiable. The user (Snappify / Krystian) cares about them strongly and will push back if violated.

### Formatting
- **Tabs for indentation**, never spaces.
- **No semicolons** at end of statements in TS/TSX. CSS files keep semicolons (CSS syntax requires them).
- **Single comment at top of every TS/TSX file** with the file path: `// src/components/something.tsx`. Skip this comment for CSS files.
- `'use client'` on its own line, **first line of the file** when needed.

### TypeScript
- **`className` as first JSX attribute** when present.
- **`import {motion}` with no spaces inside braces** - same for `{useState}`, `{useEffect}`, etc.
- Import from `"motion/react"`, NOT `"framer-motion"`.
- Animation `variants` defined **inside** components, not extracted globally (unless reused across files).
- Prefer interface over type for component props.
- Use `Record<Key, Value>` for variant maps.

### Naming
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Files: `kebab-case.tsx`
- CSS custom properties: `--color-rose-500`, `--font-serif`, etc.

### Polish content
- Use proper Polish diacritics: ą, ę, ć, ż, ó, ł, ś, ń, ź. The mockups had them stripped (encoding issue) - we always include them.
- UI copy is in Polish. Comments in code can be either, but stay consistent within a file.

### Forbidden
- **No emoji anywhere** - not in code, not in comments, not in console output, not in UI text, not in commit messages. Serious zero-tolerance rule.
- No `transition-all` - always specify which properties transition (e.g. `transition-[border-color,box-shadow]`).
- No `forwardRef` - React 19 supports ref as a regular prop.
- No `framer-motion` import string - use `motion/react`.

---

## Project structure

```
src/
├── app/
│   ├── (public)/                # Customer-facing pages
│   │   ├── layout.tsx           # Fetches Settings, wraps with MotionProvider + Header + Footer
│   │   ├── page.tsx             # Landing (6 sections)
│   │   ├── error.tsx            # Graceful error fallback
│   │   ├── loading.tsx          # Loading state with pulse dot
│   │   ├── uslugi/page.tsx      # Services price list page
│   │   ├── rezerwacja/page.tsx          # 6-step booking wizard
│   │   ├── rezerwacja/sukces/[id]/      # Booking confirmation
│   │   └── moja-wizyta/[token]/         # Customer self-service (cancel etc.)
│   ├── admin/                   # Admin panel - calendar, CRUDs, settings
│   ├── api/
│   │   ├── auth/                # NextAuth handlers
│   │   └── cron/reminders/      # Vercel cron endpoint for SMS/email reminders (Phase 9)
│   ├── globals.css              # Design tokens + custom utilities
│   └── layout.tsx               # Root with Fraunces + Inter fonts, lang="pl"
├── components/
│   ├── ui/                      # Primitives - all custom, no Radix
│   │   ├── button.tsx           # buttonStyles() function + Button component
│   │   ├── container.tsx        # max-w-[1440px] default, narrow=880, prose=640
│   │   ├── eyebrow.tsx          # Uppercase tracking-wide rose-600 small label
│   │   ├── field.tsx            # Input + label + hint + error with aria
│   │   ├── textarea.tsx         # Same pattern as Field
│   │   ├── heading.tsx          # Polymorphic h1/h2/h3, font-serif
│   │   └── reveal.tsx           # Client component, motion whileInView
│   ├── public/
│   │   ├── motion-provider.tsx  # MotionConfig reducedMotion="user"
│   │   ├── header.tsx           # Sticky, backdrop-blur, scroll-aware border, disclosure mobile menu
│   │   ├── footer.tsx           # Dark graphite-900, DB salon info, hardcoded hours
│   │   ├── butterfly-watermark.tsx  # Reusable decorative SVG
│   │   ├── landing/             # Landing page sections
│   │   │   ├── hero.tsx
│   │   │   ├── categories.tsx
│   │   │   ├── trust-band.tsx
│   │   │   ├── reviews.tsx
│   │   │   ├── certs.tsx
│   │   │   └── final-cta.tsx
│   │   └── services/            # /uslugi page sections
│   │       ├── services-hero.tsx
│   │       ├── category-nav.tsx     # Sticky pill nav with IntersectionObserver scroll-spy
│   │       ├── hint-banner.tsx
│   │       ├── category-section.tsx
│   │       └── service-row.tsx
│   └── admin/                   # Admin panel components (functional, not styled to design system yet)
├── features/
│   ├── auth/                    # Auth logic
│   ├── settings/queries.ts      # cache()-wrapped getSettings
│   ├── booking/
│   │   ├── slots.ts             # Slot finding algorithm
│   │   ├── public-actions.ts    # createBooking Server Action
│   │   ├── admin-actions.ts     # adminCreateBooking
│   │   ├── manage-actions.ts    # cancelBooking, etc.
│   │   ├── next-slot.ts         # unstable_cache(getNextAvailableSlot) for hero
│   │   └── types.ts
│   ├── availability/logic.ts    # getStaffAvailability
│   └── landing/queries.ts       # getCategoriesWithMinPrice, getCategoriesWithServices
├── content/                     # Zod-validated JSON content
│   ├── site.json                # salonName, tagline, socials
│   └── landing.json             # hero, stats, brands, reviews (PLACEHOLDER: prefix), certs, categoryDescriptions
├── lib/
│   ├── cn.ts                    # clsx + twMerge
│   ├── content.ts               # Zod-validated landing/site loaders
│   ├── date.ts                  # SALON_TIMEZONE=Europe/Warsaw, formatRelativeSlot, etc.
│   ├── dto.ts                   # PublicSalonInfo + toPublicSalonInfo (server/client boundary)
│   ├── money.ts                 # formatMoney (grosze -> "120 zł")
│   ├── prisma.ts                # Prisma client singleton
│   └── validation.ts            # plPhoneSchema, common Zod validators
└── generated/prisma/client/     # Prisma generated client (gitignored)
```

---

## Design system

### Color tokens (in globals.css @theme)

```
--color-rose-50:  #FBF3F6   (background tints)
--color-rose-100: #EFD7DD
--color-rose-200: #E2BCC5
--color-rose-300: #D4A0AC
--color-rose-400: #C68895
--color-rose-500: #B47B85   (accent: eyebrows, italic highlights, focus rings, NOT button bg)
--color-rose-600: #9A6671   (PRIMARY BUTTON BG - 4.6:1 contrast with white, passes WCAG AA)
--color-rose-700: #7A5158   (primary button hover)
--color-rose-900: #4A3338

--color-graphite-50:  #F4F1EE  (warm gray family)
--color-graphite-100: #E6E1DC
--color-graphite-200: #C9C2BC
--color-graphite-400: #8C857F
--color-graphite-600: #5A5350
--color-graphite-900: #2E2A2A  (body text)

--color-cream:        #FAF7F4  (page background)
--color-warm:         #F5EFEA  (section bg variant)
--color-border-soft:  #ECE3DC  (default border)
--color-border-default: #DCD0C8

--color-success: #6F8C6E
--color-error:   #B25C5C
--color-warning: #C49464
(+ -bg variants for each: success-bg, error-bg, warning-bg)
```

### Typography

- **`--font-serif`**: Fraunces (next/font), used for headings with italic accents for emphasis
- **`--font-sans`**: Inter (next/font), used for body text and UI

Font feature settings: `"ss01", "cv11"` for Inter (alternate forms - more refined).

### Easing curves

Emil Kowalski's curves (in `@theme`):

```
--ease-out:      cubic-bezier(0.23, 1, 0.32, 1)        (most UI transitions)
--ease-in-out:   cubic-bezier(0.77, 0, 0.175, 1)       (symmetric)
--ease-drawer:   cubic-bezier(0.32, 0.72, 0, 1)        (panels/sheets)
```

### Custom variants

`hover-supported` - applies `:hover` only on devices that support real hover (mouse/trackpad). Defined in globals.css:

```css
@custom-variant hover-supported (@media (hover: hover) and (pointer: fine))
```

Used like: `hover-supported:hover:bg-rose-700`. This prevents the "stuck hover" feel on touch devices.

### Custom utilities

- `hero-bloom` - radial gradient rose-50 for hero background
- `cta-bloom` - linear gradient rose-50 → cream for CTA section
- `scrollbar-none` - hides scrollbar (cross-browser)

### Container sizes

```tsx
default: max-w-[1440px]  // Landing, services, most pages
narrow:  max-w-[880px]   // Forms, narrower content
prose:   max-w-[640px]   // Long-form text
```

---

## Schema gotchas (Prisma)

These bit us in development. Verify field names before writing queries.

### Service model
- Field is **`defaultDurationMin`** (NOT `durationMinutes` or `duration`)
- Field is **`defaultPriceGr`** (in grosze - PLN cents)
- **No `order` field on Service** - sort by `name` alphabetically. (Category HAS order, Service does NOT.)
- Has `active: Boolean`, `description: String?`, `slug` (on category, not on service)

### BookingItem model
- Has `durationMin` (resolved value from slot algorithm, may differ from service default due to StaffService override)
- Has `bufferAfterMin`, `priceGr`, `order` (position in booking)

### StaffService model
- Has `durationOverrideMin: Int?` - per-staff override of service default duration
- Has `priceOverrideGr: Int?` - same for price

### Settings model (single row, id="settings")
- `salonName`, `salonPhone`, `salonEmail`, `salonAddress`
- `minBookingHoursAhead: Int` (default 4)
- `maxBookingDaysAhead: Int` (default 60)
- `salonOpenMin: Int`, `salonCloseMin: Int` (single value, not per-day)
- Hours per day of week need a separate `BusinessHours` model (not implemented yet - hardcoded in footer)

---

## Architecture decisions

### Component strategy
**All custom primitives, no shadcn, no Radix.** When something gnarly comes up (Dialog with focus trap, complex Popover), the user reserved the right to bring in `@radix-ui/react-dialog` selectively. Until then, write it custom.

The button system uses a `buttonStyles()` function that's exported separately from the `Button` component, so `<Link>` can use button styling without an `asChild` slot pattern:

```tsx
<Link href="/x" className={buttonStyles({size: "lg"})}>Click</Link>
```

### Forms
**Native React 19 patterns only.** No `react-hook-form`.
- Server-side Zod is source of truth for validation
- Server Actions for mutations
- `useActionState` for single forms
- Zustand + Server Action for multi-step wizard

### Content management
**JSON in repo with Zod validation.** Files in `/content/*.json` are loaded by `/lib/content.ts` and validated at module load time. Build fails on malformed JSON.

Reviews use a `PLACEHOLDER:` prefix that gets stripped at render time (`.replace(/^PLACEHOLDER:\s*/, "")`). This keeps them grep-able for "needs real content from client" before launch.

Future migration target: KeyStatic or Sanity once the client wants to edit. For now JSON-in-repo is fine.

### Data flow boundaries
- **Server Components** by default. Client only when interaction, useEffect, or store is needed.
- **DTO at server/client boundary** - never pass full Prisma types to client components. Use `Pick<Settings, ...>` patterns and `toPublicSalonInfo()`-style helpers in `/lib/dto.ts`.
- `cache()` from React for request-level memoization (e.g. `getSettings`, `getCategoriesWithServices`)
- `unstable_cache` with tags for cross-request memoization (e.g. `getNextAvailableSlot` with `tags: ["bookings"]`)

### Cache invalidation
After any booking-state mutation, invalidate the `"bookings"` tag:

```tsx
import {revalidateTag} from "next/cache"

// At the end of successful transaction, before return:
revalidateTag("bookings", "max")
```

**Critical**: Next.js 16 requires a SECOND argument (cacheLife profile). Use `"max"` for stale-while-revalidate semantics. Single-argument form `revalidateTag("bookings")` is deprecated and produces TS error.

Places needing this:
- `src/features/booking/public-actions.ts` → `createBooking`
- `src/features/booking/admin-actions.ts` → `adminCreateBooking`
- `src/features/booking/manage-actions.ts` → `cancelBooking`

### Streaming
Use `<Suspense>` for slow queries (e.g. next-slot in hero) so the rest of the page doesn't wait. Not currently implemented but plan exists for performance optimization phase.

---

## Component patterns

### Button (`src/components/ui/button.tsx`)
```tsx
// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg

// Primary: bg-rose-600 + white text = 4.6:1 contrast (WCAG AA)
// Hover: bg-rose-700 (gated with hover-supported)
// Active: scale-[0.97] (only movement on the button)
// NO hover lift (user explicitly rejected hover translation - looks weird)
// NO transition-all - specific properties only

// buttonStyles() function exported for use on <Link> elements:
<Link className={buttonStyles({size: "lg"})}>...</Link>
```

### Reveal (`src/components/ui/reveal.tsx`)
- Client component using `motion.div` with `whileInView`
- Default: 500ms ease-out with optional `delay` prop
- `MotionProvider` at layout level sets `reducedMotion="user"`, so opacity-only animations still play but transforms are stripped when user prefers reduced motion (WCAG-correct)
- Don't use `useReducedMotion` hook manually inside Reveal - MotionConfig handles it

### Mobile menu (in `header.tsx`)
**Disclosure pattern, NOT Dialog.** Reasoning: only 4 links, doesn't need full-screen takeover or focus trap. Just `aria-expanded` + `aria-controls`.
- `AnimatePresence` with asymmetric timing: enter 220ms, exit 150ms (snappier exit feels right)
- Esc closes + returns focus to trigger
- `pointerdown` outside closes
- Auto-close on route change via `usePathname()` effect
- No scroll lock, no `role="dialog"`

### Category nav (in `/uslugi`)
- Sticky `top-[60px]` (under sticky header)
- Pills with active state via `IntersectionObserver` (rootMargin `-30% 0px -65% 0px`)
- Active pill auto-scrolls into view on mobile (horizontal scroll)
- Categories have `scroll-mt-28` (112px) to compensate for sticky header + nav offset

---

## Animation philosophy

Hard-won rules from Emil Kowalski's animation framework, applied throughout:

1. **Never `transition-all`** - always specify properties: `transition-[border-color,box-shadow]`, `transition-[color,opacity]`, etc.
2. **UI animations under 300ms.** Most are 150-220ms.
3. **Asymmetric enter/exit** - enter slightly slower (more presence), exit snappier (faster dismissal). E.g. mobile menu enter 220ms, exit 150ms.
4. **`:active scale(0.97)`** for button press feedback - the only movement on buttons.
5. **No hover lift on buttons** (user explicitly rejected this).
6. **Hover gating** via `hover-supported:` variant to avoid stuck-hover on touch.
7. **Stagger 60-80ms between items** in grids/lists (not 100ms+, feels slow).
8. **`prefers-reduced-motion`** respected globally via MotionConfig in MotionProvider.
9. **`will-change` sparingly** - only on elements actively animating, removed after.

For decorative elements (butterfly, blooms): static SVG, no animations. Reserve motion for interaction feedback and scroll reveals.

---

## Accessibility standards

- **Semantic HTML > ARIA.** Use `<nav>`, `<button>`, `<article>`, etc. ARIA only when no semantic option exists.
- **WCAG AA minimum** for contrast (4.5:1 for normal text, 3:1 for large text 18pt+).
- **`prefers-reduced-motion`** always respected.
- **Focus visible** styling on all interactive elements (browsers' default focus ring is too weak - we use a custom one).
- **`aria-label`** on icon-only buttons (mobile menu trigger, social links, etc.)
- **`aria-expanded` + `aria-controls`** on disclosure triggers.
- **`<Heading level>` polymorphic component** ensures correct heading hierarchy. Hero uses `level="h1"`, sections use `level="h2"`, etc. Only ONE `h1` per page.
- **Anchor links** for `#kategoria` use `scroll-margin-top` on targets to compensate for sticky elements.
- **Form fields** always have associated `<label>` (via `htmlFor`/`id`), aria-describedby for hints, aria-invalid + aria-errormessage for errors. The `Field` and `Textarea` primitives handle this.

---

## Current project state

### Backend (Phases 0-8) - DONE
- Prisma schema (Service, Category, Staff, Customer, Booking, BookingItem, Settings, StaffService)
- Slot finding algorithm (`findSlotsForServices`) with buffer support
- Server Actions for: booking creation (public + admin), cancellation, staff management, service CRUD, category CRUD, customer CRUD, settings CRUD
- Auth.js v5 setup (admin login at /admin/login)
- FullCalendar admin view with bookings, drag-to-reschedule, click-to-edit
- Booking wizard logic (6 steps with Zustand store)
- Customer self-service (cancel via token-based link)

### UI Phases (in progress)

**Phase 0 (Foundation) - DONE**
- globals.css with all design tokens, custom variant hover-supported
- Layouts (root + public)
- Primitives: Button, Container, Eyebrow, Field, Textarea, Heading, Reveal
- Content loaders with Zod validation
- cn utility, MotionProvider, error.tsx, loading.tsx

**Phase 1 (Header + Footer) - DONE**
- PublicHeader (sticky, backdrop-blur, scroll-aware border, disclosure mobile menu)
- PublicFooter (dark graphite-900, DB salon info via DTO, inline FB/IG SVGs)
- DTO pattern established

**Phase 2 (Landing /) - DONE**
- 6 sections: Hero (with floating cards + next-slot pulse indicator), Categories (DB-driven), TrustBand (brands + stats), Reviews (placeholder data), Certs, FinalCta
- All with Reveal animations, hover-supported gating

**Phase 3 (Services /uslugi) - IN PROGRESS**
- ServicesHero, CategoryNav (sticky pills with scroll-spy), HintBanner, CategorySection, ServiceRow components
- Service row links to `/rezerwacja?service=${id}` for future deep-link pre-select
- Mockup design followed (after initial deviation that was corrected)

**Phase 4 (Booking wizard /rezerwacja) - PENDING**
- 6-step wizard, currently functional but ugly (default Tailwind styles)
- Need to redesign matching design system
- Also need to wire up `?service=${id}` URL param → auto-select in step 1

**Phase 5 (Confirmation /sukces + Customer self-service /moja-wizyta) - PENDING**

**Phase 6 (Admin polish) - OPTIONAL, LOW PRIORITY**
- Admin works but uses default Tailwind. Daughter sister uses it daily so worth polishing eventually but not before launch.

**Phase 9 (Notifications) - PLANNED**
- SMS via SerwerSMS or similar PL provider
- Email reminders (24h before appointment)
- Vercel cron at `/api/cron/reminders/route.ts` (stub exists)

### Pre-launch checklist (not phases, but TODOs)
- Replace `PLACEHOLDER:` reviews in landing.json with real ones from client
- Verify stats (12+ lat, 1500+, 4.9/5) with client
- Add /regulamin and /polityka-prywatnosci pages (required for PL small business)
- Consider BusinessHours model for editable hours (currently hardcoded in footer)
- Add sitemap.ts, robots.ts, JSON-LD LocalBusiness schema
- Replace zinc default styling in admin if time allows
- Add OG image for social sharing
- Verify Vercel cron is configured for reminders endpoint

---

## Mockup files (design reference)

The user has HTML mockups in `/mnt/user-data/uploads/` (uploaded files in this Claude.ai conversation, may not be in your context):

- `marzenie-design-system.html` - Design system reference (colors, typography, spacing, components)
- `marzenie-landing-mockup.html` - Landing page
- `marzenie-uslugi-mockup.html` - Services page (with sticky cat-nav, hint banner, service rows)
- `marzenie-wizard-mockup.html` - Booking wizard
- `marzenie-wizard-edge-cases.html` - Wizard edge cases
- `marzenie-sukces-mockup.html` - Booking success page
- `marzenie-moja-wizyta-mockup.html` - Customer self-service page
- `marzenie-moja-wizyta-states.html` - Self-service page states (confirmed/cancelled/etc)
- `marzenie-toast-component.html` - Toast notification reference

When implementing a page, **always read the matching mockup first**. The mockups contain specific UX patterns (e.g. scroll-spy in cat-nav, padding-shift hover on service rows) that should be preserved.

The user prefers screenshots/mockup references over verbal descriptions when implementing UI.

---

## Working with Snappify (the developer)

- **Language**: Polish in conversation, but code/comments/this file in English (more universally readable for AI tooling).
- **Communication style**: Direct, no fluff. Short focused responses preferred.
- **Decision-making**: Often wants to weigh options before committing. Present 2-3 approaches with trade-offs, recommend one, let them decide.
- **Iteration**: Wants to see results, give feedback, iterate. Don't ship 10 things at once - ship 1-2, get feedback, continue.
- **Push-back**: When user pushes back on a decision (e.g. "no hover lift on buttons looks weird"), accept it immediately and adjust. Don't argue or re-justify.
- **Honesty over confidence**: If unsure (e.g. about a Prisma field name), say so. The user prefers "I'm guessing X, tell me if it's actually Y" over confident wrong answers.
- **Scope creep**: Stay focused on the current phase. Mention adjacent improvements but don't expand scope without permission.
- **Bug discovery**: When user reports a bug, fix it without lengthy explanation of how it happened. Brief root cause is fine, then move to fix.

---

## Anti-patterns to avoid

These are project-specific (not universal). Snappify has called these out:

- "Generic AI aesthetics": purple-to-pink gradient blobs, glassmorphism without reason, modern sans-serif on everything, abstract Midjourney shapes
- Stock photos with models in face masks (everyone in PL beauty industry uses these, looks bad)
- Overuse of powder pink (turns into "pink mess" if everywhere - use rose-50 as accent only, white/cream as base)
- "Welcome to salon XYZ" hero (cringe)
- "WHY US?" three-column-with-icons section at the top (template-y)
- Newsletter signup at page top (nobody signs up, just annoying)
- Carousels, especially autoplay
- Fake urgency countdowns ("offer ends in 2:34:11")
- Sticky CTA bar at bottom on mobile (clutters small screens, better CTAs in hero + sections)
- Dark mode (target users don't expect it, complicates the pink palette)

---

## Quick reference: common commands

```powershell
# Dev server
npm run dev

# Build check (before commit)
npm run build

# Prisma
npx prisma studio
npx prisma migrate dev
npx prisma generate

# Database (Neon, password in .env DATABASE_URL)
# Connection: pooled for app, direct for migrations

# Lint / typecheck
npm run lint
npx tsc --noEmit
```

User uses **PowerShell on Windows** with **WebStorm** as the IDE.

---

## Final notes

This file is the canonical context. When in doubt about conventions, structure, or decisions - this file overrides assumptions from training data.

When you make new architectural decisions during a session, ask the user if they should be added to this file for future sessions. The user can paste them into the appropriate section.

The project is a real client deliverable, not a toy. Quality, performance, accessibility, and Polish-specific UX considerations matter.
