import { esc, $, store, fmtNum } from '../lib/util.js';

const DAY = 86400000;

export async function render(el) {
  const s = store.get('massband', {});
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Tradition</span>
      <h1>Das Maßband</h1>
      <hr class="rule">
      <p>Früher schnitten Wehrpflichtige jeden Tag ein Zentimeterstück von ihrem Maßband ab – bis zum Dienstzeitende (DZE). Hier gibt's die digitale Version: Trag deinen Dienstantritt und dein DZE ein.</p>
    </div>
    <div class="sim-grid section">
      <div class="sim-panel">
        <div class="grid cols-2" style="gap:12px">
          <label class="field"><span>Dienstantritt</span><input class="input" type="date" id="start" value="${esc(s.start || '')}"></label>
          <label class="field"><span>Dienstzeitende (DZE)</span><input class="input" type="date" id="end" value="${esc(s.end || '')}"></label>
        </div>
        <div id="mbOut" class="muted">Bitte beide Daten eintragen.</div>
      </div>
      <aside class="sim-panel">
        <h3>Wusstest du?</h3>
        <p class="small muted">Das klassische Maßband hatte 150 cm – das passte zu den letzten 150 Tagen. Am letzten Tag wurde der Rest feierlich übergeben. Heute ist das Maßband vor allem eine liebevolle Erinnerung.</p>
      </aside>
    </div>`;

  function calc() {
    const a = $('#start', el).value, b = $('#end', el).value;
    store.set('massband', { start: a, end: b });
    const out = $('#mbOut', el);
    if (!a || !b) { out.className = 'muted'; out.textContent = 'Bitte beide Daten eintragen.'; return; }
    const A = new Date(a), B = new Date(b), now = new Date(new Date().toDateString());
    if (B <= A) { out.textContent = 'Das Dienstzeitende muss nach dem Dienstantritt liegen.'; return; }
    const total = Math.round((B - A) / DAY), done = Math.min(total, Math.max(0, Math.round((now - A) / DAY))), left = total - done;
    const cm = Math.min(150, left);
    out.className = '';
    out.innerHTML = `
      <p style="font-size:3rem;font-family:var(--font-cond);font-weight:800;margin:0;line-height:1">${left > 0 ? fmtNum(left) : '🎉 0'}</p>
      <p>${left > 0 ? `Tage bis zum DZE · ${fmtNum(done)} von ${fmtNum(total)} Tagen geschafft (${Math.round(done / total * 100)} %)` : 'Geschafft! Herzlichen Glückwunsch zum Dienstzeitende!'}</p>
      <div class="progress"><i style="width:${done / total * 100}%"></i></div>
      <p class="small muted">${left > 150 ? `Das Maßband (150 cm) wird erst in ${fmtNum(left - 150)} Tagen angeschnitten.` : `Noch ${cm} cm Maßband übrig:`}</p>
      <div class="massband" aria-hidden="true">${Array.from({ length: 150 }, (_, i) => `<i class="${i >= cm ? 'cut' : ''}"></i>`).join('')}</div>`;
  }
  $('#start', el).addEventListener('change', calc);
  $('#end', el).addEventListener('change', calc);
  calc();
}
