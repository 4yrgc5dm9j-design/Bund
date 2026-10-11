// Gefechtssimulator: rundenbasiertes Taktikspiel auf Kompanie-Ebene.
// Eigene Kräfte (Blau) mit Waffensystemen der Bundeswehr gegen fiktive Feindkräfte (Rot).
// Vereinfachte Regeln: Bewegungspunkte, Gelände, Deckung, Sichtlinien, Aufklärung, Erwiderungsfeuer.

import { esc, $, clamp, rand, store } from '../lib/util.js';

const CELL = 48, COLS = 16, ROWS = 11;

// Geländetypen: cost = Bewegungskosten (×2), cover = Deckung, block = blockiert Sicht
const TERRAIN = {
  '.': { name: 'Offenes Gelände', cost: 2, cover: 0, block: false },
  '=': { name: 'Straße', cost: 1.5, cover: 0, block: false },
  W: { name: 'Wald', cost: 4, cover: 0.3, block: true },
  S: { name: 'Ortschaft', cost: 3, cover: 0.45, block: true },
  H: { name: 'Anhöhe', cost: 3, cover: 0.2, block: false, sight: 2 },
  '~': { name: 'Gewässer', cost: 99, cover: 0, block: false },
  B: { name: 'Brücke', cost: 1.5, cover: 0, block: false },
  O: { name: 'Gefechtsziel', cost: 2, cover: 0.1, block: false },
};

// Einheiten. hard/soft = Wirkung gegen gepanzerte/ungepanzerte Ziele
const TYPES = {
  leo: { name: 'Leopard 2A7V', sym: 'armor', hp: 10, mv: 4, rng: 4, sight: 4, hard: 9, soft: 6, armor: 'hard', info: 'Kampfpanzer – stärkste Feuerkraft gegen Panzer, hoher Schutz.' },
  puma: { name: 'Puma', sym: 'mech', hp: 8, mv: 4, rng: 3, sight: 4, hard: 6, soft: 7, armor: 'hard', info: 'Schützenpanzer mit 30-mm-Kanone und MELLS-Panzerabwehr.' },
  jaeger: { name: 'Jägergruppe', sym: 'inf', hp: 6, mv: 2, rng: 2, sight: 3, hard: 5, soft: 5, armor: 'soft', info: 'Infanterie mit Panzerfaust 3 – stark in Wald und Ortschaft.' },
  pzh: { name: 'PzH 2000', sym: 'art', hp: 6, mv: 3, rng: 9, minRng: 2, sight: 2, hard: 6, soft: 8, armor: 'hard', indirect: true, info: 'Panzerhaubitze – Steilfeuer ohne Sichtlinie auf aufgeklärte Ziele. Feuern ODER bewegen.' },
  fennek: { name: 'Fennek', sym: 'recon', hp: 4, mv: 6, rng: 2, sight: 6, hard: 2, soft: 3, armor: 'soft', stealth: true, info: 'Spähwagen – große Sichtweite, wird erst auf 2 Felder entdeckt.' },
  tiger: { name: 'Tiger UHT', sym: 'heli', hp: 6, mv: 7, rng: 5, sight: 5, hard: 8, soft: 5, armor: 'air', fly: true, info: 'Kampfhubschrauber – ignoriert Gelände, verwundbar durch Flugabwehr.' },
  // Rot (fiktiver Gegner)
  rkpz: { name: 'Feind-Kampfpanzer', sym: 'armor', hp: 9, mv: 4, rng: 4, sight: 4, hard: 8, soft: 6, armor: 'hard' },
  rspz: { name: 'Feind-Schützenpanzer', sym: 'mech', hp: 7, mv: 4, rng: 3, sight: 4, hard: 5, soft: 6, armor: 'hard' },
  rinf: { name: 'Feind-Infanterie', sym: 'inf', hp: 6, mv: 2, rng: 2, sight: 3, hard: 4, soft: 5, armor: 'soft' },
  rart: { name: 'Feind-Artillerie', sym: 'art', hp: 5, mv: 2, rng: 9, minRng: 2, sight: 2, hard: 5, soft: 7, armor: 'hard', indirect: true },
  raa: { name: 'Feind-Flugabwehr', sym: 'aa', hp: 5, mv: 3, rng: 5, sight: 5, hard: 2, soft: 3, air: 12, armor: 'hard' },
};

const SCENARIOS = [
  {
    id: 'verzoegerung', name: 'Verteidigung am Fluss', kind: 'defend', turns: 12,
    brief: 'Feindliche mechanisierte Kräfte greifen von Osten an. Halte die Ortschaft (★) 12 Runden lang. Der Fluss ist nur über die Brücken passierbar – nutze das! Feindliche Verstärkungen treffen in Runde 3 und 6 ein.',
    map: [
      'WWW...HH..~..WW.',
      'WW.....H..~...W.',
      '==S=======B=====',
      '.SS....W..~.....',
      '.SO...WW..~...H.',
      '.SS...WW..~..HH.',
      '..S....W..~.....',
      '...WW.....~..W..',
      '==========B=====',
      '...WW.HH..~...WW',
      '....W.H...~...WW',
    ],
    blue: [['leo', 4, 3], ['leo', 4, 6], ['puma', 6, 2], ['jaeger', 2, 3], ['jaeger', 2, 5], ['pzh', 0, 7], ['fennek', 8, 4]],
    red: [['rkpz', 13, 2], ['rkpz', 14, 8], ['rspz', 13, 4], ['rspz', 14, 6], ['rinf', 15, 3]],
    waves: { 3: [['rkpz', 15, 2], ['rspz', 15, 8], ['rart', 15, 5]], 6: [['rkpz', 15, 4], ['rkpz', 15, 7], ['rinf', 15, 9], ['raa', 15, 1]] },
  },
  {
    id: 'angriff', name: 'Angriff auf die Ortschaft', kind: 'attack', turns: 14,
    brief: 'Der Feind hat sich in einer Ortschaft im Osten eingegraben. Nimm das Gefechtsziel (★) und halte es frei von Feind. Klär mit dem Fennek auf, lass die PzH 2000 wirken und greif dann konzentriert an. Achtung: Flugabwehr schützt den Ort.',
    map: [
      '..WW.....WWW....',
      '..WW..H...WW.SS.',
      '......HH....SSS.',
      '=======.....SOS=',
      '......=====SSSS.',
      '...W.......=S...',
      '..WWW..H...=....',
      '..WW...HH..=.WW.',
      '...........=.WW.',
      '..~~~~.....=....',
      '.~~~~~.....=....',
    ],
    blue: [['leo', 1, 3], ['leo', 1, 5], ['puma', 2, 4], ['puma', 2, 6], ['jaeger', 0, 4], ['jaeger', 0, 6], ['pzh', 0, 1], ['fennek', 3, 8], ['tiger', 0, 9]],
    red: [['rinf', 12, 3, 1], ['rinf', 13, 4, 1], ['rspz', 14, 2, 1], ['rkpz', 11, 1, 1], ['rkpz', 13, 7, 1], ['raa', 14, 4, 1], ['rart', 15, 0, 1], ['rspz', 12, 5, 1]],
    waves: {},
  },
  {
    id: 'bruecke', name: 'Brückenkopf bilden', kind: 'bridge', turns: 14,
    brief: 'Überwinde den Fluss über die einzige Brücke und bilde am Nordufer einen Brückenkopf: Halte das Gefechtsziel (★) am Ende zweier aufeinanderfolgender Runden. Der Hubschrauber Tiger kann den Fluss überfliegen.',
    map: [
      'WW....S=S...WW..',
      'W.....S=S....W..',
      '...H...=....H...',
      '..HH...O...HH..W',
      'W......=.....WWW',
      '~~~~~~~B~~~~~~~~',
      'WW.....=......W.',
      'WWW....=...WW...',
      '..H....=....W...',
      '.......=........',
      '===============.',
    ],
    blue: [['leo', 3, 9], ['leo', 10, 9], ['puma', 6, 8], ['puma', 8, 9], ['jaeger', 5, 7], ['jaeger', 9, 7], ['pzh', 7, 10], ['fennek', 4, 6], ['tiger', 12, 10]],
    red: [['rkpz', 6, 1, 1], ['rkpz', 12, 3, 1], ['rspz', 8, 2, 1], ['rinf', 6, 0, 1], ['rinf', 8, 1, 1], ['raa', 3, 2, 1], ['rart', 14, 0, 1]],
    waves: { 5: [['rkpz', 0, 2], ['rkpz', 15, 2]], 9: [['rspz', 0, 0], ['rinf', 15, 0]] },
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dist = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export async function render(el) {
  let sc = SCENARIOS[0];
  let G = null; // Spielzustand
  let raf = 0, alive = true;
  const fx = []; // Effekte {type, x1,y1,x2,y2, t0, dur}

  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Simulation</span>
      <h1>Gefechtssimulator</h1>
      <hr class="rule">
      <p>Führe eine gemischte Kampfgruppe aus Leopard 2, Puma, Jägern, Panzerhaubitze, Fennek und Tiger. Nutze Gelände, Aufklärung und Feuerunterstützung – wie im Gefechtsübungszentrum, nur am Bildschirm. Die Gegnerkräfte sind fiktiv.</p>
    </div>
    <div class="section grid cols-3" id="scList">
      ${SCENARIOS.map((s, i) => `<div class="card scenario-card ${i ? '' : 'active'}" data-i="${i}"><div class="card-body"><span class="badge">${s.kind === 'defend' ? 'Verteidigung' : s.kind === 'attack' ? 'Angriff' : 'Gewässerübergang'}</span><h3 style="margin-top:8px">${esc(s.name)}</h3><p class="small muted" style="margin:0">${esc(s.brief)}</p><p class="small" style="margin:8px 0 0">Bestwert: <b data-best="${s.id}">${store.get('gefecht:' + s.id, '–')}</b></p></div></div>`).join('')}
    </div>
    <div class="sim-grid section">
      <div>
        <div class="battle-wrap">
          <div class="battle-hud"><span>Runde <b id="hTurn">1</b>/<b id="hMax"></b></span><span id="hPhase">Eigene Phase</span><span>Blau <b id="hBlue"></b> · Rot (aufgeklärt) <b id="hRed"></b></span></div>
          <canvas id="bf" width="${COLS * CELL}" height="${ROWS * CELL}" aria-label="Gefechtsfeld"></canvas>
          <div class="overlay-msg hidden" id="overlay"></div>
        </div>
        <div class="chips" style="margin-top:12px">
          <button class="btn" id="endTurn">Runde beenden ▶</button>
          <button class="btn secondary" id="nextUnit">Nächste Einheit</button>
          <button class="btn secondary" id="restart">Neustart</button>
        </div>
      </div>
      <aside class="sim-panel">
        <h3>Lage</h3>
        <div id="unitInfo" class="small muted">Wähle eine eigene Einheit (blaues Symbol) aus. Grüne Felder = Bewegung, rote Rahmen = bekämpfbare Ziele.</div>
        <div id="cellInfo" class="small muted" style="margin-top:8px"></div>
        <div class="log" id="blog"></div>
        <details style="margin-top:12px"><summary class="small"><b>Regeln &amp; Legende</b></summary>
          <ul class="small" style="padding-left:18px">
            <li>Jede Einheit darf pro Runde einmal ziehen und einmal feuern (PzH 2000: entweder oder).</li>
            <li>Wald und Ortschaft geben Deckung und blockieren die Sicht. Anhöhen erhöhen die Sichtweite.</li>
            <li>Feinde sind nur sichtbar, wenn eine eigene Einheit sie aufklärt.</li>
            <li>Getroffene Einheiten erwidern das Feuer, wenn sie können.</li>
            <li>Blaue Rechtecke = eigene Kräfte, rote Rauten = Feind (NATO-Taktische Zeichen).</li>
          </ul>
        </details>
      </aside>
    </div>`;

  const cv = $('#bf', el);
  const ctx = cv.getContext('2d');
  const log = (t, c = '') => { const b = $('#blog', el); b.insertAdjacentHTML('afterbegin', `<div class="${c}">R${G.turn}: ${esc(t)}</div>`); };

  // ---------------------------------------------------------------- Setup
  function setup() {
    const map = sc.map.map((r) => r.split(''));
    let uid = 0;
    const mk = (side) => ([t, x, y, hold]) => ({ id: uid++, t, side, x, y, hp: TYPES[t].hp, moved: false, fired: false, hold: !!hold, px: x, py: y });
    G = {
      map, units: [...sc.blue.map(mk('blue')), ...sc.red.map(mk('red'))], turn: 1, sel: null, reach: null, targets: [],
      busy: false, over: false, kills: 0, losses: 0, holdCount: 0, mkUnit: mk('red'),
    };
    $('#blog', el).innerHTML = '';
    $('#overlay', el).classList.add('hidden');
    log(`Auftrag: ${sc.brief}`);
    terrainCv = document.createElement('canvas');
    terrainCv.width = COLS * CELL; terrainCv.height = ROWS * CELL;
    drawTerrain(terrainCv.getContext('2d'));
    updateVis();
    hud();
  }
  let terrainCv = null, fogCells = [];

  const terr = (x, y) => TERRAIN[G.map[y]?.[x]] || TERRAIN['.'];
  const unitAt = (x, y) => G.units.find((u) => u.hp > 0 && u.x === x && u.y === y);
  const inside = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;

  // Sichtlinie (Bresenham), Zwischenfelder mit block=true unterbrechen
  function los(a, b) {
    if (TYPES[a.t]?.fly || TYPES[b.t]?.fly) return true;
    let x0 = a.x, y0 = a.y; const x1 = b.x, y1 = b.y;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (!(x0 === x1 && y0 === y1)) {
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
      if (x0 === x1 && y0 === y1) break;
      if (terr(x0, y0).block) {
        // vom Hügel aus sieht man über eine Deckung hinweg (nur direkt angrenzend nicht)
        if (G.map[a.y][a.x] === 'H' && dist(a, { x: x0, y: y0 }) > 1) continue;
        return false;
      }
    }
    return true;
  }
  function sightOf(u) { return TYPES[u.t].sight + (terr(u.x, u.y).sight || 0); }
  function canSee(viewer, target) {
    const d = dist(viewer, target);
    let range = sightOf(viewer);
    if (TYPES[target.t].stealth) range = Math.min(range, 2);
    if (target.hp > 0 && terr(target.x, target.y).block && TYPES[target.t].armor === 'soft') range = Math.min(range, 3);
    return d <= range && los(viewer, target);
  }
  function updateVis() {
    const blues = G.units.filter((u) => u.side === 'blue' && u.hp > 0);
    G.units.forEach((u) => { if (u.side === 'red') u.seen = u.hp > 0 && blues.some((b) => canSee(b, u)); });
    fogCells = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const cell = { x, y, t: 'leo' };
      if (!blues.some((b) => dist(b, cell) <= sightOf(b) && los(b, cell))) fogCells.push([x, y]);
    }
  }

  // Erreichbare Felder (Dijkstra)
  function reachable(u) {
    const T = TYPES[u.t];
    const mp = T.mv * 2;
    const best = new Map([[`${u.x},${u.y}`, 0]]);
    const q = [[0, u.x, u.y]];
    while (q.length) {
      q.sort((a, b) => a[0] - b[0]);
      const [c, x, y] = q.shift();
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny)) continue;
        const cost = T.fly ? 2 : terr(nx, ny).cost;
        const nc = c + cost + (dx && dy ? 0.5 : 0);
        if (nc > mp) continue;
        const occ = unitAt(nx, ny);
        if (occ && occ.side !== u.side) continue;
        const k = `${nx},${ny}`;
        if (best.has(k) && best.get(k) <= nc) continue;
        best.set(k, nc);
        q.push([nc, nx, ny]);
      }
    }
    best.delete(`${u.x},${u.y}`);
    return [...best.keys()].map((k) => k.split(',').map(Number)).filter(([x, y]) => !unitAt(x, y));
  }

  function canAttack(a, d, from = a) {
    const A = TYPES[a.t];
    const r = dist(from, d);
    if (r > A.rng || r < (A.minRng || 1)) return false;
    if (A.indirect) {
      // Steilfeuer: Ziel muss von irgendeiner eigenen Einheit aufgeklärt sein
      return a.side === 'blue' ? d.seen : G.units.some((u) => u.side === 'red' && u.hp > 0 && canSee(u, d));
    }
    if (TYPES[d.t].fly && !(A.air || A.rng >= 3)) return false;
    return los({ ...from, t: a.t }, d) && (a.side === 'blue' ? d.seen : canSee({ ...from, t: a.t }, d));
  }
  function hitChance(a, d, from = a) {
    const cov = TYPES[d.t].fly ? 0 : terr(d.x, d.y).cover + (TYPES[d.t].armor === 'soft' && terr(d.x, d.y).block ? 0.15 : 0);
    const hill = G.map[from.y][from.x] === 'H' ? 0.08 : 0;
    return clamp(0.88 - 0.05 * dist(from, d) - cov * 0.6 + hill, 0.15, 0.95);
  }
  function dmgOf(a, d) {
    const A = TYPES[a.t], D = TYPES[d.t];
    let base = D.armor === 'hard' ? A.hard : D.armor === 'air' ? (A.air || A.hard * 0.6) : A.soft;
    const cov = D.fly ? 0 : terr(d.x, d.y).cover;
    return Math.max(1, Math.round(base * rand(0.55, 1.15) * (1 - cov * 0.5)));
  }

  async function attack(a, d, counter = false) {
    a.fired = true;
    if (TYPES[a.t].indirect) a.moved = true;
    const p = hitChance(a, d);
    const hit = Math.random() < p;
    fx.push({ type: TYPES[a.t].indirect ? 'arc' : 'shot', x1: a.x, y1: a.y, x2: d.x, y2: d.y, t0: performance.now(), dur: TYPES[a.t].indirect ? 700 : 280, side: a.side });
    await sleep(TYPES[a.t].indirect ? 650 : 260);
    if (hit) {
      const dm = Math.round(dmgOf(a, d) * (counter ? 0.5 : 1)) || 1;
      d.hp = Math.max(0, d.hp - dm);
      fx.push({ type: 'boom', x1: d.x, y1: d.y, t0: performance.now(), dur: d.hp ? 450 : 900, big: !d.hp });
      log(`${TYPES[a.t].name} ${counter ? 'erwidert das Feuer auf' : 'bekämpft'} ${TYPES[d.t].name}: Treffer, −${dm}${d.hp ? '' : ' – vernichtet!'}`, a.side === 'blue' ? 'good' : 'bad');
      if (!d.hp) { if (d.side === 'red') G.kills++; else G.losses++; }
    } else {
      fx.push({ type: 'miss', x1: d.x, y1: d.y, t0: performance.now(), dur: 400 });
      log(`${TYPES[a.t].name} ${counter ? 'erwidert das Feuer' : 'feuert'} auf ${TYPES[d.t].name} – verfehlt (${Math.round(p * 100)} %).`);
    }
    // Erwiderungsfeuer
    if (!counter && d.hp > 0 && !TYPES[d.t].indirect && !TYPES[a.t].indirect) {
      const T = TYPES[d.t];
      if (dist(a, d) <= T.rng && los(d, a) && !(TYPES[a.t].fly && !(T.air || T.rng >= 3))) {
        await sleep(200);
        await attack(d, a, true);
      }
    }
    updateVis();
    hud();
  }

  async function moveUnit(u, x, y) {
    const sx = u.x, sy = u.y;
    u.x = x; u.y = y; u.moved = true;
    const t0 = performance.now(), dur = 260;
    while (performance.now() - t0 < dur) {
      const k = (performance.now() - t0) / dur;
      u.px = sx + (x - sx) * k; u.py = sy + (y - sy) * k;
      await sleep(16);
    }
    u.px = x; u.py = y;
    updateVis();
  }

  // ---------------------------------------------------------------- Eingabe
  function select(u) {
    G.sel = u;
    if (!u) { G.reach = null; G.targets = []; showInfo(); return; }
    G.reach = u.moved ? [] : reachable(u);
    G.targets = u.fired || (TYPES[u.t].indirect && u.moved) ? [] : G.units.filter((d) => d.side === 'red' && d.hp > 0 && canAttack(u, d));
    showInfo();
  }

  function showInfo() {
    const u = G.sel;
    const box = $('#unitInfo', el);
    if (!u) { box.innerHTML = 'Wähle eine eigene Einheit (blaues Symbol) aus. Grüne Felder = Bewegung, rote Rahmen = bekämpfbare Ziele.'; return; }
    const T = TYPES[u.t];
    box.classList.remove('muted');
    box.innerHTML = `<div class="unit-info"><canvas width="60" height="44" id="symPrev"></canvas><div><b>${esc(T.name)}</b><br>Stärke ${u.hp}/${T.hp} · Bewegung ${T.mv} · Reichweite ${T.minRng ? T.minRng + '–' : ''}${T.rng} · Sicht ${sightOf(u)}</div></div><p style="margin:8px 0 0">${esc(T.info || '')}</p><p style="margin:6px 0 0">${u.moved ? '✔ bewegt' : '◻ kann ziehen'} · ${u.fired ? '✔ gefeuert' : '◻ kann feuern'}</p>`;
    const c2 = $('#symPrev', el).getContext('2d');
    drawSymbol(c2, 30, 22, u, 1);
  }

  cv.addEventListener('click', async (e) => {
    if (!G || G.busy || G.over) return;
    const r = cv.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * COLS);
    const y = Math.floor((e.clientY - r.top) / r.height * ROWS);
    if (!inside(x, y)) return;
    const u = unitAt(x, y);
    const t = terr(x, y);
    $('#cellInfo', el).textContent = `Feld ${String.fromCharCode(65 + x)}${y + 1}: ${t.name}${t.cover ? ` (Deckung ${Math.round(t.cover * 100)} %)` : ''}`;
    if (G.sel) {
      if (u && u.side === 'red' && G.targets.includes(u)) {
        G.busy = true; const s = G.sel; G.reach = null; G.targets = [];
        await attack(s, u);
        G.busy = false; select(s.hp > 0 ? s : null); checkEnd(); return;
      }
      if (!u && G.reach?.some(([a, b]) => a === x && b === y)) {
        G.busy = true; const s = G.sel; G.reach = null; G.targets = [];
        await moveUnit(s, x, y);
        G.busy = false; select(s); checkEnd(); return;
      }
    }
    if (u && u.side === 'blue') select(u);
    else if (u && u.side === 'red' && u.seen) {
      select(null);
      $('#unitInfo', el).innerHTML = `<b>${esc(TYPES[u.t].name)}</b> (aufgeklärt)<br>Geschätzte Stärke ${u.hp}/${TYPES[u.t].hp}`;
    } else select(null);
  });

  $('#nextUnit', el).addEventListener('click', () => {
    if (!G || G.busy) return;
    const list = G.units.filter((u) => u.side === 'blue' && u.hp > 0 && (!u.moved || !u.fired));
    if (!list.length) return;
    const i = (list.indexOf(G.sel) + 1) % list.length;
    select(list[i]);
  });
  $('#restart', el).addEventListener('click', () => { if (!G.busy) setup(); });
  $('#endTurn', el).addEventListener('click', () => { if (!G.busy && !G.over) enemyTurn(); });
  el.querySelectorAll('.scenario-card').forEach((c) => c.addEventListener('click', () => {
    if (G?.busy) return;
    el.querySelectorAll('.scenario-card').forEach((x) => x.classList.toggle('active', x === c));
    sc = SCENARIOS[Number(c.dataset.i)];
    setup();
    cv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));

  // ---------------------------------------------------------------- KI
  async function enemyTurn() {
    G.busy = true; select(null);
    $('#hPhase', el).textContent = 'Feindphase …';
    // Verstärkungen
    (sc.waves[G.turn] || []).forEach((w) => {
      const [t, x, y] = w;
      if (!unitAt(x, y)) { G.units.push(G.mkUnit(w)); }
    });
    if (sc.waves[G.turn]) log('Feindliche Verstärkungen werden gemeldet!', 'bad');

    const objs = objectives();
    const reds = G.units.filter((u) => u.side === 'red' && u.hp > 0);
    for (const r of reds) {
      if (r.hp <= 0 || G.over) continue;
      const blues = G.units.filter((u) => u.side === 'blue' && u.hp > 0);
      if (!blues.length) break;
      const known = blues.filter((b) => G.units.some((o) => o.side === 'red' && o.hp > 0 && canSee(o, b)));
      if (r.hold && !blues.some((b) => dist(b, r) <= 4)) continue; // eingegraben, wartet
      const T = TYPES[r.t];
      // 1) Direkt feuern, falls möglich
      let tgt = bestTarget(r, known, r);
      if (T.indirect) { if (tgt) await attack(r, tgt); continue; }
      // 2) Beste Stellung suchen
      const cand = [[r.x, r.y], ...reachable(r)];
      let best = null, bestScore = -1e9;
      for (const [x, y] of cand) {
        const from = { x, y, t: r.t };
        const t = bestTarget(r, known, from);
        let score = 0;
        if (t) score += 20 + (TYPES[t.t].hp - t.hp) * 2 + hitChance(r, t, from) * 20;
        score += terr(x, y).cover * 15;
        // Annäherung an Ziel/Feind
        const goal = sc.kind === 'defend' ? objs[0] : (known[0] || objs[0]);
        if (goal) score -= dist(from, goal) * (t ? 0.5 : 3);
        if (sc.kind === 'defend' && objs.some((o) => o.x === x && o.y === y)) score += 30;
        if (r.hold) score -= dist(from, r) * 4; // Verteidiger bleiben nah an der Stellung
        if (score > bestScore) { bestScore = score; best = [x, y]; }
      }
      if (best && (best[0] !== r.x || best[1] !== r.y)) await moveUnit(r, best[0], best[1]);
      tgt = bestTarget(r, known.filter((b) => b.hp > 0), r);
      if (tgt) await attack(r, tgt);
      await sleep(80);
    }
    G.units.filter((u) => u.side === 'red').forEach((u) => { u.moved = u.fired = false; });
    checkEnd(true);
    if (!G.over) {
      G.turn++;
      G.units.filter((u) => u.side === 'blue').forEach((u) => { u.moved = u.fired = false; });
      if (G.turn > sc.turns) return finish(sc.kind === 'defend', sc.kind === 'defend' ? 'Die Stellung wurde gehalten!' : 'Zeit abgelaufen – der Auftrag wurde nicht erfüllt.');
      log(`Runde ${G.turn} beginnt.`);
    }
    $('#hPhase', el).textContent = 'Eigene Phase';
    G.busy = false;
    updateVis(); hud();
  }

  function bestTarget(r, known, from) {
    let best = null, bs = -1;
    for (const b of known) {
      if (b.hp <= 0) continue;
      const T = TYPES[r.t];
      const d = dist(from, b);
      if (d > T.rng || d < (T.minRng || 1)) continue;
      if (!T.indirect && !los({ ...from, t: r.t }, b)) continue;
      if (TYPES[b.t].fly && !(T.air || T.rng >= 3)) continue;
      const s = hitChance(r, b, from) * (TYPES[b.t].armor === 'hard' ? T.hard : TYPES[b.t].armor === 'air' ? (T.air || T.hard * 0.6) : T.soft) + (TYPES[b.t].hp - b.hp);
      if (s > bs) { bs = s; best = b; }
    }
    return best;
  }

  function objectives() {
    const o = [];
    G.map.forEach((row, y) => row.forEach((c, x) => { if (c === 'O') o.push({ x, y }); }));
    return o;
  }

  function checkEnd(afterEnemy = false) {
    const blues = G.units.filter((u) => u.side === 'blue' && u.hp > 0);
    const reds = G.units.filter((u) => u.side === 'red' && u.hp > 0);
    const pendingWaves = Object.keys(sc.waves).some((t) => Number(t) > G.turn);
    if (!blues.length) return finish(false, 'Alle eigenen Kräfte sind ausgefallen.');
    if (!reds.length && !pendingWaves) return finish(true, 'Alle Feindkräfte wurden zerschlagen!');
    const o = objectives()[0];
    if (sc.kind === 'defend' && afterEnemy) {
      const occ = unitAt(o.x, o.y);
      if (occ && occ.side === 'red') return finish(false, 'Der Feind hat die Ortschaft genommen.');
    }
    if (sc.kind === 'attack' && !afterEnemy) {
      const occ = unitAt(o.x, o.y);
      if (occ && occ.side === 'blue' && !reds.some((r) => dist(r, o) <= 1)) return finish(true, 'Die Ortschaft ist genommen und feindfrei!');
    }
    if (sc.kind === 'bridge' && afterEnemy) {
      const occ = unitAt(o.x, o.y);
      if (occ && occ.side === 'blue') {
        G.holdCount++;
        log(`Brückenkopf gehalten (${G.holdCount}/2).`, 'good');
        if (G.holdCount >= 2) return finish(true, 'Der Brückenkopf steht!');
      } else G.holdCount = 0;
    }
  }

  function finish(win, msg) {
    G.over = true;
    const score = win ? Math.max(0, 1000 + G.kills * 100 - G.losses * 120 - G.turn * 20) : G.kills * 50;
    const stars = !win ? 0 : G.losses === 0 ? 3 : G.losses <= 2 ? 2 : 1;
    const prev = store.get('gefecht:' + sc.id, 0);
    if (score > prev) { store.set('gefecht:' + sc.id, score); const b = el.querySelector(`[data-best="${sc.id}"]`); if (b) b.textContent = score; }
    const ov = $('#overlay', el);
    ov.classList.remove('hidden');
    ov.innerHTML = `<div><h2>${win ? 'Auftrag erfüllt' : 'Auftrag gescheitert'}</h2><p>${esc(msg)}</p><p style="font-size:2rem;color:var(--gold);margin:0">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p><p>Feind vernichtet: ${G.kills} · Eigene Verluste: ${G.losses} · Runden: ${G.turn}<br>Punkte: <b>${score}</b>${score > prev ? ' – neuer Bestwert!' : ''}</p><button class="btn gold" id="ovAgain">Nochmal</button></div>`;
    $('#ovAgain', el).onclick = () => setup();
    log(msg, win ? 'good' : 'bad');
    G.busy = false;
  }

  function hud() {
    $('#hTurn', el).textContent = G.turn;
    $('#hMax', el).textContent = sc.turns;
    $('#hBlue', el).textContent = G.units.filter((u) => u.side === 'blue' && u.hp > 0).length;
    $('#hRed', el).textContent = G.units.filter((u) => u.side === 'red' && u.hp > 0 && u.seen).length;
  }

  // ---------------------------------------------------------------- Zeichnen
  // deterministisches „Rauschen“ fürs Gelände
  const noise = (x, y, k) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };

  function drawTerrain(c) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const t = G.map[y][x], X = x * CELL, Y = y * CELL;
      const base = { '.': '#6f7b47', '=': '#6f7b47', W: '#33502a', S: '#6f7b47', H: '#857a4d', '~': '#2f5d7c', B: '#2f5d7c', O: '#6f7b47' }[t];
      c.fillStyle = base; c.fillRect(X, Y, CELL, CELL);
      // Grasflecken
      if ('.=SO'.includes(t)) for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(40,50,20,.18)'; c.beginPath(); c.arc(X + noise(x, y, i) * CELL, Y + noise(y, x, i) * CELL, 3 + noise(x, i, y) * 5, 0, 7); c.fill(); }
      if (t === 'W') for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#24401d' : '#3e6233'; c.beginPath(); c.arc(X + 8 + noise(x, y, i) * 32, Y + 8 + noise(y, x, i + 3) * 32, 7 + noise(x, i, y) * 4, 0, 7); c.fill(); }
      if (t === 'H') { c.strokeStyle = 'rgba(60,45,20,.5)'; c.lineWidth = 1.5; for (let r = 8; r < 24; r += 7) { c.beginPath(); c.ellipse(X + 24, Y + 24, r + 4, r, 0, 0, 7); c.stroke(); } }
      if (t === '~' || t === 'B') { c.strokeStyle = 'rgba(200,230,255,.25)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); const yy = Y + 12 + i * 12; c.moveTo(X + 4, yy); c.quadraticCurveTo(X + 16, yy - 4, X + 24, yy); c.quadraticCurveTo(X + 34, yy + 4, X + 44, yy); c.stroke(); } }
      if (t === '=' || t === 'B' || (t === 'O' && sc.id === 'bruecke')) {
        c.fillStyle = t === 'B' ? '#8a8378' : '#a4966d';
        const n = (dx, dy) => { const m = G.map[y + dy]?.[x + dx]; return m === '=' || m === 'B' || m === 'O'; };
        const w = 14;
        c.fillRect(X + CELL / 2 - w / 2, Y + CELL / 2 - w / 2, w, w);
        if (n(-1, 0)) c.fillRect(X, Y + CELL / 2 - w / 2, CELL / 2, w);
        if (n(1, 0)) c.fillRect(X + CELL / 2, Y + CELL / 2 - w / 2, CELL / 2, w);
        if (n(0, -1)) c.fillRect(X + CELL / 2 - w / 2, Y, w, CELL / 2);
        if (n(0, 1)) c.fillRect(X + CELL / 2 - w / 2, Y + CELL / 2, w, CELL / 2);
        if (t === 'B') { c.strokeStyle = '#3a3a3a'; c.lineWidth = 2; c.strokeRect(X + 1, Y + CELL / 2 - w / 2 - 3, CELL - 2, w + 6); }
      }
      if (t === 'S') for (let i = 0; i < 4; i++) {
        const bx = X + 4 + (i % 2) * 22 + noise(x, y, i) * 4, by = Y + 4 + Math.floor(i / 2) * 22 + noise(y, x, i) * 4;
        c.fillStyle = '#4a4440'; c.fillRect(bx + 2, by + 2, 16, 16);
        c.fillStyle = i % 2 ? '#a05a46' : '#8a8a86'; c.fillRect(bx, by, 16, 16);
        c.strokeStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 16, by + 16); c.stroke();
      }
      if (t === 'O') {
        c.fillStyle = '#ffcc00'; c.strokeStyle = '#000'; c.lineWidth = 1.5;
        const cx = X + CELL / 2, cy = Y + CELL / 2;
        c.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7 : 16; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        c.closePath(); c.globalAlpha = .85; c.fill(); c.globalAlpha = 1; c.stroke();
      }
    }
  }

  function fogLayer(c) {
    c.fillStyle = 'rgba(10,12,10,.42)';
    fogCells.forEach(([x, y]) => c.fillRect(x * CELL, y * CELL, CELL, CELL));
  }

  function drawSymbol(c, cx, cy, u, scale = 1) {
    const T = TYPES[u.t];
    const blue = u.side === 'blue';
    const w = 30 * scale, h = 20 * scale;
    c.save();
    c.translate(cx, cy);
    c.lineWidth = 2 * scale;
    c.strokeStyle = '#000';
    c.fillStyle = blue ? '#80c8ff' : '#ff8080';
    c.beginPath();
    if (blue) c.rect(-w / 2, -h / 2, w, h);
    else { const r = 15 * scale; c.moveTo(0, -r); c.lineTo(r, 0); c.lineTo(0, r); c.lineTo(-r, 0); c.closePath(); }
    c.fill(); c.stroke();
    // Innenzeichen
    const iw = blue ? w : 18 * scale, ih = blue ? h : 12 * scale;
    c.lineWidth = 1.6 * scale;
    c.beginPath();
    if (T.sym === 'armor' || T.sym === 'mech') { c.ellipse(0, 0, iw * 0.33, ih * 0.28, 0, 0, 7); }
    if (T.sym === 'inf' || T.sym === 'mech') { c.moveTo(-iw / 2, -ih / 2); c.lineTo(iw / 2, ih / 2); c.moveTo(iw / 2, -ih / 2); c.lineTo(-iw / 2, ih / 2); }
    if (T.sym === 'recon') { c.moveTo(-iw / 2, ih / 2); c.lineTo(iw / 2, -ih / 2); }
    if (T.sym === 'heli') { c.moveTo(-iw * 0.35, -ih * 0.3); c.lineTo(iw * 0.35, ih * 0.3); c.lineTo(iw * 0.35, -ih * 0.3); c.lineTo(-iw * 0.35, ih * 0.3); c.closePath(); }
    if (T.sym === 'aa') { c.arc(0, ih / 2, iw * 0.35, Math.PI, 0); }
    c.stroke();
    if (T.sym === 'art') { c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, 3.5 * scale, 0, 7); c.fill(); }
    if (T.sym === 'heli' && blue) { c.fillStyle = '#000'; c.font = `bold ${8 * scale}px sans-serif`; c.textAlign = 'center'; }
    c.restore();
  }

  function drawUnits(c, now) {
    for (const u of G.units) {
      if (u.hp <= 0) continue;
      if (u.side === 'red' && !u.seen) continue;
      const cx = u.px * CELL + CELL / 2, cy = u.py * CELL + CELL / 2 - 3;
      const T = TYPES[u.t];
      if (T.fly) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(cx + 5, cy + 14, 12, 4, 0, 0, 7); c.fill(); }
      c.globalAlpha = u.side === 'blue' && u.moved && u.fired ? 0.55 : 1;
      drawSymbol(c, cx, cy + (T.fly ? Math.sin(now / 300 + u.id) * 1.5 - 3 : 0), u);
      c.globalAlpha = 1;
      // Stärkebalken
      const bw = 32, k = u.hp / T.hp;
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(cx - bw / 2, cy + 15, bw, 5);
      c.fillStyle = k > 0.6 ? '#7fd17f' : k > 0.3 ? '#ffcc00' : '#ff4d4d'; c.fillRect(cx - bw / 2 + 1, cy + 16, (bw - 2) * k, 3);
    }
  }

  function drawFx(c, now) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i], k = (now - f.t0) / f.dur;
      if (k >= 1) { fx.splice(i, 1); continue; }
      const x1 = f.x1 * CELL + CELL / 2, y1 = f.y1 * CELL + CELL / 2, x2 = (f.x2 ?? f.x1) * CELL + CELL / 2, y2 = (f.y2 ?? f.y1) * CELL + CELL / 2;
      if (f.type === 'shot') {
        c.strokeStyle = f.side === 'blue' ? 'rgba(255,240,150,' + (1 - k) + ')' : 'rgba(255,120,90,' + (1 - k) + ')';
        c.lineWidth = 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + (x2 - x1) * Math.min(1, k * 1.6), y1 + (y2 - y1) * Math.min(1, k * 1.6)); c.stroke();
        c.fillStyle = 'rgba(255,220,120,' + (1 - k) + ')'; c.beginPath(); c.arc(x1, y1, 8 * (1 - k), 0, 7); c.fill();
      } else if (f.type === 'arc') {
        const px = x1 + (x2 - x1) * k, py = y1 + (y2 - y1) * k - Math.sin(k * Math.PI) * 120;
        c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(px, py, 4, 0, 7); c.fill();
      } else if (f.type === 'boom') {
        const r = (f.big ? 30 : 18) * Math.sin(k * Math.PI);
        const g = c.createRadialGradient(x1, y1, 0, x1, y1, r + 1);
        g.addColorStop(0, 'rgba(255,255,200,.95)'); g.addColorStop(.4, 'rgba(255,150,30,.85)'); g.addColorStop(1, 'rgba(80,40,20,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x1, y1, r + 1, 0, 7); c.fill();
      } else if (f.type === 'miss') {
        c.strokeStyle = 'rgba(220,220,200,' + (1 - k) + ')'; c.lineWidth = 2;
        c.beginPath(); c.arc(x1 + 10, y1 - 8, 4 + k * 10, 0, 7); c.stroke();
      }
    }
  }

  function frame(now) {
    if (!alive) return;
    if (G) {
      ctx.drawImage(terrainCv, 0, 0);
      fogLayer(ctx);
      // Raster
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL + .5, 0); ctx.lineTo(x * CELL + .5, ROWS * CELL); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL + .5); ctx.lineTo(COLS * CELL, y * CELL + .5); ctx.stroke(); }
      // Koordinaten
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '10px sans-serif';
      for (let x = 0; x < COLS; x++) ctx.fillText(String.fromCharCode(65 + x), x * CELL + 3, 11);
      for (let y = 1; y < ROWS; y++) ctx.fillText(String(y + 1), 3, y * CELL + 11);
      // Auswahl
      if (G.reach) { ctx.fillStyle = 'rgba(120,255,120,.28)'; G.reach.forEach(([x, y]) => ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4)); }
      if (G.sel) { ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 3; ctx.strokeRect(G.sel.x * CELL + 2, G.sel.y * CELL + 2, CELL - 4, CELL - 4); }
      drawUnits(ctx, now);
      if (G.targets.length) {
        ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 2.5;
        G.targets.forEach((t) => {
          const p = 2 + Math.sin(now / 150) * 2;
          ctx.strokeRect(t.x * CELL + p, t.y * CELL + p, CELL - p * 2, CELL - p * 2);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`${Math.round(hitChance(G.sel, t) * 100)}%`, t.x * CELL + 4, t.y * CELL + CELL - 4);
        });
      }
      drawFx(ctx, now);
    }
    raf = requestAnimationFrame(frame);
  }

  setup();
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); };
}
