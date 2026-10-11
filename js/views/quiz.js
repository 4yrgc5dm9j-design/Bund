import { esc, $, $$, shuffle, store } from '../lib/util.js';
import { QUIZ } from '../data/wissen.js';

const ROUNDS = 10;

export async function render(el) {
  let qs, i, score, streak;

  function start() {
    qs = shuffle(QUIZ).slice(0, ROUNDS).map((q) => {
      const order = shuffle(q.a.map((a, k) => ({ a, ok: k === q.c })));
      return { q: q.q, opts: order };
    });
    i = 0; score = 0; streak = 0;
    show();
  }

  function show() {
    const q = qs[i];
    el.innerHTML = `
      <div class="page-head"><span class="kicker">Wissensquiz</span><h1>Wie gut kennst du die Bundeswehr?</h1></div>
      <div class="section" style="max-width:720px">
        <div class="sim-panel">
          <div style="display:flex;justify-content:space-between" class="small muted"><span>Frage ${i + 1} von ${ROUNDS}</span><span>Punkte: ${score}${streak > 1 ? ` · 🔥 ${streak}er-Serie` : ''}</span></div>
          <div class="progress"><i style="width:${i / ROUNDS * 100}%"></i></div>
          <h2 style="text-transform:none;font-family:var(--font);font-size:1.35rem">${esc(q.q)}</h2>
          <div id="opts">${q.opts.map((o, k) => `<button class="quiz-opt" data-k="${k}">${esc(o.a)}</button>`).join('')}</div>
          <div id="next"></div>
        </div>
      </div>`;
    $$('.quiz-opt', el).forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.k))));
  }

  function answer(k) {
    const q = qs[i];
    const ok = q.opts[k].ok;
    if (ok) { streak++; score += 10 + Math.min(streak - 1, 5) * 2; } else streak = 0;
    $$('.quiz-opt', el).forEach((b, j) => {
      b.disabled = true;
      if (q.opts[j].ok) b.classList.add('right');
      else if (j === k) b.classList.add('wrong');
    });
    $('#next', el).innerHTML = `<p style="margin-top:12px"><b>${ok ? 'Richtig!' : 'Leider falsch.'}</b></p><button class="btn" id="nb">${i + 1 < ROUNDS ? 'Nächste Frage' : 'Auswertung'}</button>`;
    $('#nb', el).addEventListener('click', () => { i++; i < ROUNDS ? show() : end(); });
    $('#nb', el).focus();
  }

  function end() {
    const best = store.get('quizBest', 0);
    if (score > best) store.set('quizBest', score);
    let max = 0;
    for (let s = 1; s <= ROUNDS; s++) max += 10 + Math.min(s - 1, 5) * 2;
    const pct = score / max;
    const title = pct > .85 ? 'Generalinspekteur-Niveau!' : pct > .6 ? 'Stabsoffizier – stark!' : pct > .35 ? 'Feldwebel – solide.' : 'Rekrut – da geht noch was!';
    el.innerHTML = `
      <div class="page-head"><span class="kicker">Wissensquiz</span><h1>${esc(title)}</h1></div>
      <div class="section" style="max-width:720px"><div class="sim-panel">
        <p style="font-size:3rem;font-family:var(--font-cond);font-weight:800;margin:0">${score} Punkte</p>
        <p class="muted">Bestwert: ${Math.max(score, best)} Punkte</p>
        <button class="btn" id="again">Neue Runde</button> <a class="btn secondary" href="#/lexikon">Zum Lexikon</a>
      </div></div>`;
    $('#again', el).addEventListener('click', start);
  }

  start();
}
