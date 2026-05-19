// src/app/(public)/regulamin/page.tsx
//
// TODO przed launchem: uzupełnić w tekście poniżej:
//   - [Imię i nazwisko właściciela]
//   - [NIP]
//   - [REGON]
// Regulamin jest dokumentem prawnie wiążącym — zaleca się review przez prawnika
// przed publikacją (zwłaszcza punkty dot. odpowiedzialności i reklamacji).

import Link from "next/link"
import {ArrowLeft} from "lucide-react"
import {getSettings} from "@/features/settings/queries"
import {MIN_CONFIRM_HOURS_BEFORE} from "@/features/booking/manage-logic"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"

export const metadata = {
	title: "Regulamin",
	description: "Regulamin korzystania z systemu rezerwacji online.",
}

const LAST_UPDATED = "19 maja 2026"

export default async function TermsPage() {
	const settings = await getSettings()
	const salonName = settings.salonName
	const salonAddress = settings.salonAddress
	const salonEmail = settings.salonEmail
	const salonPhone = settings.salonPhone
	const minCancelHours = settings.minCancelHoursBefore
	const minConfirmDays = Math.round(MIN_CONFIRM_HOURS_BEFORE / 24)

	return (
		<Container size="prose" className="py-12 md:py-16">
			<Eyebrow className="mb-3">Dokumenty</Eyebrow>
			<Heading level="h1" className="mb-6">
				Regulamin
			</Heading>
			<p className="text-sm text-graphite-600 mb-10">Ostatnia aktualizacja: {LAST_UPDATED}</p>

			<div className="space-y-10 text-graphite-700 leading-relaxed">
				<Section title="1. Postanowienia ogólne">
					<P>
						Niniejszy regulamin określa zasady korzystania z systemu rezerwacji online prowadzonego
						przez <Strong>[Imię i nazwisko właściciela]</Strong> w ramach działalności gospodarczej
						pod nazwą <Strong>{salonName}</Strong>
						{salonAddress && (
							<>
								{" "}z siedzibą pod adresem <Strong>{salonAddress}</Strong>
							</>
						)}
						, NIP <Strong>[NIP]</Strong>, REGON <Strong>[REGON]</Strong>
						{" "}(dalej: &bdquo;Salon&rdquo;).
					</P>
					<P>
						Kontakt z Salonem możliwy jest{" "}
						{salonPhone && (
							<>
								telefonicznie pod numerem <A href={`tel:${salonPhone}`}>{salonPhone}</A>
								{salonEmail && ", "}
							</>
						)}
						{salonEmail && (
							<>
								e-mailowo pod adresem <A href={`mailto:${salonEmail}`}>{salonEmail}</A>
							</>
						)}
						.
					</P>
				</Section>

				<Section title="2. Definicje">
					<UL>
						<LI>
							<Strong>Klient</Strong> &ndash; osoba fizyczna korzystająca z systemu rezerwacji
							w celu umówienia wizyty w Salonie.
						</LI>
						<LI>
							<Strong>System</Strong> &ndash; serwis internetowy umożliwiający rezerwację wizyt
							online, prowadzony przez Salon.
						</LI>
						<LI>
							<Strong>Wizyta</Strong> &ndash; usługa kosmetyczna świadczona przez Salon
							w zarezerwowanym terminie.
						</LI>
						<LI>
							<Strong>Rezerwacja</Strong> &ndash; potwierdzony przez System termin Wizyty wraz
							z wyborem usług i pracownika.
						</LI>
						<LI>
							<Strong>Konto</Strong> &ndash; opcjonalny indywidualny profil Klienta w Systemie
							ułatwiający dostęp do historii Rezerwacji.
						</LI>
					</UL>
				</Section>

				<Section title="3. Wymagania techniczne">
					<P>
						Do korzystania z Systemu wystarczy urządzenie z dostępem do internetu i aktualną
						przeglądarką internetową (Chrome, Safari, Firefox, Edge w wersji aktualnej lub
						bezpośrednio poprzedzającej) z włączoną obsługą plików cookie.
					</P>
				</Section>

				<Section title="4. Konto Klienta">
					<P>
						Założenie Konta jest dobrowolne. Klient może dokonywać Rezerwacji również bez zakładania
						Konta, podając tylko dane niezbędne do realizacji wizyty (imię, nazwisko, numer telefonu).
					</P>
					<P>
						Klient zobowiązuje się podawać prawdziwe i aktualne dane oraz nie udostępniać swojego
						hasła osobom trzecim. Klient może w każdej chwili usunąć Konto, kontaktując się{" "}
						{salonEmail ? (
							<>
								z Salonem pod adresem <A href={`mailto:${salonEmail}`}>{salonEmail}</A>
							</>
						) : (
							"z Salonem"
						)}
						.
					</P>
				</Section>

				<Section title="5. Rezerwacja Wizyty">
					<P>
						Rezerwacja odbywa się w kilku krokach: wybór usług, wybór pracownika (opcjonalnie),
						wybór terminu, podanie danych kontaktowych oraz potwierdzenie podsumowania.
						Po pomyślnym złożeniu Rezerwacji Klient otrzymuje link do strony zarządzania wizytą.
					</P>
					<P>
						Rezerwacja po jej złożeniu posiada status <Strong>oczekuje potwierdzenia</Strong>.
						Klient może potwierdzić wizytę online za pośrednictwem linku do strony zarządzania
						wizytą, najpóźniej na <Strong>{minConfirmDays} dni</Strong> przed jej rozpoczęciem.
						Po potwierdzeniu wizyta zyskuje status <Strong>potwierdzona</Strong>.
					</P>
					<P>
						Jeżeli okno potwierdzenia online minęło, a Klient nadal chce zrealizować wizytę, prosimy
						o kontakt z Salonem &mdash; Wizyta zostanie potwierdzona przez pracownika.
					</P>
				</Section>

				<Section title="6. Zmiana i anulowanie Rezerwacji">
					<UL>
						<LI>
							Klient może <Strong>anulować</Strong> Rezerwację samodzielnie poprzez stronę zarządzania
							wizytą najpóźniej na <Strong>{minCancelHours} godzin</Strong> przed jej rozpoczęciem.
						</LI>
						<LI>
							Po potwierdzeniu Wizyty przez Klienta dalsze anulowanie online nie jest możliwe &mdash;
							w razie konieczności rezygnacji prosimy o kontakt telefoniczny z Salonem.
						</LI>
						<LI>
							Po upływie terminu anulowania online rezygnacja jest możliwa wyłącznie po kontakcie
							z Salonem.
						</LI>
						<LI>
							Zmiana terminu Rezerwacji wymaga jej anulowania (zgodnie z powyższymi zasadami) i
							złożenia nowej Rezerwacji lub bezpośredniego kontaktu z Salonem.
						</LI>
						<LI>
							Salon zastrzega sobie prawo do odwołania lub zmiany terminu Wizyty w wyjątkowych
							okolicznościach (np. choroba pracownika, siła wyższa). W takim przypadku Salon
							niezwłocznie skontaktuje się z Klientem w celu ustalenia nowego terminu.
						</LI>
					</UL>
				</Section>

				<Section title="7. Realizacja Wizyty">
					<P>
						Prosimy o przybycie na Wizytę punktualnie. W przypadku spóźnienia Salon zastrzega sobie
						prawo skrócenia czasu Wizyty (z zachowaniem pełnej ceny) lub jej odwołania, jeżeli
						spóźnienie uniemożliwi prawidłowe wykonanie usługi.
					</P>
					<P>
						Klient zobowiązany jest poinformować Salon przed Wizytą o ewentualnych przeciwwskazaniach
						do wykonania zabiegu (alergie, ciąża, schorzenia skóry itp.). Salon nie ponosi
						odpowiedzialności za skutki wynikające z zatajenia takich informacji.
					</P>
				</Section>

				<Section title="8. Płatność">
					<P>
						Płatność za Wizytę dokonywana jest na miejscu, bezpośrednio po wykonaniu usługi. System
						nie pobiera żadnych opłat ani zaliczek za pośrednictwem strony internetowej.
					</P>
					<P>
						Ceny widoczne w Systemie są cenami brutto wyrażonymi w polskich złotych.
					</P>
				</Section>

				<Section title="9. Reklamacje">
					<P>
						Reklamacje dotyczące wykonanej Wizyty lub działania Systemu prosimy zgłaszać{" "}
						{salonEmail ? (
							<>
								pod adresem <A href={`mailto:${salonEmail}`}>{salonEmail}</A>
							</>
						) : (
							"poprzez kontakt z Salonem"
						)}
						{salonPhone && (
							<>
								{" "}lub telefonicznie pod numerem <A href={`tel:${salonPhone}`}>{salonPhone}</A>
							</>
						)}
						.
					</P>
					<P>
						Reklamacja powinna zawierać dane Klienta, opis sprawy oraz oczekiwany sposób
						rozpatrzenia. Salon rozpatrzy reklamację w terminie 14 dni od jej otrzymania i
						poinformuje Klienta o sposobie jej rozpatrzenia drogą, którą wpłynęła.
					</P>
				</Section>

				<Section title="10. Ochrona danych osobowych">
					<P>
						Zasady przetwarzania danych osobowych Klientów określa{" "}
						<Link
							href="/polityka-prywatnosci"
							className="text-rose-700 underline-offset-2 hover-supported:hover:underline"
						>
							Polityka prywatności
						</Link>
						.
					</P>
				</Section>

				<Section title="11. Postanowienia końcowe">
					<UL>
						<LI>
							W sprawach nieuregulowanych niniejszym regulaminem mają zastosowanie powszechnie
							obowiązujące przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy
							o prawach konsumenta.
						</LI>
						<LI>
							Salon zastrzega sobie prawo do zmiany regulaminu z ważnych przyczyn (zmiana
							przepisów, zmiana zakresu usług). O zmianach Klienci posiadający Konto zostaną
							poinformowani z odpowiednim wyprzedzeniem.
						</LI>
						<LI>
							Aktualna wersja regulaminu obowiązuje od dnia jej publikacji na tej stronie.
						</LI>
					</UL>
				</Section>
			</div>

			<div className="mt-14 pt-8 border-t border-border-soft">
				<Link className={buttonStyles({size: "md", variant: "secondary"})} href="/">
					<ArrowLeft size={16} />
					Strona główna
				</Link>
			</div>
		</Container>
	)
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<section>
			<Heading level="h3" as="h2" className="mb-4">
				{title}
			</Heading>
			<div className="space-y-3 text-[15px]">{children}</div>
		</section>
	)
}

function P({children}: {children: React.ReactNode}) {
	return <p className="leading-relaxed">{children}</p>
}

function UL({children}: {children: React.ReactNode}) {
	return <ul className="list-disc pl-5 space-y-2 marker:text-rose-400">{children}</ul>
}

function LI({children}: {children: React.ReactNode}) {
	return <li className="leading-relaxed">{children}</li>
}

function Strong({children}: {children: React.ReactNode}) {
	return <strong className="font-medium text-graphite-900">{children}</strong>
}

function A({href, children}: {href: string; children: React.ReactNode}) {
	return (
		<a
			href={href}
			className="text-rose-700 underline-offset-2 hover-supported:hover:underline"
		>
			{children}
		</a>
	)
}
