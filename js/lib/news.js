// Nachrichtenquellen zur Bundeswehr.
// Reihenfolge: tagesschau-API → Google-News-RSS (über rss2json) → Offline-Hinweise.

import { fetchJSON, stripHtml } from './util.js';

const CACHE_MIN = 10;

function cached(key) {
  try {
    const v = JSON.parse(sessionStorage.getItem('news:' + key) || 'null');
    if (v && Date.now() - v.t < CACHE_MIN * 60000) return v.items;
  } catch { /* egal */ }
  return null;
}
function save(key, items) {
  try { sessionStorage.setItem('news:' + key, JSON.stringify({ t: Date.now(), items })); } catch { /* egal */ }
}

async function fromTagesschau(q) {
  const d = await fetchJSON(`https://www.tagesschau.de/api2u/search/?searchText=${encodeURIComponent(q)}&resultPage=0&pageSize=30`);
  return (d.searchResults || []).filter((r) => r.title).map((r) => ({
    title: r.title,
    desc: stripHtml(r.firstSentence || r.topline || ''),
    url: r.shareURL || r.detailsweb || r.details,
    date: r.date,
    source: 'tagesschau',
    image: r.teaserImage?.imageVariants?.['16x9-640'] || r.teaserImage?.imageVariants?.['16x9-512'] || null,
    topline: r.topline || '',
  }));
}

async function fromRss(rssUrl, sourceName) {
  const d = await fetchJSON(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
  if (d.status !== 'ok') throw new Error('rss2json: ' + d.message);
  return (d.items || []).map((it) => {
    let src = sourceName;
    let title = it.title;
    // Google News hängt „ - Quelle“ an den Titel
    const m = / - ([^-]+)$/.exec(title);
    if (sourceName === 'Google News' && m) { src = m[1].trim(); title = title.slice(0, m.index); }
    const img = it.thumbnail || it.enclosure?.link || null;
    return {
      title, desc: stripHtml(it.description).slice(0, 260), url: it.link, date: it.pubDate?.replace(' ', 'T') + 'Z',
      source: src, image: img && /\.(jpe?g|png|webp)/i.test(img) ? img : null, topline: '',
    };
  });
}

export const NEWS_FILTER = [
  { id: 'alle', label: 'Alle', q: 'Bundeswehr' },
  { id: 'heer', label: 'Heer', q: 'Bundeswehr Heer' },
  { id: 'luftwaffe', label: 'Luftwaffe', q: 'Luftwaffe Bundeswehr' },
  { id: 'marine', label: 'Marine', q: 'Deutsche Marine' },
  { id: 'einsatz', label: 'Einsätze', q: 'Bundeswehr Einsatz' },
  { id: 'ruestung', label: 'Beschaffung', q: 'Bundeswehr Beschaffung' },
  { id: 'wehrdienst', label: 'Wehrdienst', q: 'Wehrdienst' },
  { id: 'nato', label: 'NATO', q: 'NATO Bundeswehr' },
  { id: 'litauen', label: 'Litauen-Brigade', q: 'Brigade Litauen Bundeswehr' },
];

export async function loadNews(q = 'Bundeswehr') {
  const c = cached(q);
  if (c) return { items: c, live: true };

  const tries = [
    () => fromTagesschau(q),
    () => fromRss(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=de&gl=DE&ceid=DE:de`, 'Google News'),
  ];
  const all = [];
  for (const t of tries) {
    try {
      const items = await t();
      if (items.length) all.push(...items);
      if (all.length >= 12) break;
    } catch { /* nächste Quelle */ }
  }
  if (all.length) {
    const seen = new Set();
    const items = all
      .filter((i) => { const k = i.title.toLowerCase().slice(0, 60); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    save(q, items);
    return { items, live: true };
  }
  return { items: OFFLINE, live: false };
}

/** Feste Einstiegspunkte, falls keine Live-Daten geladen werden können. */
export const OFFLINE = [
  { title: 'Aktuelles direkt auf bundeswehr.de', desc: 'Pressemitteilungen, Reportagen und Meldungen aus allen Teilstreitkräften – die offizielle Quelle.', url: 'https://www.bundeswehr.de/de/aktuelles', source: 'bundeswehr.de', date: null },
  { title: 'Meldungen des Verteidigungsministeriums', desc: 'Aktuelle Themen, Reden und Entscheidungen des BMVg.', url: 'https://www.bmvg.de/de/aktuelles', source: 'bmvg.de', date: null },
  { title: 'tagesschau: Thema Bundeswehr', desc: 'Nachrichten, Hintergründe und Analysen zur Bundeswehr.', url: 'https://www.tagesschau.de/thema/bundeswehr', source: 'tagesschau.de', date: null },
  { title: 'Bundeswehr-Karriere: Neuigkeiten zum Wehrdienst', desc: 'Alles zum neuen Wehrdienst, Einstellung und Bewerbung.', url: 'https://www.bundeswehrkarriere.de', source: 'bundeswehrkarriere.de', date: null },
  { title: 'Deutscher Bundestag: Verteidigungsausschuss', desc: 'Parlamentarische Kontrolle der Parlamentsarmee: Tagesordnungen und Beschlüsse.', url: 'https://www.bundestag.de/ausschuesse/a12_verteidigung', source: 'bundestag.de', date: null },
  { title: 'Wehrbeauftragte des Deutschen Bundestages', desc: 'Jahresberichte und Stellungnahmen zur Lage der Truppe.', url: 'https://www.bundestag.de/parlament/wehrbeauftragter', source: 'bundestag.de', date: null },
];
