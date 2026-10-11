// Kleine Helfer, die von allen Ansichten genutzt werden.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Entfernt HTML-Tags aus fremden Texten (z. B. RSS-Beschreibungen). */
export function stripHtml(s) {
  const d = document.createElement('div');
  d.innerHTML = String(s ?? '');
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
}

export const rand = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export const store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('bw:' + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('bw:' + key, JSON.stringify(value)); } catch { /* privater Modus o. Ä. */ }
  },
  del(key) { try { localStorage.removeItem('bw:' + key); } catch { /* egal */ } },
};

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

export function fmtDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return '';
  const diff = (Date.now() - date) / 1000;
  if (diff < 3600) return `vor ${Math.max(1, Math.round(diff / 60))} Min.`;
  if (diff < 86400) return `vor ${Math.round(diff / 3600)} Std.`;
  if (diff < 86400 * 7) return `vor ${Math.round(diff / 86400)} Tagen`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const fmtNum = (n) => Number(n).toLocaleString('de-DE');

/** fetch mit Zeitlimit. */
export async function fetchJSON(url, { timeout = 9000, ...opts } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

/** Rendert einen Platzhalter mit Tarnmuster, falls kein Bild geladen werden kann. */
export function placeholder(label, icon = 'image') {
  return `<div class="ph camo"><div>${ICONS[icon] || ICONS.image}<div>${esc(label)}</div></div></div>`;
}

export const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  news: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
  gallery: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>',
  tank: '<svg viewBox="0 0 24 24"><rect x="3" y="12" width="18" height="6" rx="3"/><path d="M7 12V9h8l2 3"/><path d="M15 10h7"/><circle cx="7" cy="15" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="17" cy="15" r="1"/></svg>',
  jet: '<svg viewBox="0 0 24 24"><path d="M12 2c1 1 1.5 3 1.5 6l7 5v2l-7-2v5l2.5 2v1.5L12 20l-4 1.5V20l2.5-2v-5l-7 2v-2l7-5c0-3 .5-5 1.5-6z"/></svg>',
  ship: '<svg viewBox="0 0 24 24"><path d="M3 15h18l-2.5 4.5h-13z"/><path d="M6 15V11h12v4"/><path d="M10 11V7h4v4"/><path d="M12 7V4"/></svg>',
  rifle: '<svg viewBox="0 0 24 24"><path d="M2 10h15l3-2h2v4h-6l-2 1v4h-3l-1-3H6l-2 3H2z"/></svg>',
  career: '<svg viewBox="0 0 24 24"><path d="M4 20 12 4l8 16"/><path d="M7 14h10"/><path d="M9 18h6"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  more: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  quiz: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7v.5"/><path d="M12 17h.01"/></svg>',
  run: '<svg viewBox="0 0 24 24"><circle cx="14" cy="4.5" r="2"/><path d="m6 20 3-6 3 2v5"/><path d="m9 14 1-5 4 1 3 3"/><path d="M10 9 7 10l-2 3"/></svg>',
  radio: '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="13" rx="1"/><path d="M8 8 16 3"/><circle cx="12" cy="15" r="3"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>',
  heli: '<svg viewBox="0 0 24 24"><path d="M2 5h20M12 5v4"/><path d="M5 13c0-2 2-4 5-4h4c3 0 5 2 5 4s-2 3-5 3h-4c-3 0-5-1-5-3z"/><path d="M19 13h3M8 16l-1 3h10l-1-3"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>',
};
