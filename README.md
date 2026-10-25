# Detail produktu – porovnání UI skillů

Statický prototyp detailu produktu **HEXA voděodolný popruh 20 mm**
(inspirace: <https://www.colorthan.cz/hexa-vodeodolny-popruh-20-mm>).
Každá stránka ve `site/varianty/` je výstup **právě jednoho UI skillu**, takže
jdou výstupy jednotlivých skillů porovnat vedle sebe. `site/index.html` je
všechny spojuje: náhledy v kartách a prohlížeč s přepínáním mobil/tablet/desktop.

## Spuštění

```bash
cp .env.example .env   # volitelné, výchozí port je 8080
docker compose up -d
```

Pak otevřete <http://localhost:8080/>. Nginx (`nginx/default.conf`) jen servíruje
složku `site/`, nic se nesestavuje.

## Struktura

```
site/
  index.html                 přehled a prohlížeč všech variant (seznamy VARIANTY a STRANKY)
  assets/hexa.js             sdílená data produktu, barvy, SVG ilustrace a interakce
  varianty/<skill>/index.html      detail produktu (jedna složka = jeden skill)
  varianty/<skill>/produkty.html   seznam produktů s filtry a řazením
nginx/default.conf
docker-compose.yml
```

Stránky používají jen **Tailwind CSS** (Play CDN `@tailwindcss/browser@4`).
Fonty si každá varianta volí sama. Logiku (výběr barvy, množství, košík,
oblíbené, galerie, záložky) obstarává `assets/hexa.js` přes `data-*` atributy,
takže se varianty liší jen značkováním a styly. Fotky produktu nahrazují SVG
ilustrace, které se přebarvují podle zvolené barvy. „Popruhárna“ je zástupný
název obchodu.

## Přidání varianty pro další skill

1. Spusťte skill se zadáním níže a výstup uložte do `site/varianty/<nazev-skillu>/index.html`.
2. Do pole `VARIANTY` v `site/index.html` přidejte řádek `{ slug, skill, popis }`.

Zadání pro skill (pro férové porovnání stejné pro všechny):

> Vytvoř samostatnou HTML stránku s detailem produktu „HEXA voděodolný popruh 20 mm“
> (inspirace: colorthan.cz/hexa-vodeodolny-popruh-20-mm). Styl pouze Tailwind CSS
> (`<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`), fonty dle
> uvážení. Obsah: drobečková navigace, galerie, název, cena 49 Kč/m (40,50 Kč bez DPH),
> výběr z 23 barev, množství v metrech, Vložit do košíku, Přidat do oblíbených, Skladem,
> „Odesíláme do 2 pracovních dnů od zaplacení“, popis, parametry (polyesterové jádro
> s PVC povrchem, šířka 20 mm, tloušťka 2,6 mm, nosnost 450 kg), „Co je HEXA“, patička.
> Pro data a interakce použij `/assets/hexa.js` a jeho `data-*` atributy
> (vzor: `site/varianty/bez-skillu/index.html`).

Varianta `bez-skillu` je kontrolní: stejné zadání bez jakéhokoli skillu.

## Zadání stránky Produkty

Stránku `site/varianty/<skill>/produkty.html` vytvořil u každé varianty tentýž skill
jako její detail, a to podle zadání níže (stejného pro všechny). Varianta `bez-skillu`
vznikla bez skillu. Katalog, filtrování a řazení obstarává `assets/hexa.js`. Jeho
`data-*` kontrakt je popsaný v komentáři „Seznam produktů“ v tomto souboru.

> Vytvoř samostatnou HTML stránku `produkty.html` se seznamem produktů e-shopu Popruhárna
> (popruhy HEXA, BioThane, Pawtex a kožené řemeny, 9 produktů). Styl pouze Tailwind CSS
> (`<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`), fonty dle
> uvážení. Vizuální jazyk (barvy, typografie, tvary, komponenty) navazuje na detail produktu
> téže varianty (`index.html` ve stejné složce). Obsah:
> - hlavička: logo → `domu.html`, položka Produkty jako aktuální stránka, ikona košíku
>   s počtem položek (`data-cart-count`) → `kosik.html`;
> - titulek stránky;
> - filtry podle materiálu, šířky a barvy, na mobilu sbalitelné;
> - řazení: Doporučené, Cena vzestupně, Cena sestupně; počet výsledků;
> - mřížka karet produktů: náhled popruhu, název, materiál, šířka, počet barev, cena za metr
>   s DPH („49 Kč / m“) i bez DPH („40,50 Kč bez DPH“); karta vede na detail `index.html`;
> - stav bez výsledků „Žádný produkt neodpovídá filtru“ s tlačítkem Zrušit filtry;
> - patička.
>
> Data, filtrování a řazení obstarává `/assets/hexa.js`. Stránka dodá jen markup podle
> kontraktu `data-*` z komentáře „Seznam produktů“ v hexa.js (kontejner `data-product-list`
> se šablonou karty `<template data-product-card>`, skupiny `data-filter`, `data-sort`,
> `data-result-count`, `data-empty`, `data-filter-reset`, `data-filter-toggle`/`data-filter-panel`).
> Parametr `?material=hexa|biothane|pawtex|kuze` předvolí materiál. Stránka nesmí na 390 px
> ani 1440 px vodorovně přetékat a konzole má být bez chyb (včetně favicon, např.
> `<link rel="icon" href="data:,">`).
