// Service Worker: App-Shell offline, Bilder und API-Antworten im Laufzeit-Cache.
const VERSION = 'bw-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css', 'icons/icon.svg',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'js/app.js', 'js/lib/util.js', 'js/lib/wiki.js', 'js/lib/news.js',
  'js/data/standorte.js', 'js/data/geraete.js', 'js/data/wissen.js',
  'js/views/home.js', 'js/views/news.js', 'js/views/karte.js', 'js/views/galerie.js', 'js/views/arsenal.js',
  'js/views/karriere.js', 'js/views/gefecht.js', 'js/views/quiz.js', 'js/views/dienstgrade.js',
  'js/views/einsaetze.js', 'js/views/geschichte.js', 'js/views/fitness.js', 'js/views/funk.js',
  'js/views/massband.js', 'js/views/lexikon.js', 'js/views/mehr.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trim(cacheName, max) {
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // App-Shell: Netzwerk zuerst (damit Updates sofort ankommen), sonst Cache
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
    return;
  }

  // Bilder & Kartenkacheln: Cache zuerst
  if (/upload\.wikimedia\.org|basemaps\.cartocdn\.com/.test(url.host) || req.destination === 'image') {
    e.respondWith(caches.open(VERSION + '-img').then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trim(VERSION + '-img', 400); }
        return res;
      } catch { return hit || Response.error(); }
    }));
    return;
  }

  // APIs (Wikipedia, Commons, News): Netzwerk zuerst, Fallback Cache
  if (/wikipedia\.org|wikimedia\.org|tagesschau\.de|rss2json\.com/.test(url.host)) {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(VERSION + '-api').then((c) => { c.put(req, copy); trim(VERSION + '-api', 200); });
      return res;
    }).catch(() => caches.match(req)));
  }
});
