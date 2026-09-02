// src/app/(public)/polityka-prywatnosci/page.tsx
//
// TODO przed launchem: uzupełnić w tekście poniżej:
//   - [Imię i nazwisko właściciela]
//   - [NIP]
//   - [REGON]
//   - [Adres do korespondencji w sprawach RODO] (jeśli inny niż adres salonu)
// Treść została przygotowana zgodnie z minimalnymi wymaganiami RODO (PL).
// Zaleca się przegląd przez prawnika przed publikacją.

import Link from "next/link"
import {ArrowLeft} from "lucide-react"
import {getSettings} from "@/features/settings/queries"
import {buttonStyles} from "@/components/ui/button"
import {Container} from "@/components/ui/container"
import {Eyebrow} from "@/components/ui/eyebrow"
import {Heading} from "@/components/ui/heading"

export const metadata = {
	title: "Polityka prywatności",
	description: "Informacje o przetwarzaniu danych osobowych — RODO.",
}

const LAST_UPDATED = "19 maja 2026"

export default async function PrivacyPolicyPage() {
	const settings = await getSettings()
	const salonName = settings.salonName
	const salonAddress = settings.salonAddress
	const salonEmail = settings.salonEmail
	const salonPhone = settings.salonPhone

	return (
		<Container size="prose" className="py-12 md:py-16">
			<Eyebrow className="mb-3">Dokumenty</Eyebrow>
			<Heading level="h1" className="mb-6">
				Polityka prywatności
			</Heading>
			<p className="text-sm text-secondary mb-10">Ostatnia aktualizacja: {LAST_UPDATED}</p>

			<div className="space-y-10 text-primary leading-relaxed">
				<Section title="1. Administrator danych osobowych">
					<P>
						Administratorem Twoich danych osobowych jest <Strong>[Imię i nazwisko właściciela]</Strong>{" "}
						prowadząc{"a"} działalność gospodarczą pod nazwą <Strong>{salonName}</Strong>
						{salonAddress && (
							<>
								{" "}z siedzibą pod adresem <Strong>{salonAddress}</Strong>
							</>
						)}
						, NIP <Strong>[NIP]</Strong>, REGON <Strong>[REGON]</Strong>.
					</P>
					<P>
						Kontakt z administratorem w sprawach związanych z przetwarzaniem danych osobowych:
					</P>
					<UL>
						{salonEmail && (
							<LI>
								e-mail: <A href={`mailto:${salonEmail}`}>{salonEmail}</A>
							</LI>
						)}
						{salonPhone && (
							<LI>
								telefon: <A href={`tel:${salonPhone}`}>{salonPhone}</A>
							</LI>
						)}
						{salonAddress && (
							<LI>
								pisemnie: {salonAddress}
							</LI>
						)}
					</UL>
				</Section>

				<Section title="2. Cele i podstawy prawne przetwarzania">
					<P>Twoje dane osobowe przetwarzamy w następujących celach:</P>
					<UL>
						<LI>
							<Strong>Realizacja rezerwacji i świadczenie usług</Strong> — na podstawie umowy (art.
							6 ust. 1 lit. b RODO). Dotyczy to przyjęcia, potwierdzenia, zmiany lub anulowania
							wizyty.
						</LI>
						<LI>
							<Strong>Powiadomienia o wizycie</Strong> (potwierdzenie, przypomnienie, zmiana terminu)
							— na podstawie wykonania umowy (art. 6 ust. 1 lit. b RODO).
						</LI>
						<LI>
							<Strong>Obsługa konta klienta</Strong>, jeśli zdecydujesz się je założyć — na podstawie
							umowy (art. 6 ust. 1 lit. b RODO) oraz Twojej zgody (art. 6 ust. 1 lit. a RODO).
						</LI>
						<LI>
							<Strong>Obowiązki rachunkowe i podatkowe</Strong> — na podstawie obowiązku prawnego
							(art. 6 ust. 1 lit. c RODO, w związku z ustawą o rachunkowości i ordynacją podatkową).
						</LI>
						<LI>
							<Strong>Obrona przed ewentualnymi roszczeniami</Strong> — na podstawie prawnie
							uzasadnionego interesu administratora (art. 6 ust. 1 lit. f RODO).
						</LI>
					</UL>
				</Section>

				<Section title="3. Kategorie przetwarzanych danych">
					<P>W ramach korzystania z systemu rezerwacji przetwarzamy:</P>
					<UL>
						<LI>imię i nazwisko,</LI>
						<LI>numer telefonu,</LI>
						<LI>adres e-mail (opcjonalnie, jeśli go podasz),</LI>
						<LI>dane dotyczące rezerwacji: wybrane usługi, pracownik, data i godzina wizyty,</LI>
						<LI>opcjonalne notatki, które dobrowolnie zostawisz przy rezerwacji,</LI>
						<LI>
							w przypadku założenia konta klienta: hasło (zaszyfrowane) oraz historia Twoich
							rezerwacji.
						</LI>
					</UL>
				</Section>

				<Section title="4. Odbiorcy danych">
					<P>
						Twoje dane osobowe mogą być przekazywane podmiotom, które wspierają nas w prowadzeniu
						działalności, na podstawie umów powierzenia przetwarzania danych:
					</P>
					<UL>
						<LI>
							dostawcy infrastruktury IT i hostingu (serwer aplikacji, baza danych),
						</LI>
						<LI>
							dostawcy usług powiadomień SMS i e-mail (po wdrożeniu — informacja zostanie
							uzupełniona),
						</LI>
						<LI>
							biuro rachunkowe — w zakresie wymaganym do prowadzenia ewidencji księgowej,
						</LI>
						<LI>
							organy publiczne — wyłącznie w przypadkach przewidzianych przez prawo.
						</LI>
					</UL>
					<P>
						Nie sprzedajemy ani nie udostępniamy Twoich danych dla celów marketingowych podmiotom
						trzecim.
					</P>
				</Section>

				<Section title="5. Okres przechowywania danych">
					<UL>
						<LI>
							Dane rezerwacji oraz dane konta klienta — przez czas korzystania z systemu, do
							momentu cofnięcia zgody lub usunięcia konta.
						</LI>
						<LI>
							Dane wymagane do celów rachunkowych — przez okres 5 lat licząc od końca roku
							obrotowego, w którym wystawiono dokument księgowy.
						</LI>
						<LI>
							Dane przetwarzane w celu obrony przed roszczeniami — do upływu terminów przedawnienia
							roszczeń wynikających z przepisów prawa cywilnego.
						</LI>
					</UL>
				</Section>

				<Section title="6. Twoje prawa">
					<P>W związku z przetwarzaniem Twoich danych osobowych przysługuje Ci prawo do:</P>
					<UL>
						<LI>dostępu do treści swoich danych,</LI>
						<LI>żądania sprostowania nieaktualnych lub niedokładnych danych,</LI>
						<LI>żądania usunięcia danych (&bdquo;prawo do bycia zapomnianym&rdquo;),</LI>
						<LI>żądania ograniczenia przetwarzania,</LI>
						<LI>przenoszenia danych,</LI>
						<LI>wniesienia sprzeciwu wobec przetwarzania danych,</LI>
						<LI>
							cofnięcia zgody w dowolnym momencie — bez wpływu na zgodność z prawem przetwarzania,
							którego dokonano na podstawie zgody przed jej cofnięciem,
						</LI>
						<LI>
							wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193
							Warszawa), jeśli uznasz, że przetwarzanie Twoich danych narusza przepisy RODO.
						</LI>
					</UL>
					<P>
						Z większości powyższych praw możesz skorzystać kontaktując się z nami{" "}
						{salonEmail ? (
							<>
								pod adresem <A href={`mailto:${salonEmail}`}>{salonEmail}</A>
							</>
						) : (
							"korzystając z danych kontaktowych podanych w punkcie 1"
						)}
						.
					</P>
				</Section>

				<Section title="7. Pliki cookie">
					<P>
						Strona korzysta wyłącznie z plików cookie niezbędnych do działania serwisu (m.in.
						bezpieczna obsługa sesji zalogowanego użytkownika oraz pamiętanie Twojej zgody na
						niniejszą politykę). Pliki te są wymagane do prawidłowego funkcjonowania rezerwacji i nie
						służą do analityki, profilowania ani celów marketingowych.
					</P>
					<P>
						Możesz w każdej chwili zablokować pliki cookie w ustawieniach swojej przeglądarki,
						pamiętaj jednak, że może to uniemożliwić korzystanie z konta klienta i panelu administracyjnego.
					</P>
				</Section>

				<Section title="8. Zautomatyzowane podejmowanie decyzji i profilowanie">
					<P>
						Twoje dane osobowe nie podlegają zautomatyzowanemu podejmowaniu decyzji ani
						profilowaniu, które wywoływałyby wobec Ciebie skutki prawne lub w podobny sposób
						istotnie na Ciebie wpływały.
					</P>
				</Section>

				<Section title="9. Przekazywanie danych poza EOG">
					<P>
						Twoje dane nie są standardowo przekazywane poza Europejski Obszar Gospodarczy. Gdyby w
						przyszłości okazało się to konieczne (np. w związku z usługami niektórych dostawców
						chmurowych), zostanie to dokonane wyłącznie z zachowaniem zabezpieczeń wymaganych przez
						RODO.
					</P>
				</Section>

				<Section title="10. Zmiany polityki prywatności">
					<P>
						Polityka prywatności może być okresowo aktualizowana, w szczególności w celu odzwierciedlenia
						zmian w przepisach prawa lub w zakresie świadczonych usług. Każda nowa wersja zostanie
						opublikowana na tej stronie wraz z datą ostatniej aktualizacji widoczną u góry.
					</P>
				</Section>
			</div>

			<div className="mt-14 pt-8 border-t border-border-subtle">
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
	return <ul className="list-disc pl-5 space-y-2 marker:text-interactive">{children}</ul>
}

function LI({children}: {children: React.ReactNode}) {
	return <li className="leading-relaxed">{children}</li>
}

function Strong({children}: {children: React.ReactNode}) {
	return <strong className="font-medium text-primary">{children}</strong>
}

function A({href, children}: {href: string; children: React.ReactNode}) {
	return (
		<a
			href={href}
			className="text-interactive-hover underline-offset-2 hover-supported:hover:underline"
		>
			{children}
		</a>
	)
}
