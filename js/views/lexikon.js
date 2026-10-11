import { esc, $ } from '../lib/util.js';
import { LEXIKON } from '../data/wissen.js';

export async function render(el) {
  const sorted = [...LEXIKON].sort((a, b) => a[0].localeCompare(b[0], 'de'));
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Wissen</span>
      <h1>Lexikon &amp; Soldatensprache</h1>
      <hr class="rule">
      <p>Die Bundeswehr liebt Abkürzungen. Hier die wichtigsten Begriffe – vom „Spieß“ bis zur „ZDv“.</p>
      <input class="input" id="lexQ" type="search" placeholder="Begriff suchen …" aria-label="Lexikon durchsuchen" style="max-width:420px">
    </div>
    <div class="section card"><div class="card-body"><dl class="glossary" id="lex"></dl></div></div>`;
  const draw = (q = '') => {
    const l = sorted.filter(([t, d]) => !q || (t + ' ' + d).toLowerCase().includes(q));
    $('#lex', el).innerHTML = l.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('') || '<p class="muted">Kein Treffer.</p>';
  };
  $('#lexQ', el).addEventListener('input', (e) => draw(e.target.value.trim().toLowerCase()));
  draw();
}
