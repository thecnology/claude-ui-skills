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
  index.html                 přehled a prohlížeč všech variant (seznam VARIANTY)
  assets/hexa.js             sdílená data produktu, barvy, SVG ilustrace a interakce
  varianty/<skill>/index.html   jedna stránka = jeden skill
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
