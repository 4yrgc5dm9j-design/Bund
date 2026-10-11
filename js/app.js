// Bundeswehr – App-Kern: Navigation, Routing, Theme, Lightbox, Service Worker.

import { $, ICONS, esc, store } from './lib/util.js';
import { hydrateImages } from './lib/wiki.js';

const ROUTES = [
  { path: '', title: 'Start', icon: 'home', group: 'Übersicht', tab: true, load: () => import('./views/home.js') },
  { path: 'news', title: 'News', icon: 'news', group: 'Übersicht', tab: true, load: () => import('./views/news.js') },
  { path: 'karte', title: 'Standorte', icon: 'map', group: 'Übersicht', tab: true, load: () => import('./views/karte.js') },
  { path: 'galerie', title: 'Galerie', icon: 'gallery', group: 'Übersicht', load: () => import('./views/galerie.js') },
  { path: 'arsenal', title: 'Ausrüstung', icon: 'tank', group: 'Übersicht', tab: true, load: () => import('./views/arsenal.js') },
  { path: 'karriere', title: 'Karrieresimulator', icon: 'career', group: 'Simulationen', load: () => import('./views/karriere.js') },
  { path: 'gefecht', title: 'Gefechtssimulator', icon: 'target', group: 'Simulationen', load: () => import('./views/gefecht.js') },
  { path: 'quiz', title: 'Wissensquiz', icon: 'quiz', group: 'Wissen & Training', load: () => import('./views/quiz.js') },
  { path: 'dienstgrade', title: 'Dienstgrade', icon: 'star', group: 'Wissen & Training', load: () => import('./views/dienstgrade.js') },
  { path: 'einsaetze', title: 'Einsätze', icon: 'globe', group: 'Wissen & Training', load: () => import('./views/einsaetze.js') },
  { path: 'geschichte', title: 'Geschichte', icon: 'book', group: 'Wissen & Training', load: () => import('./views/geschichte.js') },
  { path: 'fitness', title: 'Fitness-Check', icon: 'run', group: 'Wissen & Training', load: () => import('./views/fitness.js') },
  { path: 'funk', title: 'Funk & Morse', icon: 'radio', group: 'Wissen & Training', load: () => import('./views/funk.js') },
  { path: 'massband', title: 'Maßband', icon: 'clock', group: 'Wissen & Training', load: () => import('./views/massband.js') },
  { path: 'lexikon', title: 'Lexikon', icon: 'book', group: 'Wissen & Training', load: () => import('./views/lexikon.js') },
  { path: 'mehr', title: 'Mehr', icon: 'more', group: null, tab: true, load: () => import('./views/mehr.js') },
];
export { ROUTES };

function buildNav() {
  const groups = {};
  ROUTES.filter((r) => r.group).forEach((r) => (groups[r.group] ||= []).push(r));
  $('#nav').innerHTML = Object.entries(groups).map(([g, rs]) =>
    `<div class="nav-group">${esc(g)}</div>` +
    rs.map((r) => `<a href="#/${r.path}" data-path="${r.path}">${ICONS[r.icon]}<span>${esc(r.title)}</span></a>`).join('')
  ).join('');
  $('#tabbar').innerHTML = ROUTES.filter((r) => r.tab).map((r) =>
    `<a href="#/${r.path}" data-path="${r.path}">${ICONS[r.icon]}<span>${esc(r.path === 'arsenal' ? 'Geräte' : r.title)}</span></a>`
  ).join('');
}

let cleanup = null;

async function router() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [path, ...params] = hash.split('/').map(decodeURIComponent);
  const route = ROUTES.find((r) => r.path === path) || ROUTES[0];
  const view = $('#view');

  const tabPath = route.tab ? route.path : 'mehr';
  document.querySelectorAll('#nav [data-path]').forEach((a) => a.classList.toggle('active', a.dataset.path === route.path));
  document.querySelectorAll('#tabbar [data-path]').forEach((a) => a.classList.toggle('active', a.dataset.path === tabPath));

  if (typeof cleanup === 'function') { try { cleanup(); } catch { /* egal */ } }
  cleanup = null;

  try {
    const mod = await route.load();
    view.innerHTML = '';
    document.title = route.path ? `${route.title} · Bundeswehr` : 'Bundeswehr';
    cleanup = await mod.render(view, params);
    hydrateImages(view);
    view.insertAdjacentHTML('beforeend', `<p class="footer-note">Inoffizielle Informations- und Fan-App. Kein offizielles Angebot der Bundeswehr oder des BMVg. Bilder: Wikimedia Commons (Urheber jeweils angegeben, meist Bundeswehr/CC BY). News: Inhalte der jeweils verlinkten Medien. Simulationen sind vereinfacht und fiktiv.</p>`);
  } catch (err) {
    console.error(err);
    view.innerHTML = `<div class="page-head"><h1>Fehler</h1><p>Die Ansicht konnte nicht geladen werden.</p><pre class="small">${esc(err.message)}</pre></div>`;
  }
  window.scrollTo({ top: 0 });
  view.focus({ preventScroll: true });
}

// ---------- Theme ----------
function initTheme() {
  const saved = store.get('theme');
  if (saved) document.documentElement.dataset.theme = saved;
  $('#themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('theme', next);
  });
}

// ---------- Lightbox (global nutzbar) ----------
let lbItems = [], lbIndex = 0;
export function openLightbox(items, index = 0) {
  lbItems = items; lbIndex = index;
  const lb = $('#lightbox');
  lb.hidden = false;
  showLb();
}
function showLb() {
  const it = lbItems[lbIndex];
  if (!it) return;
  const lb = $('#lightbox');
  const img = $('img', lb);
  img.src = it.thumb;
  const full = new Image();
  full.onload = () => { if (lbItems[lbIndex] === it) img.src = it.large; };
  full.src = it.large;
  img.alt = it.title || '';
  $('figcaption', lb).innerHTML = `<b>${esc(it.title || '')}</b>${it.desc && it.desc !== it.title ? '<br>' + esc(it.desc) : ''}<br><span class="small">Foto: ${esc(it.artist || '')}${it.license ? ' · ' + esc(it.license) : ''}${it.page ? ` · <a href="${esc(it.page)}" target="_blank" rel="noopener">Quelle</a>` : ''}</span>`;
}
function initLightbox() {
  const lb = $('#lightbox');
  const close = () => { lb.hidden = true; $('img', lb).src = ''; };
  $('.lightbox-close', lb).onclick = close;
  $('.lightbox-prev', lb).onclick = () => { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLb(); };
  $('.lightbox-next', lb).onclick = () => { lbIndex = (lbIndex + 1) % lbItems.length; showLb(); };
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') $('.lightbox-prev', lb).click();
    if (e.key === 'ArrowRight') $('.lightbox-next', lb).click();
  });
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) $(dx > 0 ? '.lightbox-prev' : '.lightbox-next', lb).click();
    x0 = null;
  });
}

buildNav();
initTheme();
initLightbox();
window.addEventListener('hashchange', router);
router();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
