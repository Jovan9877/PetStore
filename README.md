# Predmetni projekat – proširenje Pet Store aplikacije mikroservisima za udomljavanje i čuvanje ljubimaca

## O projektu

Projekat proširuje postojeću Pet Store aplikaciju sa dvije glavne funkcionalnosti:

1. evidencijom čuvanja ljubimaca u pet store-u;
2. pregledom ljubimaca iz lokalnih azila i rezervacijom za udomljavanje.

Aplikacija ima desktop interfejs napravljen u Electronu i Reactu. Podaci se obrađuju kroz TypeScript mikroservise, a klijent svim servisima pristupa preko API Gateway-a.

## Prijava

Za demonstraciju su pripremljena dva naloga:

| Tip naloga | Korisničko ime | Lozinka |
|---|---|---|
| Manager | `manager` | `Manager123!` |
| Seller | `seller` | `Seller123!` |

Na ekranu za prijavu bira se datum i vrijeme simulacije. To omogućava jednostavno testiranje radnih smjena, dužeg boravka ljubimca i isteka rezervacije bez čekanja u stvarnom vremenu.

Nakon uspješne prijave dostupna su tri taba: **Pet Store**, **Pet Sitting** i **Shelters**.

## Pet Store

Ovo je osnovni dio aplikacije:

- seller vidi dostupne ljubimce i može izvršiti prodaju tokom radnog vremena;
- manager vidi sve ljubimce, dodaje nove ljubimce i pregleda račune i korisnike;
- prodajna cijena zavisi od smjene, a račun se automatski izdaje nakon prodaje.

## Pet Sitting – čuvanje ljubimaca

Pet Sitting mikroservis vodi evidenciju ljubimaca koji su ostavljeni na čuvanje.

Seller može:

- prijaviti dolazak ljubimca;
- unijeti ime, tip i godinu rođenja ljubimca;
- evidentirati ime i telefon vlasnika;
- unijeti planirano trajanje boravka;
- odjaviti ljubimca kada vlasnik dođe po njega.

Prilikom odjave automatski se izračunava cijena od **200 RSD za svaki započeti sat** i izdaje se račun.

Manager može pregledati ljubimce koji su trenutno na čuvanju, istoriju završenih boravaka i sve izdate Pet Sitting račune. Manager ne može prijavljivati niti odjavljivati ljubimce.

## Shelters – rezervacija ljubimaca za udomljavanje

Shelter mikroservis prikazuje ljubimce iz četiri izmišljena lokalna azila. Prikaz je isti za sellera i managera.

Korisnik može:

- pregledati ime, tip, rasu, godinu rođenja i azil svakog ljubimca;
- pretraživati listu i filtrirati je po azilu;
- rezervisati dostupnog ljubimca na ime i telefon kupca;
- pregledati istoriju rezervacija.

Ponuda se automatski mijenja svakih 5–10 sekundi. Simulacija dodaje nove ljubimce ili uklanja dostupne ljubimce koje je u međuvremenu neko drugi udomio. Lista se održava na približno 6–10 ljubimaca, dok rezervisani ljubimci nikada nisu uklonjeni simulacijom.

Rezervacija traje **24 sata**. Nakon isteka ljubimac ponovo postaje dostupan ako nije preuzet.
