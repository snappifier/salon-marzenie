# Admin Shell primitives

Fundament UI dla panelu administracyjnego Salonu Marzenie. Komponenty zaprojektowane spójnie z publiczną stroną (rose + graphite + Fraunces serif, warm tones, Emil Kowalski playbook animacji).

Wszystkie komponenty respektują:

- `prefers-reduced-motion` (globalnie przez `MotionProvider` + media query w `globals.css`)
- `hover-supported:hover:` zamiast `hover:` (no stuck-hover na touch devices)
- Touch targets ≥44px
- Polish labels everywhere
- Tabs do indentacji, brak średników, komentarz ze ścieżką pliku jako pierwsza linia

---

## AdminTopBar

Sticky top navigation. Desktop pokazuje 5 sekcji + przycisk Nowa + UserMenu. Mobile pokazuje hamburger + logo + icon-only Nowa + avatar (otwierany przez MobileSlideOver).

```tsx
import {AdminTopBar} from "@/components/admin-shell/admin-top-bar"

<AdminTopBar userName="Sylwia Kowalska" />
// userInitials auto-derived z userName ("SK") jeśli nie podane
```

Active sekcja: rose-600 text + animated underline pod (motion `layoutId="admin-nav-underline"`).

---

## MobileSlideOver

Slide-over panel z lewej dla mobile. Używany przez AdminTopBar - rzadko renderowany bezpośrednio.

```tsx
import {MobileSlideOver} from "@/components/admin-shell/mobile-slide-over"

<MobileSlideOver
	open={open}
	onClose={() => setOpen(false)}
	userName="Sylwia Kowalska"
	userInitials="SK"
	links={[
		{href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />},
		// ...
	]}
/>
```

Slide-in 240ms ease-out-quint, exit 200ms ease-in-cubic, focus trap, Esc + backdrop close, auto-close on route change.

---

## UserMenu

Dropdown z avatar + chevron, używany w AdminTopBar (desktop). Mobile używa MobileSlideOver.

```tsx
import {UserMenu} from "@/components/admin-shell/user-menu"

<UserMenu userName="Sylwia Kowalska" userInitials="SK" />
```

Click outside + Esc close, animacja scale `0.95→1` z origin top-right, 200ms ease-out-quint.

---

# UI primitives

## Modal

Bazowy modal - portal, focus trap, Esc close, slide-up enter / slide-down exit.

```tsx
import {Modal} from "@/components/ui/modal"

const [open, setOpen] = useState(false)

<Modal
	open={open}
	onClose={() => setOpen(false)}
	title="Edytuj klientkę"
	size="md"  // sm | md | lg
	footer={
		<div className="flex justify-end gap-2">
			<Button variant="secondary" onClick={() => setOpen(false)}>Anuluj</Button>
			<Button>Zapisz zmiany</Button>
		</div>
	}
>
	<p className="text-sm text-graphite-700">Treść modalu.</p>
</Modal>
```

Opcje: `closeOnBackdrop`, `closeOnEscape` (oba domyślnie `true`).

Auto-focus: pierwsze focusable, lub element z `data-autofocus`.

---

## ConfirmDialog

Zamiennik `window.confirm()` dla destructive akcji.

```tsx
import {ConfirmDialog} from "@/components/ui/confirm-dialog"

<ConfirmDialog
	open={open}
	onClose={() => setOpen(false)}
	onConfirm={async () => {
		await deleteCustomer(id)
		setOpen(false)
	}}
	title="Usunąć klientkę Annę Kowalską?"
	description="Tej operacji nie można cofnąć. Wszystkie wizyty pozostaną w historii."
	confirmLabel="Usuń"
	cancelLabel="Anuluj"
	variant="danger"  // danger | warning
/>
```

W trakcie `onConfirm` (async) buttony są disabled, na confirm pokazuje się spinner. Backdrop/Esc zablokowane gdy busy.

---

## Toast + useToast

Toast notifications, dostępne wszędzie pod `ToastProvider` (zarejestrowany w `app/admin/layout.tsx`).

```tsx
import {useToast} from "@/components/ui/toast"

function MyButton() {
	const toast = useToast()
	return (
		<Button
			onClick={async () => {
				try {
					await saveSettings()
					toast.success("Zapisano zmiany")
				} catch {
					toast.error("Nie udało się zapisać")
				}
			}}
		>
			Zapisz
		</Button>
	)
}
```

API:

- `toast.success(message, options?)` - zielony border + Check icon
- `toast.error(message, options?)` - czerwony border + X icon (`role="alert"`)
- `toast.info(message, options?)` - rose border + Info icon
- `toast.warning(message, options?)` - amber border + AlertTriangle icon
- `toast.dismiss(id)` - manualny dismiss; każda metoda zwraca `id`
- Opcje: `{duration: 6000}` (ms; `0` = nie auto-dismiss)

Pozycja: bottom-right desktop, top-center mobile.

---

## TabStrip

Animated underline tabs używane w detail pages i Settings.

```tsx
import {TabStrip} from "@/components/ui/tab-strip"

const [tab, setTab] = useState("dane")

<TabStrip
	aria-label="Sekcje klientki"
	tabs={[
		{id: "dane", label: "Dane"},
		{id: "historia", label: "Historia", badge: 12},
		{id: "preferencje", label: "Preferencje"},
	]}
	active={tab}
	onChange={setTab}
	layoutId="customer-tabs"  // unique gdy wiele TabStripów na stronie
/>
```

Active: rose-600 text + animated underline (motion `layoutId`). Badge: liczba w pillu (active rose-100, inactive graphite-100).

Mobile: scroll horizontalny gdy taby nie mieszczą się.

---

## EmptyState

Pokazywany gdy lista pusta lub brak danych.

```tsx
import {EmptyState} from "@/components/ui/empty-state"
import {Users} from "lucide-react"

<EmptyState
	icon={<Users size={24} />}
	title="Brak klientek"
	description="Dodaj pierwszą klientkę aby zacząć budować bazę kontaktów."
	action={{label: "Dodaj klientkę", href: "/admin/klienci/nowy"}}
/>
```

CTA opcjonalna - `href` dla `<Link>`, `onClick` dla `<button>`.

---

## AdminTable + MobileCard

Generic, type-safe tabela z mobile cards fallback.

```tsx
import {AdminTable, type Column} from "@/components/ui/admin-table"
import {StatusBadge} from "@/components/ui/status-badge"

interface Customer {
	id: string
	name: string
	phone: string
	visits: number
	status: "active" | "inactive"
}

const columns: Column<Customer>[] = [
	{id: "name", header: "Imię i nazwisko", cell: (c) => c.name},
	{id: "phone", header: "Telefon", cell: (c) => c.phone, mobileHidden: true},
	{id: "visits", header: "Wizyty", cell: (c) => c.visits, align: "right"},
	{id: "status", header: "Status", cell: (c) => <StatusBadge variant={c.status} />},
]

<AdminTable
	data={customers}
	columns={columns}
	rowKey={(c) => c.id}
	onRowClick={(c) => router.push(`/admin/klienci/${c.id}`)}
	emptyState={
		<EmptyState
			icon={<Users size={24} />}
			title="Brak klientek"
			description="..."
		/>
	}
/>
```

Desktop: tabela bg-white border rounded-2xl, sticky thead bg-warm, klikalne wiersze z hover bg-rose-50/30.

Mobile (<768px): stack of `MobileCard` z `<dl>` (header → value). Można podać `mobileCardRender` żeby override defaultowy układ.

`MobileCard` może być importowany osobno dla case'ów gdy tabela nie pasuje.

---

## StatusBadge

Pill z dot indicator dla statusów rezerwacji i innych.

```tsx
import {StatusBadge} from "@/components/ui/status-badge"

<StatusBadge variant="confirmed" />              // "Potwierdzona"
<StatusBadge variant="pending" />                // "Oczekuje"
<StatusBadge variant="cancelled">Odwołana</StatusBadge>  // custom label
```

Warianty: `confirmed`, `pending`, `cancelled`, `completed`, `no_show`, `active`, `inactive`.

Dot + uppercase tracking-wide tekst, rounded-full. Default labele w języku polskim.

---

# Kolejność implementacji (Phase 1)

Wszystkie powyższe primitives są fundamentem dla:

- **Phase 2**: Dashboard, Klienci list/detail, Zespół list/detail
- **Phase 3**: Custom Calendar (oddzielny chunk)
- **Phase 4**: Oferta (sub-tabs Usługi/Kategorie), CRUDy
- **Phase 5**: Settings, restore confirm flow
- **Phase 6**: Booking detail modal w kalendarzu

Po dodaniu zmian w tym katalogu wykonaj `graphify update .` żeby zaktualizować graph projektu.
