# Szeko Ablak — Teljes vizuális újratervezés (Cinematic/GSAP irány)

## Háttér és cél

A jelenlegi oldal (Apple-stílusú, tipográfia-token + motion-rendszer alapú) nem felelt meg — túl "átlagosnak", sablonosnak érződött. A cél egy teljesen új, kép-központú, mozgás-vezérelt, egyedi karakterű oldal, ami megtartja a fehér-domináns + kék paletta irányt, de sokkal merészebb, filmszerűbb, "world-class UI/UX" végrehajtással.

Ez a spec a **teljes meglévő vizuális réteget lecseréli** (CSS, motion-rendszer, page struktúra). A tartalmi/szöveges anyag (szolgáltatás-leírások, árak, elérhetőségek, csapattagok neve, vélemények szövege) **változatlan marad** — csak új vizuális keretbe kerül.

Jóváhagyott irányt reprezentáló prototípus: `.superpowers/mockups/cinematic-demo.html` (nem törlendő, referenciaként marad, de nem a végleges kódbázis része).

## Design-rendszer

### Színpaletta
- `--paper: #ffffff` — domináns háttér
- `--ink: #05070d` — sötét kontraszt-blokkok (hero, CTA, footer)
- `--blue: #0b63e6` — funkcionális akcent (linkek, számok, kiemelések, gombok)
- `--blue-deep: #062a63` — sötét kék szekció-háttér (stat sáv)
- Neutrális szövegszürkék a body copy-hoz (`#4a4f5c` körül), nem tiszta fekete

### Tipográfia
- Inter (400/500/600/700/800/900), meglévő Google Fonts betöltés cseréje/bővítése
- Nagy, negatív letter-spacing-es headline-ok (`-2px` és `-3px` tartomány nagy méreteknél)
- A jelenlegi `--text-*` token-rendszer **megszűnik** — helyette az új komponensek saját, a cinematic demo-ban rögzített méreteit visszük át egy hasonló CSS custom property készletbe, hogy konzisztens maradjon oldalak közt

### Layout-alapelv
Az oldal nem szekció-blokkok láncolata, hanem egy **"film-szalag"**: minden aloldal kap egy saját pinnelt hero-momentumot, utána váltakozó irányú split-screen (kép + szöveg) blokkok, és ahol releváns, horizontális scroll-galéria. A cél, hogy görgetés közben mindig történjen valami (parallax, reveal, pin), ne statikus blokkok kövessék egymást.

## Újrafelhasználható komponensek (GSAP/ScrollTrigger)

Ezek kerülnek be egy közös `assets/motion.js` fájlba (a jelenlegi `assets/main.js` motion-részének lecserélése), mindegyik `data-` attribútummal aktiválható, hogy oldalanként újrafelhasználható legyen:

1. **Pinned zoom-through hero** (`data-hero-zoom`) — háttérkép scale-elődik, ablakkeret-SVG maszk elhalványul/nagyítódik, szöveg kifakad felfelé mozogva. Index.html-en a teljes (340vh pin) verzió, aloldalakon egy rövidebb (kb. 150–180vh) változat ugyanezzel a mechanikával.
2. **Marquee sáv** (`data-marquee`) — végtelen, lineáris scroll szöveges sávnak, konfigurálható tartalommal.
3. **Split reveal szekció** (`data-split`, opcionális `data-split-reverse`) — kép parallax (`yPercent` scrub), szöveg staggerelt fade+slide-in belépéskor. Ez lesz az elsődleges tartalmi blokk-típus minden oldalon.
4. **Horizontális pinnelt galéria** (`data-h-gallery`) — kártyák oldalra scrollnak pin közben; kártyaszám és tartalom oldalanként eltérő (munkáink.html = teljes projektlista, index.html = rövidebb preview).
5. **Élő számláló stat-sáv** (`data-stat-counter`) — belépéskor egyszeri count-up animáció.
6. **Záró CTA** (`data-cta-final`) — sötét, izzó radiális kék fénnyel, minden oldal alján azonos szerkezettel.

Mind a hat komponens funnel-el a meglévő `reduceMotion`/`gsapReady` ellenőrzésen (CLAUDE.md-ben rögzített elv marad): `prefers-reduced-motion` vagy hiányzó GSAP esetén azonnali, teljesen látható, nem pinnelt állapotra esik vissza. Pinnelt/scrubbolt viselkedés csak 768px+ szélességen aktív; mobilon minden komponens egyszerű fade/slide-ra egyszerűsödik, horizontális galéria mobilon natív vízszintes swipe-listává alakul (nincs pin, nincs scroll-jacking).

## Oldalankénti felépítés

- **index.html**: `hero-zoom` (teljes, 340vh) → `marquee` → 2× `split` (fő szolgáltatások: ablakcsere, teljes felújítás) → `h-gallery` (3-4 kártyás preview) → `stat-counter` sáv → nagy idézet-blokk (meglévő vélemény-szövegekből) → `cta-final`
- **szolgaltatasok.html**: rövidebb `hero-zoom` → `split` blokk minden szolgáltatásra (6-7 db: ablak-ajtócsere, ablakjavítás, redőny, generál felújítás, festés, tapétázás, burkolás), váltakozó irány → `cta-final`
- **munkaink.html**: rövidebb `hero-zoom` → teljes `h-gallery` (összes meglévő projekt) → `cta-final`
- **rolunk.html**: rövidebb `hero-zoom` → `split` (15 év története) → `stat-counter` → csapattagok (Szekeres Kornél, Márk, Anna) saját kártyás blokkban (split-mintázatra építve, nem új komponens) → `cta-final`
- **gyik.html**: egyszerű hero (nincs pin) → meglévő FAQ-lista új vizuális keretben (accordion megmarad funkcionálisan) → `cta-final`
- **kapcsolat.html**: egyszerű hero (nincs pin) → kapcsolat-form + adatok új vizuális keretben, a CTA/form változatlanul kiemelt és azonnal használható marad (nem-tárgyalható üzleti szabály, CLAUDE.md)

## Tartalom és képek

- A meglévő magyar szövegek (szolgáltatás-leírások, csapattag-nevek, vélemények, elérhetőségek) szó szerint átkerülnek — nem íródnak újra.
- A demo Unsplash stock-fotókat használ. Amíg nincs valós munkafotó-anyag átadva, ezek maradnak (konzisztens grading/overlay-vel, ahogy a jelenlegi CLAUDE.md is előírja); ha a felhasználó ad saját fotókat, azok egyszerűen becserélhetők ugyanabba a szerkezetbe.

## Nem változik

- Vanilla HTML/CSS/JS, nincs build lépés, nincs framework (CLAUDE.md tech constraint marad).
- Az "Ajánlatot kérek" CTA és a kapcsolat-form változatlanul mindig azonnal elérhető és használható marad minden oldalon.
- A hat HTML fájl neve és útvonala (index.html, szolgaltatasok.html, munkaink.html, rolunk.html, kapcsolat.html, gyik.html) nem változik.

## Kiszállítandó munkarészek

1. `assets/style.css` teljes cseréje az új design-rendszerre (a régi tipográfia/motion tokenek törlésével)
2. `assets/motion.js` — új, a régi motion-részt felváltó GSAP/ScrollTrigger modul a 6 komponenssel
3. Mind a 6 HTML oldal újraépítése az új komponensekre, meglévő szöveges tartalommal
4. Mobil/accessibility fallback-ok minden komponensben
5. CLAUDE.md frissítése: a régi tipográfia-token és motion-rendszer szakaszok lecserélése az új rendszer leírására
