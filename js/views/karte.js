import { esc, $, $$ } from '../lib/util.js';
import { STANDORTE, TSK } from '../data/standorte.js';
import { EINSAETZE } from '../data/wissen.js';

export async function render(el, params) {
  const showEinsaetze = params[0] === 'einsaetze';
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Lage</span>
      <h1>Standorte der Bundeswehr</h1>
      <hr class="rule">
      <p>${STANDORTE.length} wichtige Standorte von Heer, Luftwaffe, Marine, CIR, Sanitätsdienst und Unterstützungsbereich – dazu Schulen, Kommandos und Auslandsstandorte. Tippe auf einen Punkt für Details.</p>
    </div>
    <div class="section map-tools">
      <div class="chips chip-scroll" id="tskFilter">
        <button class="chip active" data-tsk="">Alle</button>
        ${Object.entries(TSK).map(([k, v]) => `<button class="chip" data-tsk="${k}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${v.color};margin-right:6px"></span>${esc(v.name)}</button>`).join('')}
        <button class="chip ${showEinsaetze ? 'active' : ''}" id="toggleEinsatz">🌍 Auslandseinsätze</button>
      </div>
      <input class="input" id="mapSearch" type="search" placeholder="Ort, Einheit oder Bundesland suchen …" aria-label="Standorte durchsuchen">
    </div>
    <div class="section map-layout">
      <div class="map-wrap"><div id="map" role="application" aria-label="Karte der Standorte"></div></div>
      <div class="card map-list" id="mapList"></div>
    </div>`;

  if (!window.L) {
    $('#map', el).innerHTML = '<div class="notice" style="margin:20px">Die Kartenbibliothek konnte nicht geladen werden.</div>';
    return;
  }
  const L = window.L;
  const map = L.map($('#map', el), { zoomControl: true, worldCopyJump: true }).setView([51.2, 10.4], 6);
  const dark = document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_all' : 'voyager'}/{z}/{x}/{y}{r}.png`, {
    maxZoom: 18, subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  const icon = (color, ausland) => L.divIcon({ className: '', html: `<div class="pin ${ausland ? 'ausland' : ''}" style="background:${color}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
  const markers = STANDORTE.map((s, i) => {
    const m = L.marker([s.lat, s.lng], { icon: icon(TSK[s.tsk].color, s.tsk === 'ausland'), title: s.name });
    m.bindPopup(`<h4>${esc(s.name)}</h4><span class="badge" style="background:${TSK[s.tsk].color};color:${s.tsk === 'ministerium' ? '#111' : '#fff'}">${esc(TSK[s.tsk].name)}</span> <span class="small muted">${esc(s.land)}</span><ul>${s.units.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>`);
    m._idx = i;
    return m;
  });
  const layer = L.layerGroup(markers).addTo(map);

  const einsatzLayer = L.layerGroup(EINSAETZE.map((e) => {
    const c = e.status === 'beendet' ? '#888' : '#ff3b3b';
    return L.circleMarker([e.lat, e.lng], { radius: 10, color: '#fff', weight: 2, fillColor: c, fillOpacity: .9 })
      .bindPopup(`<h4>${esc(e.name)}</h4><span class="badge ausland" style="${e.status === 'beendet' ? 'background:#666' : ''}">${esc(e.status)}</span> <span class="small muted">${esc(e.ort)} · ${esc(e.seit)}</span><p style="margin:6px 0 0">${esc(e.text)}</p>`);
  }));

  let tsk = '', q = '';
  function apply() {
    const visible = [];
    markers.forEach((m) => {
      const s = STANDORTE[m._idx];
      const hay = `${s.name} ${s.land} ${s.units.join(' ')} ${TSK[s.tsk].name}`.toLowerCase();
      const ok = (!tsk || s.tsk === tsk) && (!q || hay.includes(q));
      if (ok) { layer.addLayer(m); visible.push(m); } else layer.removeLayer(m);
    });
    $('#mapList', el).innerHTML = `<div class="card-body small muted" style="padding:10px 14px">${visible.length} Standorte</div>` +
      visible.sort((a, b) => STANDORTE[a._idx].name.localeCompare(STANDORTE[b._idx].name, 'de')).map((m) => {
        const s = STANDORTE[m._idx];
        return `<button data-i="${m._idx}"><b><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TSK[s.tsk].color};margin-right:6px"></span>${esc(s.name)}</b><span>${esc(s.units[0])}${s.units.length > 1 ? ` · +${s.units.length - 1}` : ''}</span></button>`;
      }).join('');
    $$('#mapList button', el).forEach((b) => b.addEventListener('click', () => {
      const m = markers[Number(b.dataset.i)];
      map.flyTo(m.getLatLng(), 10, { duration: .8 });
      setTimeout(() => m.openPopup(), 850);
      if (innerWidth < 900) $('#map', el).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
    if (q && visible.length && visible.length < 15) map.fitBounds(L.latLngBounds(visible.map((m) => m.getLatLng())).pad(0.3), { maxZoom: 9 });
  }

  $$('#tskFilter .chip[data-tsk]', el).forEach((b) => b.addEventListener('click', () => {
    $$('#tskFilter .chip[data-tsk]', el).forEach((x) => x.classList.toggle('active', x === b));
    tsk = b.dataset.tsk;
    apply();
    if (tsk === 'ausland') map.setView([45, 5], 3);
  }));
  let einsatzOn = false;
  const setEinsatz = (on) => {
    einsatzOn = on;
    $('#toggleEinsatz', el).classList.toggle('active', on);
    if (on) { einsatzLayer.addTo(map); map.setView([42, 20], 3); } else map.removeLayer(einsatzLayer);
  };
  $('#toggleEinsatz', el).addEventListener('click', () => setEinsatz(!einsatzOn));
  let t;
  $('#mapSearch', el).addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.trim().toLowerCase(); apply(); }, 150); });

  apply();
  if (showEinsaetze) setEinsatz(true);
  setTimeout(() => map.invalidateSize(), 100);

  return () => map.remove();
}
