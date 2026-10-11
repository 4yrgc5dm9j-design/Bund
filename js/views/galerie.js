import { esc, $, $$ } from '../lib/util.js';
import { commonsSearch } from '../lib/wiki.js';
import { openLightbox } from '../app.js';

const KATS = [
  { label: 'Highlights', q: 'Bundeswehr' },
  { label: 'Heer', q: 'Bundeswehr Heer Übung' },
  { label: 'Panzer', q: 'Leopard 2 Bundeswehr' },
  { label: 'Luftwaffe', q: 'Luftwaffe Eurofighter' },
  { label: 'Hubschrauber', q: 'Bundeswehr Hubschrauber' },
  { label: 'Marine', q: 'Deutsche Marine Schiff' },
  { label: 'U-Boote', q: 'U-Boot Deutsche Marine' },
  { label: 'Fallschirmjäger', q: 'Fallschirmjäger Bundeswehr' },
  { label: 'Gebirgsjäger', q: 'Gebirgsjäger Bundeswehr' },
  { label: 'Spezialkräfte', q: 'Kommando Spezialkräfte' },
  { label: 'Artillerie', q: 'Panzerhaubitze 2000 Bundeswehr' },
  { label: 'Übungen NATO', q: 'Bundeswehr NATO exercise' },
  { label: 'Einsätze', q: 'Bundeswehr Afghanistan ISAF' },
  { label: 'Zeremoniell', q: 'Gelöbnis Bundeswehr' },
  { label: 'Geschichte', q: 'Bundeswehr 1960' },
];

export async function render(el) {
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Bildarchiv</span>
      <h1>Galerie</h1>
      <hr class="rule">
      <p>Frei lizenzierte Fotos von Wikimedia Commons – viele davon stammen direkt von der Bundeswehr. Tippe auf ein Bild für die Großansicht mit Urheberangabe.</p>
    </div>
    <div class="section">
      <div class="chips chip-scroll" id="galKats">${KATS.map((k, i) => `<button class="chip ${i ? '' : 'active'}" data-q="${esc(k.q)}">${esc(k.label)}</button>`).join('')}</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input class="input" id="galSearch" type="search" placeholder="Bilder suchen, z. B. „Tiger Hubschrauber“" aria-label="Bilder suchen">
        <button class="btn" id="galGo">Suchen</button>
      </div>
    </div>
    <div class="section">
      <div class="masonry" id="gal"></div>
      <div style="text-align:center;margin-top:16px"><button class="btn secondary" id="galMore" hidden>Mehr Bilder laden</button></div>
    </div>`;

  const gal = $('#gal', el);
  const more = $('#galMore', el);
  let items = [], query = KATS[0].q, next = 0, token = 0;

  async function load(reset) {
    const my = reset ? ++token : token;
    if (reset) {
      items = []; next = 0;
      gal.innerHTML = Array.from({ length: 12 }, (_, i) => `<figure class="skeleton" style="height:${160 + (i % 4) * 50}px"></figure>`).join('');
    }
    more.hidden = true;
    try {
      const r = await commonsSearch(query, { limit: 30, offset: next, width: 500 });
      if (my !== token) return;
      if (reset) gal.innerHTML = '';
      const start = items.length;
      items.push(...r.items);
      gal.insertAdjacentHTML('beforeend', r.items.map((it, i) => `
        <figure data-i="${start + i}" style="aspect-ratio:${it.w}/${it.h}">
          <img src="${esc(it.thumb)}" alt="${esc(it.title)}" loading="lazy" width="${it.w}" height="${it.h}">
          <figcaption>${esc(it.title)}<br><span style="opacity:.75">© ${esc(it.artist)} · ${esc(it.license)}</span></figcaption>
        </figure>`).join(''));
      next = r.next;
      more.hidden = next == null;
      if (!items.length) gal.innerHTML = '<p class="notice">Keine Bilder gefunden.</p>';
    } catch {
      if (my !== token) return;
      if (!items.length) gal.innerHTML = '<p class="notice">Die Bilddatenbank (Wikimedia Commons) ist gerade nicht erreichbar. Bitte prüfe deine Internetverbindung.</p>';
    }
  }

  gal.addEventListener('click', (e) => {
    const f = e.target.closest('figure[data-i]');
    if (f) openLightbox(items, Number(f.dataset.i));
  });
  more.addEventListener('click', () => load(false));
  $$('#galKats .chip', el).forEach((b) => b.addEventListener('click', () => {
    $$('#galKats .chip', el).forEach((x) => x.classList.toggle('active', x === b));
    query = b.dataset.q; load(true);
  }));
  const go = () => {
    const v = $('#galSearch', el).value.trim();
    if (!v) return;
    $$('#galKats .chip', el).forEach((x) => x.classList.remove('active'));
    query = /bundeswehr|marine|luftwaffe/i.test(v) ? v : `${v} Bundeswehr`;
    load(true);
  };
  $('#galGo', el).addEventListener('click', go);
  $('#galSearch', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });

  load(true);
}
