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

  const state = { color: colors[0], qty: 1, cart: 0 };
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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

  function init() {
    $$('[data-art]').forEach(renderArt);
    $$('[data-color-picker]').forEach(mountPicker);
    setColor(state.color);
    setQty(1);

    $$('[data-price]').forEach((el) => (el.textContent = formatCzk(product.price)));
    $$('[data-price-novat]').forEach((el) => (el.textContent = formatCzk(product.priceNoVat)));
    $$('[data-color-count]').forEach((el) => (el.textContent = colors.length));

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
        state.cart += 1;
        $$('[data-cart-count]').forEach((el) => (el.textContent = state.cart));
        toast(`Přidáno do košíku: ${state.qty} m · ${state.color.name} · ${formatCzk(state.qty * product.price)}`);
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
  }

  window.HEXA = { product, colors, art, formatCzk, setColor };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
