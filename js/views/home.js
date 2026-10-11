import { esc, ICONS, fmtDate } from '../lib/util.js';
import { commonsSearch, creditHtml } from '../lib/wiki.js';
import { loadNews } from '../lib/news.js';
import { FAKTEN } from '../data/wissen.js';

const HERO_QUERIES = [
  'Leopard 2A7 Bundeswehr', 'Eurofighter Luftwaffe Typhoon', 'Fregatte Deutsche Marine',
  'Fallschirmjäger Bundeswehr', 'Puma Schützenpanzer', 'A400M Luftwaffe', 'Gebirgsjäger Bundeswehr',
];

const TILES = [
  { href: 'news', title: 'News', text: 'Alle aktuellen Meldungen rund um die Bundeswehr', icon: 'news', img: 'Bundeswehr Pressekonferenz' },
  { href: 'karte', title: 'Standortkarte', text: 'Über 100 Standorte in Deutschland & weltweit', icon: 'map', img: 'Kaserne Bundeswehr' },
  { href: 'arsenal', title: 'Ausrüstung', text: 'Panzer, Jets, Schiffe & Waffen im Detail', icon: 'tank', img: 'Panzerhaubitze 2000' },
  { href: 'galerie', title: 'Galerie', text: 'Tausende Fotos aus Heer, Luftwaffe und Marine', icon: 'gallery', img: 'Bundeswehr Übung' },
  { href: 'karriere', title: 'Karrieresimulator', text: 'Vom Rekruten zum General – spiel deine Laufbahn', icon: 'career', img: 'Gelöbnis Bundeswehr' },
  { href: 'gefecht', title: 'Gefechtssimulator', text: 'Taktisches Rundenspiel mit realen Waffensystemen', icon: 'target', img: 'Gefechtsübungszentrum Heer' },
  { href: 'quiz', title: 'Wissensquiz', text: 'Wie gut kennst du die Truppe?', icon: 'quiz', img: 'Bundeswehr Ausbildung' },
  { href: 'einsaetze', title: 'Einsätze', text: 'Litauen, Kosovo, Rotes Meer & mehr', icon: 'globe', img: 'KFOR Bundeswehr' },
];

export async function render(el) {
  const today = new Date();
  const fact = FAKTEN[(today.getFullYear() * 400 + today.getMonth() * 31 + today.getDate()) % FAKTEN.length];

  el.innerHTML = `
    <section class="hero camo">
      <div class="hero-slides" id="heroSlides"></div>
      <div class="hero-content">
        <div class="claim">Wir. Dienen. Deutschland.</div>
        <h1>Bundeswehr</h1>
        <p>News, Standorte, Fahrzeuge, Schiffe und Luftfahrzeuge – und dazu Simulationen, mit denen du Karriere und Gefecht selbst erlebst.</p>
        <div class="chips" style="margin-top:18px">
          <a class="btn gold" href="#/news">Aktuelle News</a>
          <a class="btn secondary" style="color:#fff;border-color:rgba(255,255,255,.4)" href="#/arsenal">Ausrüstung entdecken</a>
        </div>
        <div class="hero-dots" id="heroDots"></div>
      </div>
      <div class="credit" id="heroCredit"></div>
    </section>

    <div class="stats section">
      <div class="stat"><b>1955</b><span>gegründet am 12. November</span></div>
      <div class="stat"><b>~183.000</b><span>Soldatinnen &amp; Soldaten</span></div>
      <div class="stat"><b>~81.000</b><span>zivile Beschäftigte</span></div>
      <div class="stat"><b>~250</b><span>Standorte in Deutschland</span></div>
      <div class="stat"><b>&gt;100 Mrd €</b><span>Verteidigungsausgaben 2026 inkl. Sondervermögen</span></div>
    </div>

    <section class="section">
      <div class="fact"><span class="kicker">Wusstest du schon?</span>${esc(fact)}</div>
    </section>

    <section class="section">
      <div class="section-head"><div><span class="kicker">Entdecken</span><h2>Alles zur Truppe</h2></div></div>
      <div class="tiles">
        ${TILES.map((t, i) => `
          <a class="tile" href="#/${t.href}">
            <div class="tile-bg camo" data-commons="${esc(t.img)}" data-idx="${i % 3}" data-credit="off" data-width="500"></div>
            <span class="tile-icon">${ICONS[t.icon]}</span>
            <h3>${esc(t.title)}</h3><p>${esc(t.text)}</p>
          </a>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><span class="kicker">Lagebild</span><h2>Neueste Meldungen</h2></div><a class="btn secondary small" href="#/news">Alle News</a></div>
      <div class="news-list" id="homeNews">${'<div class="card skeleton" style="height:150px"></div>'.repeat(3)}</div>
    </section>

    <section class="section">
      <div class="section-head"><div><span class="kicker">Teilstreitkräfte</span><h2>Organisation</h2></div></div>
      <div class="grid cols-3">
        ${ORG.map((o) => `
          <div class="card">
            <div class="media" data-commons="${esc(o.img)}" data-width="500">${''}<div class="ph camo"></div></div>
            <div class="card-body"><span class="badge ${o.badge}">${esc(o.name)}</span><h3 style="margin-top:8px">${esc(o.title)}</h3><p class="small muted" style="margin:0">${esc(o.text)}</p></div>
          </div>`).join('')}
      </div>
    </section>`;

  startHero(el);
  loadNews('Bundeswehr').then(({ items, live }) => {
    const box = el.querySelector('#homeNews');
    if (!box) return;
    box.innerHTML = items.slice(0, 6).map((n) => `
      <a class="card news-item" href="${esc(n.url)}" target="_blank" rel="noopener">
        <div class="card-body">
          <div class="news-meta"><span class="badge">${esc(n.source)}</span>${n.date ? `<span>${esc(fmtDate(n.date))}</span>` : ''}</div>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.desc || '')}</p>
        </div>
      </a>`).join('') + (live ? '' : '<p class="notice">Live-News sind gerade nicht erreichbar – hier sind die wichtigsten offiziellen Quellen.</p>');
  });

  return () => clearInterval(heroTimer);
}

const ORG = [
  { name: 'Heer', badge: 'heer', title: 'Landstreitkräfte', text: 'Die größte Teilstreitkraft mit drei Divisionen – von Panzergrenadieren über Gebirgsjäger bis zu Fallschirmjägern und Heeresfliegern.', img: 'Heer Bundeswehr Panzergrenadiere' },
  { name: 'Luftwaffe', badge: 'luftwaffe', title: 'Luftstreitkräfte', text: 'Sichert den Luftraum, transportiert Truppen und Material weltweit und betreibt die bodengebundene Luftverteidigung.', img: 'Luftwaffe Eurofighter Formation' },
  { name: 'Marine', badge: 'marine', title: 'Seestreitkräfte', text: 'Fregatten, Korvetten, U-Boote und Minenabwehr – in Nord- und Ostsee sowie weltweit im Einsatz.', img: 'Deutsche Marine Fregatte See' },
  { name: 'CIR', badge: 'cir', title: 'Cyber- und Informationsraum', text: 'Schützt die IT der Bundeswehr, betreibt Aufklärung, elektronische Kampfführung und Geoinformation.', img: 'Cyber Bundeswehr' },
  { name: 'Unterstützung', badge: 'skb', title: 'Unterstützungsbereich', text: 'Logistik, Feldjäger, ABC-Abwehr und Territoriale Aufgaben – das Rückgrat jeder Operation.', img: 'Feldjäger Bundeswehr' },
  { name: 'Sanität', badge: 'san', title: 'Sanitätsdienst', text: 'Bundeswehrkrankenhäuser, Sanitätsregimenter und Rettungsketten bis an die Front.', img: 'Sanitätsdienst Bundeswehr' },
];

let heroTimer;
async function startHero(el) {
  const res = await Promise.allSettled(HERO_QUERIES.map((q) => commonsSearch(q, { limit: 6, width: 1280 })));
  const items = res.filter((r) => r.status === 'fulfilled').map((r) => r.value.items.find((i) => i.w >= i.h)).filter(Boolean);
  const box = el.querySelector('#heroSlides');
  if (!box || !items.length) return;
  box.innerHTML = items.map((it, i) => `<img src="${esc(it.thumb)}" alt="${esc(it.title)}" ${i ? 'loading="lazy"' : ''}>`).join('');
  const dots = el.querySelector('#heroDots');
  dots.innerHTML = items.map((_, i) => `<button aria-label="Bild ${i + 1}"></button>`).join('');
  let i = 0;
  const show = (n) => {
    i = (n + items.length) % items.length;
    box.querySelectorAll('img').forEach((im, k) => im.classList.toggle('on', k === i));
    dots.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i));
    const c = el.querySelector('#heroCredit');
    if (c) c.innerHTML = creditHtml(items[i]);
  };
  dots.querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => { show(k); restart(); }));
  const restart = () => { clearInterval(heroTimer); heroTimer = setInterval(() => show(i + 1), 7000); };
  show(0);
  restart();
}
