import { esc } from '../lib/util.js';
import { DIENSTGRADE, insigniaSvg } from '../data/wissen.js';

export async function render(el) {
  let last = '';
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Wissen</span>
      <h1>Dienstgrade der Bundeswehr</h1>
      <hr class="rule">
      <p>Alle Dienstgrade von Heer und Luftwaffe sowie die entsprechenden Bezeichnungen der Marine, mit NATO-Rangcode. Die Schulterabzeichen sind vereinfacht dargestellt. Im Sanitätsdienst gibt es eigene Bezeichnungen für Offiziere (z. B. Stabsarzt statt Hauptmann).</p>
    </div>
    <div class="section card table-scroll">
      <table class="rank-table">
        <thead><tr><th></th><th>Heer / Luftwaffe</th><th>Marine</th><th>NATO</th></tr></thead>
        <tbody>
          ${DIENSTGRADE.map((d) => {
            const head = d.g !== last ? `<tr class="rank-group"><td colspan="4">${esc(d.g)}</td></tr>` : '';
            last = d.g;
            return `${head}<tr><td>${insigniaSvg(d.ins)}</td><td><b>${esc(d.h)}</b></td><td>${esc(d.m)}</td><td><span class="badge">${esc(d.nato)}</span></td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="section grid cols-3">
      <div class="card"><div class="card-body"><h3>Mannschaften</h3><p class="small muted" style="margin:0">Der Einstieg – z. B. im Freiwilligen Wehrdienst. Mannschaften sind das Fundament jeder Einheit.</p></div></div>
      <div class="card"><div class="card-body"><h3>Unteroffiziere</h3><p class="small muted" style="margin:0">Ausbilder, Spezialisten und Führer von Gruppen und Trupps. „Portepee“ steht für die höheren Feldwebeldienstgrade.</p></div></div>
      <div class="card"><div class="card-body"><h3>Offiziere</h3><p class="small muted" style="margin:0">Führen Züge, Kompanien und größere Verbände. Fast alle Offiziere studieren an einer Universität der Bundeswehr.</p></div></div>
    </div>`;
}
