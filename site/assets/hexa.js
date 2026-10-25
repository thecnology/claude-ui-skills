/*
 * Sdílená data a chování pro všechny varianty detailu produktu.
 * Stránky jsou čistě deklarativní (data-* atributy + Tailwind třídy),
 * tento skript jen doplní barvy, ilustrace a interakce.
 */
(function () {
  'use strict';

  const product = {
    name: 'HEXA voděodolný popruh 20 mm',
    sku: 'HEXA-20',
    price: 49,
    priceNoVat: 40.5,
    unit: 'm',
    width: '20 mm',
    thickness: '2,6 mm',
    breakingLoad: '450 kg',
    material: 'polyesterové jádro s PVC povrchem',
  };

  const colors = [
    { name: 'ANTRACIT', hex: '#3b3f45' },
    { name: 'BLACK', hex: '#151515' },
    { name: 'BLUE', hex: '#1f4fbf' },
    { name: 'BRANDY', hex: '#8a3b23' },
    { name: 'BROWN', hex: '#5a3a22' },
    { name: 'CARIBIC', hex: '#00a3a6' },
    { name: 'GOLD', hex: '#c9a23a' },
    { name: 'GRAY', hex: '#8d9196' },
    { name: 'GREEN', hex: '#2e8b3d' },
    { name: 'LEVANDULE', hex: '#a58bd1' },
    { name: 'LIGHT BLUE', hex: '#5ab0e8' },
    { name: 'LILA', hex: '#c58fd6' },
    { name: 'MAGENTA', hex: '#c2187a' },
    { name: 'OLIVE', hex: '#6b6b2a' },
    { name: 'ORANGE', hex: '#f26a1b' },
    { name: 'PASTEL BLUE', hex: '#a9cbe8' },
    { name: 'PASTEL GREEN', hex: '#a8dcb5' },
    { name: 'PASTEL PINK', hex: '#f4b8c8' },
    { name: 'PETROL', hex: '#155e6b' },
    { name: 'PINKY', hex: '#ff5fa2' },
    { name: 'RED', hex: '#d0202a' },
    { name: 'YELLOW', hex: '#f7d117' },
    { name: 'ICE BLUE', hex: '#cdeaf5' },
  ];

  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Katalog ---------- */

  const VAT = 1.21;
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const withoutVat = (n) => round2(n / VAT);

  const MATERIALS = { biothane: 'BioThane', pawtex: 'Pawtex', hexa: 'HEXA', kuze: 'Kůže' };
  const allColors = colors.map((c) => c.name);

  function item(sku, name, material, width, price, colorNames, featured = false) {
    return {
      sku, name, material, materialName: MATERIALS[material], width,
      price, priceNoVat: withoutVat(price), colors: colorNames, url: 'index.html', featured,
    };
  }

  // Pořadí = řazení „Doporučené“.
  const catalog = [
    item(product.sku, product.name, 'hexa', 20, product.price, allColors, true),
    item('HEXA-25', 'HEXA voděodolný popruh 25 mm', 'hexa', 25, 59, allColors),
    item('BT-16', 'BioThane Beta 16 mm', 'biothane', 16, 39, ['BLACK', 'RED', 'BLUE', 'ORANGE', 'PINKY', 'YELLOW', 'GREEN']),
    item('BT-19', 'BioThane Beta 19 mm', 'biothane', 19, 45, ['BLACK', 'RED', 'BLUE', 'ORANGE', 'GOLD', 'GREEN', 'PETROL']),
    item('BT-25', 'BioThane Beta 25 mm', 'biothane', 25, 55, ['BLACK', 'RED', 'BLUE', 'ORANGE', 'OLIVE', 'GRAY'], true),
    item('PAW-20', 'Pawtex 20 mm', 'pawtex', 20, 35, ['BLACK', 'GRAY', 'PASTEL PINK', 'PASTEL BLUE', 'PASTEL GREEN', 'LEVANDULE', 'ICE BLUE'], true),
    item('PAW-25', 'Pawtex 25 mm', 'pawtex', 25, 42, ['BLACK', 'GRAY', 'PASTEL PINK', 'PASTEL BLUE', 'LILA']),
    item('KUZE-20', 'Kožený řemen 20 mm', 'kuze', 20, 89, ['BROWN', 'BRANDY', 'BLACK'], true),
    item('KUZE-25', 'Kožený řemen 25 mm', 'kuze', 25, 109, ['BROWN', 'BRANDY', 'BLACK']),
  ];

  /* ---------- Košík (localStorage, sdílený mezi stránkami i záložkami) ---------- */

  const CART_KEY = 'popruharna-cart-v1';
  const CART_EVENT = 'hexa:cart';
  const MAX_QTY = 500;
  const clampQty = (q) => Math.max(1, Math.min(MAX_QTY, Math.round(Number(q) || 1)));
  const findProduct = (sku) => catalog.find((p) => p.sku === sku);

  // Když localStorage nejde číst nebo zapsat, košík žije aspoň v paměti do obnovení stránky.
  let cartFallback = [];
  let storageBroken = false;

  // Uložená data jsou nedůvěryhodná: neznámé SKU/barvy zahodit, množství oříznout, duplicity sloučit.
  function sanitize(raw) {
    const out = [];
    if (!Array.isArray(raw)) return out;
    raw.forEach((l) => {
      const p = l && findProduct(l.sku);
      if (!p || !p.colors.includes(l.color)) return;
      const qty = clampQty(l.qty);
      const same = out.find((x) => x.sku === l.sku && x.color === l.color);
      if (same) same.qty = Math.min(MAX_QTY, same.qty + qty);
      else out.push({ sku: l.sku, color: l.color, qty });
    });
    return out;
  }

  function loadCart() {
    if (storageBroken) return sanitize(cartFallback);
    let raw;
    try {
      raw = localStorage.getItem(CART_KEY);
    } catch (e) {
      return sanitize(cartFallback);
    }
    if (raw == null) return [];
    try {
      return sanitize(JSON.parse(raw));
    } catch (e) {
      return [];
    }
  }

  function refreshCartBadges() {
    const n = loadCart().length;
    $$('[data-cart-count]').forEach((el) => (el.textContent = n));
  }

  function cartChanged(source) {
    refreshCartBadges();
    document.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { source, cart } }));
  }

  function saveCart(lines) {
    cartFallback = lines;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch (e) {
      storageBroken = true; // plné nebo zakázané úložiště
    }
    cartChanged('local');
  }

  const cart = {
    key: CART_KEY,
    event: CART_EVENT,
    max: MAX_QTY,

    // Vrací { sku, color, qty, clamped } nebo null pro neznámé SKU/barvu.
    add(sku, color, qty = 1) {
      const p = findProduct(sku);
      if (!p || !p.colors.includes(color)) return null;
      const lines = loadCart();
      const add = Math.max(1, Math.round(Number(qty) || 1));
      let line = lines.find((l) => l.sku === sku && l.color === color);
      if (!line) lines.push((line = { sku, color, qty: 0 }));
      const sum = line.qty + add;
      line.qty = Math.min(MAX_QTY, sum);
      saveCart(lines);
      return { sku, color, qty: line.qty, clamped: sum > MAX_QTY };
    },

    setQty(sku, color, qty) {
      const lines = loadCart();
      const line = lines.find((l) => l.sku === sku && l.color === color);
      if (!line) return null;
      line.qty = clampQty(qty);
      saveCart(lines);
      return line.qty;
    },

    remove(sku, color) {
      saveCart(loadCart().filter((l) => !(l.sku === sku && l.color === color)));
    },

    clear() {
      saveCart([]);
    },

    // Řádky doplněné o produkt, barvu (hex) a cenu řádku s DPH.
    lines() {
      return loadCart().map((l) => {
        const p = findProduct(l.sku);
        const c = colors.find((x) => x.name === l.color);
        return { sku: l.sku, color: l.color, qty: l.qty, product: p, hex: c.hex, total: round2(l.qty * p.price) };
      });
    },

    // Mezisoučet s DPH, bez DPH (= součet / 1,21 na haléře), DPH = rozdíl, počet řádků.
    totals() {
      const lines = cart.lines();
      const total = round2(lines.reduce((s, l) => s + l.total, 0));
      const totalNoVat = withoutVat(total);
      return { total, totalNoVat, vat: round2(total - totalNoVat), count: lines.length };
    },
  };

  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY || e.key === null) cartChanged('storage');
  });

  function formatCzk(n) {
    const decimals = Number.isInteger(n) ? 0 : 2;
    return n.toLocaleString('cs-CZ', { minimumFractionDigits: decimals, maximumFractionDigits: 2 }) + ' Kč';
  }

  function isLight(hex) {
    const v = parseInt(hex.slice(1), 16);
    const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 165;
  }

  /* ---------- SVG ilustrace popruhu ---------- */

  let uid = 0;

  function hexPath(cx, cy, r) {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 180) * (60 * k - 90);
      d += (k ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  }

  // Plástev ze šestiúhelníků (pointy-top), dlaždice w × 3r.
  function hexPattern(id, r) {
    const w = Math.sqrt(3) * r, h = 3 * r, ir = r * 0.84;
    const cells = [[0, 0], [w, 0], [w / 2, 1.5 * r], [0, h], [w, h]];
    const d = cells.map(([x, y]) => hexPath(x, y, ir)).join('');
    const hi = cells.map(([x, y]) => hexPath(x - r * 0.06, y - r * 0.08, ir * 0.92)).join('');
    return `<pattern id="${id}" width="${w.toFixed(2)}" height="${h}" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="rgba(0,0,0,.22)"/>
      <path d="${hi}" fill="rgba(255,255,255,.16)"/>
      <path d="${d}" fill="rgba(255,255,255,.04)" stroke="rgba(0,0,0,.18)" stroke-width="${(r / 10).toFixed(2)}"/>
    </pattern>`;
  }

  function shadow(id) {
    return `<filter id="${id}" filterUnits="userSpaceOnUse" x="-50" y="-50" width="700" height="700">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000" flood-opacity=".22"/>
    </filter>`;
  }

  // Popruh = tmavší hrana + barva + textura po stejné cestě.
  function strapStroke(d, width, patId, extra = '') {
    return `<path d="${d}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="${width + 5}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>
      <path d="${d}" fill="none" style="stroke:var(--strap)" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="url(#${patId})" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  }

  const art = {
    band() {
      const p = 'hx' + ++uid, f = 'sh' + uid;
      const d = 'M90 510 C 220 430, 120 280, 300 280 S 430 170, 500 100';
      return `<svg viewBox="0 0 600 600" width="100%" height="100%" role="img" aria-label="Popruh HEXA">
        <defs>${hexPattern(p, 7)}${shadow(f)}</defs>
        <g filter="url(#${f})">${strapStroke(d, 92, p)}</g>
      </svg>`;
    },

    texture() {
      const p = 'hx' + ++uid, g = 'gl' + uid;
      return `<svg viewBox="0 0 600 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Detail hexagonální struktury">
        <defs>${hexPattern(p, 34)}
          <radialGradient id="${g}" cx="30%" cy="25%" r="80%">
            <stop offset="0" stop-color="#fff" stop-opacity=".28"/>
            <stop offset=".6" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity=".25"/>
          </radialGradient>
        </defs>
        <rect width="600" height="600" style="fill:var(--strap)"/>
        <rect width="600" height="600" fill="url(#${p})"/>
        <rect width="600" height="600" fill="url(#${g})"/>
      </svg>`;
    },

    roll() {
      const p = 'hx' + ++uid, f = 'sh' + uid;
      const cx = 290, cy = 300, gap = 27, turns = 6.2;
      const b = gap / (2 * Math.PI);
      let d = '', last;
      for (let t = 0; t <= turns * 2 * Math.PI; t += 0.08) {
        const r = 34 + b * t;
        last = [cx + r * Math.cos(t), cy + r * Math.sin(t)];
        d += (d ? 'L' : 'M') + last[0].toFixed(1) + ' ' + last[1].toFixed(1);
      }
      d += ` C ${last[0] + 40} ${last[1] + 80}, ${last[0] + 140} ${last[1] + 30}, 560 ${last[1] + 60}`;
      return `<svg viewBox="0 0 600 600" width="100%" height="100%" role="img" aria-label="Smotaný popruh">
        <defs>${hexPattern(p, 3.4)}${shadow(f)}</defs>
        <g filter="url(#${f})">${strapStroke(d, 22, p)}</g>
      </svg>`;
    },

    leash() {
      const p = 'hx' + ++uid, f = 'sh' + uid;
      const loop = 'M190 260 C 70 210, 70 60, 190 60 C 310 60, 310 210, 190 260';
      const line = 'M190 262 C 220 400, 400 330, 432 470';
      return `<svg viewBox="0 0 600 600" width="100%" height="100%" role="img" aria-label="Vodítko z popruhu HEXA">
        <defs>${hexPattern(p, 4.2)}${shadow(f)}</defs>
        <g filter="url(#${f})">
          ${strapStroke(loop, 36, p)}
          ${strapStroke(line, 36, p)}
          <rect x="166" y="244" width="48" height="40" rx="8" style="fill:var(--strap)" stroke="rgba(0,0,0,.35)" stroke-width="3"/>
          <circle cx="436" cy="492" r="18" fill="none" stroke="#9aa1a9" stroke-width="9"/>
          <path d="M436 510 L436 540 C 436 575, 476 575, 476 540 L476 528" fill="none" stroke="#9aa1a9" stroke-width="11" stroke-linecap="round"/>
          <path d="M436 512 L436 540" stroke="#c9ced3" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>`;
    },

    section() {
      const s = 'st' + ++uid;
      return `<svg viewBox="0 0 600 420" width="100%" height="100%" role="img" aria-label="Řez popruhem: PVC povrch a polyesterové jádro" style="font-family:inherit">
        <defs>
          <pattern id="${s}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="#f4f1ea"/><rect width="4" height="10" fill="#ddd7ca"/>
          </pattern>
        </defs>
        <rect x="80" y="150" width="440" height="100" rx="26" style="fill:var(--strap)"/>
        <rect x="80" y="150" width="440" height="100" rx="26" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="3"/>
        <rect x="112" y="180" width="376" height="40" rx="10" fill="url(#${s})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
        <g stroke="currentColor" stroke-width="2" fill="none" opacity=".75">
          <path d="M80 300 V 330 M520 300 V 330 M80 318 H 520"/>
          <path d="M548 150 H 572 M548 250 H 572 M562 150 V 250"/>
          <path d="M300 200 L 360 100 H 470"/>
          <path d="M150 165 L 120 92 H 70"/>
        </g>
        <g fill="currentColor" font-size="19">
          <text x="300" y="358" text-anchor="middle" font-weight="700">20 mm</text>
          <text x="566" y="282" text-anchor="middle" font-weight="700">2,6 mm</text>
          <text x="364" y="90">polyesterové jádro</text>
          <text x="70" y="82">PVC povrch</text>
        </g>
      </svg>`;
    },
  };

  function renderArt(el) {
    const kind = el.getAttribute('data-art');
    if (art[kind]) el.innerHTML = art[kind]();
  }

  /* ---------- Interakce ---------- */

  const state = { color: colors[0], qty: 1 };

  function setColor(c) {
    state.color = c;
    const root = document.documentElement.style;
    root.setProperty('--strap', c.hex);
    root.setProperty('--strap-ink', isLight(c.hex) ? '#111111' : '#ffffff');
    $$('[data-color-name]').forEach((el) => (el.textContent = c.name));
    $$('[data-color-hex]').forEach((el) => (el.textContent = c.hex.toUpperCase()));
    $$('[data-swatch]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.swatch === c.name)));
  }

  function mountPicker(box) {
    const cls = box.dataset.swatchClass || '';
    const labelCls = box.dataset.swatchLabelClass;
    box.innerHTML = colors
      .map((c) => `<button type="button" data-swatch="${c.name}" title="${c.name}" aria-label="Barva ${c.name}" aria-pressed="false"
          class="${cls}" style="--sw:${c.hex}">${labelCls ? `<span class="${labelCls}">${c.name}</span>` : ''}</button>`)
      .join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-swatch]');
      if (b) setColor(colors.find((c) => c.name === b.dataset.swatch));
    });
  }

  function setQty(q) {
    state.qty = Math.max(1, Math.min(500, Math.round(Number(q) || 1)));
    $$('[data-qty]').forEach((i) => (i.value = state.qty));
    $$('[data-total]').forEach((el) => (el.textContent = formatCzk(state.qty * product.price)));
  }

  let toastTimer;
  function toast(text) {
    $$('[data-toast-text]').forEach((el) => (el.textContent = text));
    $$('[data-toast]').forEach((el) => el.setAttribute('data-show', 'true'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $$('[data-toast]').forEach((el) => el.setAttribute('data-show', 'false')), 2600);
  }

  function selectTab(group, name) {
    $$('[data-tab]', group).forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
    $$('[data-panel]', group).forEach((p) => (p.hidden = p.dataset.panel !== name));
  }

  /* ---------- Seznam produktů (produkty.html) ----------
   *
   * Kontrakt data-* (vše kromě [data-product-list] a šablony karty je nepovinné):
   *
   * [data-product-list]            kontejner mřížky; hexa.js do něj vkládá karty za šablonu.
   *                                Při nulovém počtu výsledků dostane atribut hidden.
   *   <template data-product-card>  markup jedné karty s jedním kořenovým prvkem. Kořen klonu
   *                                dostane data-sku a CSS proměnné --strap / --strap-ink
   *                                (první barva produktu). Uvnitř klonu hexa.js plní:
   *     [data-field=name]          „HEXA voděodolný popruh 20 mm“
   *     [data-field=material]      „HEXA“, „BioThane“, „Pawtex“, „Kůže“
   *     [data-field=width]         „20 mm“
   *     [data-field=price]         cena za metr s DPH, „49 Kč“
   *     [data-field=price-novat]   cena za metr bez DPH, „40,50 Kč“ (text „bez DPH“ patří do markupu)
   *     [data-field=color-count]   počet barev, „23“
   *     [data-field=unit]          „/ m“
   *     [data-field=url]           odkaz na detail: nastaví se href (index.html téže varianty);
   *                                může být i sám kořen karty
   *     [data-art]                 ilustrace (band, texture, roll, leash) obarvená přes --strap
   *
   * Filtry – skupina [data-filter=material|width|color] obsahuje [data-filter-options],
   * do kterého hexa.js vygeneruje volby z katalogu (materiál v pořadí katalogu, šířky
   * vzestupně, barvy v pořadí palety). Vzhled volby určuje nepovinná
   * <template> uvnitř [data-filter-options] s jedním kořenem (typicky <label>):
   *     <input data-option type="checkbox|radio">  hexa.js doplní name, value, id
   *     [data-option-label]        popisek („HEXA“, „16 mm“, „GOLD“)
   *     [data-option-swatch]       dostane CSS proměnnou --sw = barva (jen skupina color)
   *   Bez šablony vznikne prostý <label><input type="checkbox"> popisek</label>.
   *   U radio skupiny hexa.js přidá na začátek volbu „Vše“ (value="").
   *   Volby v rámci skupiny se sčítají (OR), mezi skupinami platí AND.
   *   URL ?material=<klíč> (hexa, biothane, pawtex, kuze) předvolí materiál, neznámá hodnota se ignoruje.
   *
   * [data-sort]                    <select> s hodnotami recommended | price-asc | price-desc
   *                                (prázdný select hexa.js naplní: Doporučené, Cena vzestupně,
   *                                Cena sestupně), nebo kontejner s radio inputy stejných hodnot.
   *                                Doporučené = pořadí katalogu.
   * [data-result-count]            počet zobrazených produktů, „3“
   * [data-result-label]            správný tvar slova: „produkt“ / „produkty“ / „produktů“
   * [data-filter-active-count]     počet zaškrtnutých voleb filtrů (pro tlačítko na mobilu)
   * [data-empty]                   stav bez výsledků („Žádný produkt neodpovídá filtru“);
   *                                hexa.js mu přepíná atribut hidden
   * [data-filter-reset]            tlačítko: zruší všechny filtry (řazení zůstane)
   * [data-filter-toggle]           tlačítko na mobilu: přepne aria-expanded na sobě a
   *                                data-open="true|false" na [data-filter-panel]
   *                                (panel stylujte např. hidden data-[open=true]:block lg:block)
   */

  const SORTS = [
    ['recommended', 'Doporučené'],
    ['price-asc', 'Cena vzestupně'],
    ['price-desc', 'Cena sestupně'],
  ];

  const unique = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);

  const filterGroups = {
    material: {
      options: () => unique(catalog.map((p) => p.material)).map((m) => ({ value: m, label: MATERIALS[m] })),
      match: (p, vals) => vals.includes(p.material),
    },
    width: {
      options: () => unique(catalog.map((p) => p.width)).sort((a, b) => a - b).map((w) => ({ value: String(w), label: `${w} mm` })),
      match: (p, vals) => vals.includes(String(p.width)),
    },
    color: {
      options: () => colors.filter((c) => catalog.some((p) => p.colors.includes(c.name))).map((c) => ({ value: c.name, label: c.name, hex: c.hex })),
      match: (p, vals) => vals.some((v) => p.colors.includes(v)),
    },
  };

  function plural(n) {
    if (n === 1) return 'produkt';
    return n >= 2 && n <= 4 ? 'produkty' : 'produktů';
  }

  function fillCard(card, p) {
    const c = colors.find((x) => x.name === p.colors[0]);
    card.setAttribute('data-sku', p.sku);
    card.style.setProperty('--strap', c.hex);
    card.style.setProperty('--strap-ink', isLight(c.hex) ? '#111111' : '#ffffff');
    const values = {
      name: p.name,
      material: p.materialName,
      width: `${p.width} mm`,
      price: formatCzk(p.price),
      'price-novat': formatCzk(p.priceNoVat),
      'color-count': String(p.colors.length),
      unit: `/ ${p.unit || 'm'}`,
    };
    [card, ...$$('[data-field]', card)].forEach((el) => {
      const f = el.getAttribute('data-field');
      if (f === 'url') el.setAttribute('href', p.url);
      else if (f in values) el.textContent = values[f];
    });
    [card, ...$$('[data-art]', card)].filter((el) => el.hasAttribute('data-art')).forEach(renderArt);
    return card;
  }

  function mountFilterOptions(group, key) {
    const box = group.querySelector('[data-filter-options]');
    if (!box || !filterGroups[key]) return;
    const tpl = box.querySelector('template');
    const proto = tpl && tpl.content.firstElementChild;
    const type = (proto && proto.querySelector('input[data-option], input') || {}).type === 'radio' ? 'radio' : 'checkbox';
    const opts = filterGroups[key].options();
    if (type === 'radio') opts.unshift({ value: '', label: 'Vše' });
    box.querySelectorAll(':scope > :not(template)').forEach((el) => el.remove());
    opts.forEach((o, i) => {
      let el;
      if (proto) {
        el = proto.cloneNode(true);
      } else {
        el = document.createElement('label');
        el.innerHTML = '<input data-option type="checkbox"> <span data-option-label></span>';
      }
      const input = el.matches('input') ? el : el.querySelector('input[data-option], input');
      const id = `filter-${key}-${i}`;
      input.setAttribute('data-option', '');
      input.type = type;
      input.name = `filter-${key}`;
      input.value = o.value;
      input.id = id;
      input.checked = type === 'radio' && o.value === '';
      const label = el.matches('label') ? el : el.querySelector('label');
      if (label && !label.contains(input)) label.htmlFor = id;
      [el, ...$$('[data-option-label]', el)].filter((x) => x.hasAttribute('data-option-label')).forEach((x) => (x.textContent = o.label));
      [el, ...$$('[data-option-swatch]', el)].filter((x) => x.hasAttribute('data-option-swatch')).forEach((x) => {
        if (o.hex) x.style.setProperty('--sw', o.hex);
        else x.hidden = true;
      });
      box.appendChild(el);
    });
  }

  function mountProductList(list) {
    const tpl = list.querySelector('template[data-product-card]');
    if (!tpl || !tpl.content.firstElementChild) return;
    const cards = new Map(catalog.map((p) => [p.sku, fillCard(tpl.content.firstElementChild.cloneNode(true), p)]));
    const groups = $$('[data-filter]').filter((g) => filterGroups[g.dataset.filter]);
    groups.forEach((g) => mountFilterOptions(g, g.dataset.filter));

    $$('select[data-sort]').forEach((s) => {
      if (!s.options.length) s.innerHTML = SORTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    });

    const checked = (g) => $$('input[data-option]:checked', g).map((i) => i.value).filter(Boolean);

    // ?material=… předvolí materiál (bez ohledu na velikost písmen); neznámá hodnota se ignoruje.
    const preset = (new URLSearchParams(location.search).get('material') || '').trim().toLowerCase();
    if (preset && MATERIALS[preset]) {
      groups.filter((g) => g.dataset.filter === 'material').forEach((g) => {
        $$('input[data-option]', g).forEach((i) => {
          if (i.value === preset) i.checked = true;
          else if (i.type === 'checkbox') i.checked = false;
        });
      });
    }

    const sortValue = (el) => (el.matches('select') ? el.value : (el.querySelector('input:checked') || {}).value);
    let sort = (document.querySelector('[data-sort]') && sortValue(document.querySelector('[data-sort]'))) || 'recommended';

    function render() {
      const active = {};
      groups.forEach((g) => {
        const vals = checked(g);
        if (vals.length) active[g.dataset.filter] = (active[g.dataset.filter] || []).concat(vals);
      });
      let items = catalog.filter((p) => Object.keys(active).every((k) => filterGroups[k].match(p, active[k])));
      if (sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
      if (sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);

      cards.forEach((card) => card.remove());
      items.forEach((p) => list.appendChild(cards.get(p.sku)));

      const n = items.length;
      list.hidden = n === 0;
      $$('[data-empty]').forEach((el) => (el.hidden = n > 0));
      $$('[data-result-count]').forEach((el) => (el.textContent = n));
      $$('[data-result-label]').forEach((el) => (el.textContent = plural(n)));
      const activeCount = Object.values(active).reduce((s, v) => s + v.length, 0);
      $$('[data-filter-active-count]').forEach((el) => (el.textContent = activeCount));
    }

    groups.forEach((g) => g.addEventListener('change', (e) => e.target.matches('input[data-option]') && render()));
    $$('[data-sort]').forEach((el) => el.addEventListener('change', () => {
      sort = sortValue(el) || 'recommended';
      // Víc ovladačů řazení (např. mobil a desktop) drží stejnou hodnotu.
      $$('[data-sort]').forEach((o) => {
        if (o.matches('select')) o.value = sort;
        else $$('input', o).forEach((i) => (i.checked = i.value === sort));
      });
      render();
    }));
    $$('[data-filter-toggle]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    $$('[data-filter-panel]').forEach((p) => p.setAttribute('data-open', 'false'));

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-filter-reset]')) {
        groups.forEach((g) => $$('input[data-option]', g).forEach((i) => (i.checked = i.type === 'radio' && i.value === '')));
        render();
      }
      const toggle = e.target.closest('[data-filter-toggle]');
      if (toggle) {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        $$('[data-filter-toggle]').forEach((t) => t.setAttribute('aria-expanded', String(open)));
        $$('[data-filter-panel]').forEach((p) => p.setAttribute('data-open', String(open)));
      }
    });

    render();
  }

  function init() {
    $$('[data-art]').forEach(renderArt);
    $$('[data-color-picker]').forEach(mountPicker);
    setColor(state.color);
    setQty(1);

    $$('[data-price]').forEach((el) => (el.textContent = formatCzk(product.price)));
    $$('[data-price-novat]').forEach((el) => (el.textContent = formatCzk(product.priceNoVat)));
    $$('[data-color-count]').forEach((el) => (el.textContent = colors.length));
    refreshCartBadges();

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-qty-inc]')) setQty(state.qty + 1);
      if (t.closest('[data-qty-dec]')) setQty(state.qty - 1);

      const thumb = t.closest('[data-thumb]');
      if (thumb) {
        $$('[data-thumb]').forEach((x) => x.setAttribute('aria-current', String(x === thumb)));
        $$('[data-main-art]').forEach((m) => {
          m.setAttribute('data-art', thumb.dataset.thumb);
          renderArt(m);
        });
      }

      const fav = t.closest('[data-fav]');
      if (fav) {
        const on = fav.getAttribute('aria-pressed') !== 'true';
        $$('[data-fav]').forEach((x) => x.setAttribute('aria-pressed', String(on)));
        toast(on ? 'Přidáno do oblíbených' : 'Odebráno z oblíbených');
      }

      if (t.closest('[data-add-to-cart]')) {
        const added = cart.add(product.sku, state.color.name, state.qty);
        const limit = added && added.clamped ? ` (v košíku max. ${MAX_QTY} m)` : '';
        toast(`Přidáno do košíku: ${state.qty} m · ${state.color.name} · ${formatCzk(state.qty * product.price)}${limit}`);
      }

      const tab = t.closest('[data-tab]');
      if (tab) selectTab(tab.closest('[data-tabs]'), tab.dataset.tab);
    });

    $$('[data-qty]').forEach((i) => i.addEventListener('change', () => setQty(i.value)));
    $$('[data-tabs]').forEach((g) => {
      const first = g.querySelector('[data-tab][aria-selected="true"]') || g.querySelector('[data-tab]');
      if (first) selectTab(g, first.dataset.tab);
    });
    $$('[data-thumb]').forEach((x, i) => x.setAttribute('aria-current', String(i === 0)));
    $$('[data-product-list]').forEach(mountProductList);
  }

  window.HEXA = { product, colors, catalog, cart, art, formatCzk, setColor };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
