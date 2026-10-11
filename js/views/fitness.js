import { esc, $, store } from '../lib/util.js';

// Orientierungsskala (eigene, vereinfachte Einstufung – keine offiziellen Bewertungstabellen)
const SKALA = {
  sprint: { label: 'Sprinttest 11 × 10 m', unit: 's', lowerBetter: true, steps: [40, 45, 50, 56] },
  hang: { label: 'Klimmhang', unit: 's', lowerBetter: false, steps: [60, 40, 20, 5] },
  lauf: { label: '1.000-m-Lauf', unit: 'min', lowerBetter: true, steps: [3.5, 4.0, 4.5, 5.25] },
};
const STUFEN = ['Spitzenklasse', 'Gut', 'Solide', 'Ausbaufähig', 'Trainingsbedarf'];

function grade(key, v) {
  const s = SKALA[key];
  for (let i = 0; i < s.steps.length; i++) if (s.lowerBetter ? v <= s.steps[i] : v >= s.steps[i]) return i;
  return 4;
}

const PLAN = {
  sprint: ['Pendelsprints 6 × (5 × 10 m), 60 s Pause', 'Koordinationsleiter 10 Min.', 'Steigerungsläufe 6 × 80 m'],
  hang: ['Negativ-Klimmzüge 4 × 5', 'Isometrisches Halten 5 × max., 90 s Pause', 'Rudern mit Band/Kurzhantel 4 × 12'],
  lauf: ['Intervalle 6 × 400 m zügig, 2 Min. Trabpause', 'Lockerer Dauerlauf 30–45 Min.', 'Tempolauf 2 km knapp unter Wettkampftempo'],
  all: ['Liegestütze 4 × max.', 'Unterarmstütz 4 × 45 s', 'Ausmarsch mit 15 kg Gepäck 6–8 km (alle 2 Wochen)', 'Mobilität & Dehnen 15 Min.'],
};

export async function render(el) {
  const saved = store.get('fitness', { sprint: '', hang: '', lauf: '' });
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Training</span>
      <h1>Fitness-Check</h1>
      <hr class="rule">
      <p>Der Basis-Fitness-Test (BFT) der Bundeswehr besteht aus Sprinttest (11 × 10 m), Klimmhang und 1.000-m-Lauf. Trage deine Werte ein und erhalte eine Einschätzung plus Wochen-Trainingsplan.</p>
    </div>
    <div class="sim-grid section">
      <form class="sim-panel" id="fitForm">
        <label class="field"><span>Sprinttest 11 × 10 m (Sekunden)</span><input class="input" name="sprint" type="number" step="0.1" min="20" max="120" value="${esc(saved.sprint)}" placeholder="z. B. 46,5"></label>
        <label class="field"><span>Klimmhang (Sekunden)</span><input class="input" name="hang" type="number" step="1" min="0" max="300" value="${esc(saved.hang)}" placeholder="z. B. 35"></label>
        <label class="field"><span>1.000-m-Lauf (Minuten:Sekunden)</span><input class="input" name="lauf" type="text" value="${esc(saved.lauf)}" placeholder="z. B. 4:15" inputmode="numeric"></label>
        <button class="btn" type="submit">Auswerten</button>
        <p class="small muted" style="margin:12px 0 0">Hinweis: Die Einstufung ist eine eigene Orientierungshilfe und entspricht nicht den offiziellen Bewertungstabellen der Bundeswehr. Vor dem Training ggf. ärztlich abklären lassen.</p>
      </form>
      <aside class="sim-panel" id="fitOut"><h3>Ergebnis</h3><p class="muted small">Noch keine Werte eingetragen.</p></aside>
    </div>`;

  const parseLauf = (s) => {
    if (!s) return NaN;
    const m = String(s).replace(',', '.').split(':');
    return m.length === 2 ? Number(m[0]) + Number(m[1]) / 60 : Number(m[0]);
  };

  function evaluate(v) {
    const vals = {
      sprint: v.sprint === '' ? NaN : Number(v.sprint),
      hang: v.hang === '' ? NaN : Number(v.hang),
      lauf: parseLauf(v.lauf),
    };
    const res = Object.entries(vals).filter(([, x]) => !isNaN(x) && x >= 0);
    if (!res.length) return;
    const grades = res.map(([k, x]) => [k, grade(k, x)]);
    const worst = grades.slice().sort((a, b) => b[1] - a[1])[0];
    const avg = grades.reduce((s, [, g]) => s + g, 0) / grades.length;
    $('#fitOut', el).innerHTML = `
      <h3>Ergebnis</h3>
      ${grades.map(([k, g]) => `<div class="attr" style="grid-template-columns:130px 1fr 90px"><span>${SKALA[k].label}</span><div class="bar"><i style="width:${(4 - g) / 4 * 100 || 6}%;${g >= 3 ? 'background:var(--rot)' : ''}"></i></div><b class="small">${STUFEN[g]}</b></div>`).join('')}
      <p style="margin-top:12px"><b>Gesamt: ${STUFEN[Math.round(avg)]}</b></p>
      <h3 style="margin-top:16px">Dein Wochenplan</h3>
      <ol class="small" style="padding-left:18px">
        <li><b>Mo – Schwerpunkt ${SKALA[worst[0]].label}:</b> ${PLAN[worst[0]].join(' · ')}</li>
        <li><b>Di – Kraft:</b> ${PLAN.all.slice(0, 2).join(' · ')}</li>
        <li><b>Mi – Ausdauer:</b> ${PLAN.lauf[1]}</li>
        <li><b>Do – Ruhetag / Mobilität:</b> ${PLAN.all[3]}</li>
        <li><b>Fr – Schnelligkeit:</b> ${PLAN.sprint[0]}</li>
        <li><b>Sa – Klimmhang & Rumpf:</b> ${PLAN.hang.slice(0, 2).join(' · ')}</li>
        <li><b>So – Marsch oder lockerer Lauf:</b> ${PLAN.all[2]}</li>
      </ol>`;
  }

  $('#fitForm', el).addEventListener('submit', (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    store.set('fitness', v);
    evaluate(v);
  });
  if (saved.sprint || saved.hang || saved.lauf) evaluate(saved);
}
