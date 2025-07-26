# Kalorikalkulator

Dette prosjektet er en dynamisk og datobasert kalorikalkulator med innebygd kalender. Den hjelper brukeren å holde oversikt over sitt daglige kaloriinntak og kaloriforbruk gjennom mat og trening.

## Brukeren setter en kalorigrense (budsjett) for dagen.

Kan legge til mat og trening i kategoriene:

* Frokost

* Lunsj

* Middag

* Snacks

* Trening

_For hvert element legger man inn navn på maten (eller velger type trening) og antall kalorier._

## Kalenderoversikt

All data blir automatisk lagret etter dato i nettleserens localStorage.

Kalenderen viser dag-for-dag:

* Kalorigrense 🎯

* Kalorier spist 🍔

* Kalorier forbrent 💪

* Om du ligger i et kaloriunderskudd 🥦 eller kalorioverskudd 🍕 (_foreløpig kun dag-for-dag statistikk_)

* Ved å trykke inn på en dag i kalkulatoren, får man oversikt over ytterligere informasjon om hva man har spist igjennom hele dagen av alle måltidene. Inkl hvilke kroppsdeler man trente den dagen.

* Mulighet for å slette en dagsoppføring direkte i kalenderen.

## Feilbeskyttelse

* Beskytter mot ugyldige input som e+05 eller negative verdier.

* Dynamisk minne med kalenderhistorikken. Som vil si at man kan legge til ytterligere måltider/treningsøkter utover dagen, eller øke kalorigrensen om man vil det. Man kan ikke sette kalorigrensen lavere enn
  kalorigrensen som er satt for dagen. Da må kalenderoppføringen slettes.

* Rydder opp skjemaet etter beregning for en ny dag.

Mobile friendly :)
