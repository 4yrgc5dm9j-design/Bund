// Bilder und Kurzinfos aus Wikipedia / Wikimedia Commons.
// Viele Fotos der Bundeswehr stehen dort unter freien Lizenzen (meist CC BY 2.0
// über das Flickr-Konto der Bundeswehr) – die Urheberangabe wird immer angezeigt.

import { fetchJSON, stripHtml, esc } from './util.js';

const mem = new Map();

function cacheGet(key) {
  if (mem.has(key)) return mem.get(key);
  try {
    const v = sessionStorage.getItem('wk:' + key);
    if (v) { const p = JSON.parse(v); mem.set(key, p); return p; }
  } catch { /* ignorieren */ }
  return undefined;
}
function cacheSet(key, val) {
  mem.set(key, val);
  try { sessionStorage.setItem('wk:' + key, JSON.stringify(val)); } catch { /* voll */ }
}

/** Wählt eine gängige Thumbnail-Größe (Wikimedia liefert Standardgrößen am schnellsten). */
export function resizeThumb(url, width) {
  if (!url) return url;
  return url.replace(/\/(\d+)px-([^/]+)$/, `/${width}px-$2`);
}

/**
 * Holt Zusammenfassung + Titelbild eines Wikipedia-Artikels.
 * titles: "de:Leopard 2" oder Liste von Kandidaten, der erste Treffer mit Bild gewinnt.
 */
export async function wikiSummary(titles) {
  const list = Array.isArray(titles) ? titles : String(titles).split('|');
  for (const t of list) {
    const [lang, ...rest] = t.includes(':') && /^[a-z]{2}:/.test(t) ? t.split(':') : ['de', t];
    const title = rest.join(':');
    const key = `sum:${lang}:${title}`;
    let res = cacheGet(key);
    if (res === undefined) {
      try {
        const d = await fetchJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
        res = {
          title: d.title,
          extract: d.extract || '',
          thumb: d.thumbnail?.source || null,
          original: d.originalimage?.source || null,
          width: d.originalimage?.width || 0,
          url: d.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          lang,
        };
      } catch {
        res = null;
      }
      cacheSet(key, res);
    }
    if (res && res.thumb) return res;
  }
  return null;
}

/** Sucht frei lizenzierte Fotos auf Wikimedia Commons. */
export async function commonsSearch(query, { limit = 24, offset = 0, width = 500 } = {}) {
  const key = `cs:${query}:${limit}:${offset}:${width}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6',
    gsrlimit: String(limit), gsroffset: String(offset),
    prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: String(width),
    iiextmetadatafilter: 'Artist|LicenseShortName|ImageDescription|ObjectName|Credit',
  });
  const d = await fetchJSON('https://commons.wikimedia.org/w/api.php?' + params);
  const pages = Object.values(d.query?.pages || {}).sort((a, b) => a.index - b.index);
  const items = pages.map((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii || !ii.thumburl) return null;
    const md = ii.extmetadata || {};
    const desc = stripHtml(md.ImageDescription?.value || md.ObjectName?.value || p.title.replace(/^File:|\.\w+$/g, ''));
    return {
      title: p.title.replace(/^File:/, '').replace(/\.\w+$/, '').replace(/_/g, ' '),
      desc: desc.length > 220 ? desc.slice(0, 217) + '…' : desc,
      thumb: ii.thumburl,
      large: ii.width > 1280 ? resizeThumb(ii.thumburl, 1280) : ii.url,
      w: ii.thumbwidth, h: ii.thumbheight,
      artist: stripHtml(md.Artist?.value || 'Unbekannt').slice(0, 80),
      license: stripHtml(md.LicenseShortName?.value || ''),
      page: ii.descriptionurl,
    };
  }).filter(Boolean);
  const res = { items, next: d.continue?.gsroffset ?? null };
  cacheSet(key, res);
  return res;
}

export function creditHtml(item) {
  return `Foto: ${esc(item.artist)}${item.license ? ' · ' + esc(item.license) : ''} · <a href="${esc(item.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
}

// ---------------------------------------------------------------------------
// Lazy-Loading: Elemente mit data-wiki="en:Leopard 2|de:Leopard 2" oder
// data-commons="Suchbegriff" bekommen ihr Bild, sobald sie sichtbar werden.
// ---------------------------------------------------------------------------

let io;
function observer() {
  if (io) return io;
  io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); fill(e.target); }
      }, { rootMargin: '300px' })
    : { observe: fill, unobserve() {} };
  return io;
}

export function hydrateImages(root = document) {
  root.querySelectorAll('[data-wiki]:not([data-hydrated]), [data-commons]:not([data-hydrated])').forEach((el) => {
    el.dataset.hydrated = '1';
    observer().observe(el);
  });
}

async function fill(el) {
  const img = el.querySelector('img') || el.insertBefore(document.createElement('img'), el.firstChild);
  img.alt = img.alt || el.dataset.alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  const width = Number(el.dataset.width || 500);
  try {
    let src, credit;
    if (el.dataset.wiki) {
      const s = await wikiSummary(el.dataset.wiki);
      if (!s) throw new Error('kein Bild');
      src = s.width && s.width <= width ? s.original : resizeThumb(s.thumb, width);
      credit = `Bild: <a href="${esc(s.url)}" target="_blank" rel="noopener">Wikipedia/Wikimedia Commons</a>`;
      img.onerror = () => { if (img.src !== s.thumb) img.src = s.thumb; };
    } else {
      const idx = Number(el.dataset.idx || 0);
      const r = await commonsSearch(el.dataset.commons, { limit: Math.max(6, idx + 1), width });
      const it = r.items[idx] || r.items[0];
      if (!it) throw new Error('kein Bild');
      src = it.thumb;
      credit = creditHtml(it);
    }
    img.onload = () => img.classList.add('loaded');
    img.src = src;
    if (el.dataset.credit !== 'off') {
      const c = document.createElement('div');
      c.className = 'credit';
      c.innerHTML = credit;
      el.appendChild(c);
    }
  } catch {
    el.classList.add('img-failed');
  }
}
