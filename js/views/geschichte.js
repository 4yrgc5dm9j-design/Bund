import { esc } from '../lib/util.js';
import { GESCHICHTE } from '../data/wissen.js';

export async function render(el) {
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Chronik</span>
      <h1>Geschichte der Bundeswehr</h1>
      <hr class="rule">
      <p>Von der Gründung 1955 über den Kalten Krieg und die Armee der Einheit bis zur Zeitenwende – die wichtigsten Stationen.</p>
    </div>
    <div class="section" style="max-width:860px">
      <div class="timeline">
        ${GESCHICHTE.map((g, i) => `
          <div class="tl-item">
            <div class="year">${esc(g.y)}</div>
            <h3>${esc(g.t)}</h3>
            <p class="muted" style="margin:0 0 10px">${esc(g.d)}</p>
            ${i % 3 === 1 ? `<div class="media" style="max-width:420px;border-radius:4px" data-commons="${esc('Bundeswehr ' + g.y)}" data-width="500"><div class="ph camo"></div></div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
}
