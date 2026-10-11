import { esc } from '../lib/util.js';
import { EINSAETZE } from '../data/wissen.js';

export async function render(el) {
  const laufend = EINSAETZE.filter((e) => e.status !== 'beendet');
  const beendet = EINSAETZE.filter((e) => e.status === 'beendet');
  const card = (e) => `
    <div class="card">
      <div class="media" data-commons="${esc(e.name.split(' /')[0] + ' Bundeswehr')}" data-width="500"><div class="ph camo"></div></div>
      <div class="card-body">
        <div class="news-meta"><span class="badge ${e.status === 'beendet' ? '' : 'ausland'}">${esc(e.status)}</span><span>${esc(e.ort)}</span><span>${esc(e.seit)}</span></div>
        <h3>${esc(e.name)}</h3>
        <p class="small muted" style="margin:0">${esc(e.text)}</p>
      </div>
    </div>`;
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Weltweit</span>
      <h1>Einsätze der Bundeswehr</h1>
      <hr class="rule">
      <p>Als Parlamentsarmee wird die Bundeswehr nur mit Mandat des Bundestages bewaffnet ins Ausland geschickt. Hier eine Übersicht wichtiger laufender und früherer Einsätze und Missionen (Stand 2026, ohne Gewähr – Mandate ändern sich regelmäßig).</p>
      <a class="btn" href="#/karte/einsaetze">Auf der Karte anzeigen</a>
    </div>
    <section class="section"><h2>Laufend &amp; wiederkehrend</h2><div class="grid cols-3">${laufend.map(card).join('')}</div></section>
    <section class="section"><h2>Abgeschlossen</h2><div class="grid cols-3">${beendet.map(card).join('')}</div></section>
    <section class="section"><div class="fact"><span class="kicker">Gedenken</span>Seit 1955 haben über 3.300 Angehörige der Bundeswehr im Dienst ihr Leben verloren, über 100 davon in Auslandseinsätzen. An sie erinnern das Ehrenmal der Bundeswehr in Berlin und der „Wald der Erinnerung“ bei Potsdam.</div></section>`;
}
