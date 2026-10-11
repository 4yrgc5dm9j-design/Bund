import { esc, $, $$, ICONS, store, toast } from '../lib/util.js';
import { GERAETE, KATEGORIEN, byId } from '../data/geraete.js';
import { commonsSearch, wikiSummary, hydrateImages } from '../lib/wiki.js';
import { openLightbox } from '../app.js';

export async function render(el, params) {
  if (params[0]) return detail(el, params[0]);

  const lastKat = store.get('arsenalKat', '');
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Ausrüstung</span>
      <h1>Fahrzeuge, Luftfahrzeuge &amp; Schiffe</h1>
      <hr class="rule">
      <p>${GERAETE.length} Waffensysteme der Bundeswehr mit technischen Daten, Hintergründen und Fotos – vom Kampfpanzer Leopard 2 über den Eurofighter bis zum U-Boot 212A.</p>
    </div>
    <div class="section">
      <div class="chips chip-scroll" id="katFilter">
        <button class="chip" data-kat="">Alle</button>
        ${Object.entries(KATEGORIEN).map(([k, v]) => `<button class="chip" data-kat="${k}">${esc(v.name)}</button>`).join('')}
      </div>
      <input class="input" id="eqSearch" type="search" placeholder="Suchen, z. B. „Panzer“, „Hubschrauber“, „Fregatte“" style="margin-top:12px" aria-label="Ausrüstung durchsuchen">
    </div>
    <div class="section"><div class="grid cols-4" id="eqGrid"></div></div>`;

  const grid = $('#eqGrid', el);
  let kat = lastKat, q = '';
  function draw() {
    $$('#katFilter .chip', el).forEach((x) => x.classList.toggle('active', x.dataset.kat === kat));
    const list = GERAETE.filter((g) => (!kat || g.kat === kat) && (!q || `${g.name} ${g.typ} ${g.hersteller}`.toLowerCase().includes(q)));
    grid.innerHTML = list.map((g) => `
      <a class="card equip-card" href="#/arsenal/${g.id}">
        <div class="media" data-wiki="${esc(g.wiki)}" data-width="500" data-credit="off"><div class="ph camo">${ICONS[KATEGORIEN[g.kat].icon]}</div></div>
        <div class="card-body">
          <span class="badge">${esc(g.typ)}</span>
          <h3>${esc(g.name)}</h3>
          <div class="specs-mini"><span>Seit ${esc(String(g.seit).split(' ')[0])}</span><span>${esc(g.anzahl.split('(')[0].trim())}</span></div>
        </div>
      </a>`).join('') || '<p class="notice">Nichts gefunden.</p>';
    hydrateImages(grid);
  }
  $$('#katFilter .chip', el).forEach((b) => b.addEventListener('click', () => { kat = b.dataset.kat; store.set('arsenalKat', kat); draw(); }));
  $('#eqSearch', el).addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
  draw();
}

const ROWS = [
  ['typ', 'Typ'], ['hersteller', 'Hersteller'], ['seit', 'In Dienst seit'], ['anzahl', 'Bestand'],
  ['besatzung', 'Besatzung'], ['masse', 'Masse / Verdrängung'], ['laenge', 'Länge'], ['speed', 'Geschwindigkeit'],
  ['reichweite', 'Reichweite'], ['motor', 'Antrieb'], ['bewaffnung', 'Bewaffnung'],
];

async function detail(el, id) {
  const g = byId(id);
  if (!g) { el.innerHTML = '<p class="notice">Nicht gefunden. <a href="#/arsenal">Zur Übersicht</a></p>'; return; }
  const favs = store.get('favs', []);
  const same = GERAETE.filter((x) => x.kat === g.kat && x.id !== g.id).slice(0, 4);

  el.innerHTML = `
    <div class="wrap">
      <a class="back-link" href="#/arsenal">← Alle Systeme</a>
      <div class="detail-hero">
        <div class="media" data-wiki="${esc(g.wiki)}" data-width="960"><div class="ph camo">${ICONS[KATEGORIEN[g.kat].icon]}</div></div>
        <div>
          <span class="kicker">${esc(KATEGORIEN[g.kat].name)} · ${esc(g.typ)}</span>
          <h1>${esc(g.name)}</h1>
          <hr class="rule">
          <p>${esc(g.text)}</p>
          <div class="compare-bar">
            ${[['schutz', 'Schutz'], ['feuer', 'Feuerkraft'], ['mobil', 'Mobilität']].map(([k, l]) => `
              <div class="attr" style="grid-template-columns:90px 1fr 32px"><span>${l}</span><div class="bar"><i style="width:${g.werte[k]}%"></i></div><b>${g.werte[k]}</b></div>`).join('')}
            <p class="small muted" style="margin:0">Relative Einschätzung innerhalb der Bundeswehr (vereinfacht, für den Gefechtssimulator).</p>
          </div>
          <div class="chips" style="margin-top:14px">
            <button class="btn ${favs.includes(g.id) ? 'gold' : 'secondary'} small" id="favBtn">${favs.includes(g.id) ? '★ Favorit' : '☆ Merken'}</button>
            <a class="btn secondary small" id="wikiLink" href="https://de.wikipedia.org/wiki/${encodeURIComponent(g.name.split(' /')[0])}" target="_blank" rel="noopener">Wikipedia</a>
          </div>
        </div>
      </div>

      <div class="grid cols-2">
        <div class="card"><div class="card-body">
          <h2>Technische Daten</h2>
          <table class="specs"><tbody>
            ${ROWS.filter(([k]) => g[k] && g[k] !== '–').map(([k, l]) => `<tr><th>${l}</th><td>${esc(g[k])}</td></tr>`).join('')}
          </tbody></table>
          <p class="small muted" style="margin:10px 0 0">Gerundete Richtwerte aus öffentlich zugänglichen Quellen, ohne Gewähr.</p>
        </div></div>
        <div class="card"><div class="card-body">
          <h2>Aus der Enzyklopädie</h2>
          <p id="wikiExtract" class="muted">Lade Zusammenfassung …</p>
        </div></div>
      </div>

      <div class="section" style="margin-top:32px">
        <div class="section-head"><h2>Fotos</h2><span class="small muted">Wikimedia Commons</span></div>
        <div class="thumbs" id="eqPhotos">${'<figure class="skeleton"></figure>'.repeat(8)}</div>
      </div>

      <div class="section">
        <div class="section-head"><h2>Ähnliche Systeme</h2></div>
        <div class="grid cols-4">
          ${same.map((x) => `
            <a class="card equip-card" href="#/arsenal/${x.id}">
              <div class="media" data-wiki="${esc(x.wiki)}" data-credit="off"><div class="ph camo"></div></div>
              <div class="card-body"><span class="badge">${esc(x.typ)}</span><h3>${esc(x.name)}</h3></div>
            </a>`).join('')}
        </div>
      </div>
    </div>`;

  $('#favBtn', el).addEventListener('click', (e) => {
    const f = store.get('favs', []);
    const on = !f.includes(g.id);
    store.set('favs', on ? [...f, g.id] : f.filter((x) => x !== g.id));
    e.target.className = `btn ${on ? 'gold' : 'secondary'} small`;
    e.target.textContent = on ? '★ Favorit' : '☆ Merken';
    toast(on ? `${g.name} gemerkt` : 'Aus Favoriten entfernt');
  });

  wikiSummary(g.wiki).then((s) => {
    const p = $('#wikiExtract', el);
    if (!p) return;
    if (s) {
      p.classList.remove('muted');
      p.innerHTML = `${esc(s.extract)} <a href="${esc(s.url)}" target="_blank" rel="noopener">Weiterlesen auf Wikipedia →</a>`;
      $('#wikiLink', el).href = s.url;
    } else p.textContent = 'Keine Zusammenfassung verfügbar (offline?).';
  });

  commonsSearch(g.commons, { limit: 16, width: 330 }).then((r) => {
    const box = $('#eqPhotos', el);
    if (!box) return;
    const items = r.items;
    box.innerHTML = items.length ? items.map((it, i) => `<figure data-i="${i}"><img src="${esc(it.thumb)}" alt="${esc(it.title)}" loading="lazy"></figure>`).join('') : '<p class="notice">Keine weiteren Fotos gefunden.</p>';
    box.addEventListener('click', (e) => {
      const f = e.target.closest('figure[data-i]');
      if (f) openLightbox(items, Number(f.dataset.i));
    });
  }).catch(() => {
    const box = $('#eqPhotos', el);
    if (box) box.innerHTML = '<p class="notice">Fotos können gerade nicht geladen werden.</p>';
  });
}
