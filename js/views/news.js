import { esc, fmtDate, $, $$ } from '../lib/util.js';
import { loadNews, NEWS_FILTER } from '../lib/news.js';

export async function render(el) {
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Lagebild</span>
      <h1>News zur Bundeswehr</h1>
      <hr class="rule">
      <p>Aktuelle Meldungen aus Medien und offiziellen Quellen zu Heer, Luftwaffe, Marine, Einsätzen und Beschaffung – automatisch zusammengetragen.</p>
    </div>
    <div class="section">
      <div class="chips chip-scroll" id="newsFilter">
        ${NEWS_FILTER.map((f, i) => `<button class="chip ${i ? '' : 'active'}" data-q="${esc(f.q)}">${esc(f.label)}</button>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input class="input" id="newsSearch" type="search" placeholder="Eigene Suche, z. B. „Eurofighter“ oder „Wehrdienst“" aria-label="News durchsuchen">
        <button class="btn" id="newsGo">Suchen</button>
      </div>
    </div>
    <div class="section"><div class="news-list" id="newsList"></div></div>
    <div class="section">
      <h3>Offizielle Quellen</h3>
      <div class="chips">
        <a class="chip" href="https://www.bundeswehr.de/de/aktuelles" target="_blank" rel="noopener">bundeswehr.de</a>
        <a class="chip" href="https://www.bmvg.de/de/aktuelles" target="_blank" rel="noopener">bmvg.de</a>
        <a class="chip" href="https://www.bundeswehrkarriere.de" target="_blank" rel="noopener">bundeswehrkarriere.de</a>
        <a class="chip" href="https://www.reservistenverband.de" target="_blank" rel="noopener">Reservistenverband</a>
        <a class="chip" href="https://www.bundestag.de/parlament/wehrbeauftragter" target="_blank" rel="noopener">Wehrbeauftragte/r</a>
      </div>
    </div>`;

  const list = $('#newsList', el);
  let token = 0;

  async function show(q) {
    const my = ++token;
    list.innerHTML = '<div class="card skeleton" style="height:320px;grid-column:1/-1"></div>' + '<div class="card skeleton" style="height:180px"></div>'.repeat(6);
    const { items, live } = await loadNews(q);
    if (my !== token) return;
    if (!items.length) { list.innerHTML = '<p class="notice">Keine Meldungen gefunden.</p>'; return; }
    list.innerHTML = (live ? '' : '<p class="notice" style="grid-column:1/-1">Live-Nachrichten konnten gerade nicht geladen werden (offline oder Quelle nicht erreichbar). Hier findest du die wichtigsten offiziellen Nachrichtenquellen.</p>') +
      items.slice(0, 40).map((n, i) => `
        <a class="card news-item ${i === 0 && n.image ? 'featured' : ''}" href="${esc(n.url)}" target="_blank" rel="noopener">
          ${n.image ? `<div class="media"><img src="${esc(n.image)}" alt="" loading="lazy" onload="this.classList.add('loaded')" onerror="this.parentNode.remove()"></div>` : ''}
          <div class="card-body">
            <div class="news-meta"><span class="badge">${esc(n.source)}</span>${n.topline ? `<span>${esc(n.topline)}</span>` : ''}${n.date ? `<span>${esc(fmtDate(n.date))}</span>` : ''}</div>
            <h3>${esc(n.title)}</h3>
            ${n.desc ? `<p>${esc(n.desc)}</p>` : ''}
          </div>
        </a>`).join('');
  }

  $$('#newsFilter .chip', el).forEach((b) => b.addEventListener('click', () => {
    $$('#newsFilter .chip', el).forEach((x) => x.classList.toggle('active', x === b));
    show(b.dataset.q);
  }));
  const go = () => {
    const v = $('#newsSearch', el).value.trim();
    if (!v) return;
    $$('#newsFilter .chip', el).forEach((x) => x.classList.remove('active'));
    show(/bundeswehr|marine|luftwaffe|heer/i.test(v) ? v : `${v} Bundeswehr`);
  };
  $('#newsGo', el).addEventListener('click', go);
  $('#newsSearch', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });

  show(NEWS_FILTER[0].q);
}
