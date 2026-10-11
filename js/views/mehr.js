import { esc, ICONS } from '../lib/util.js';
import { ROUTES } from '../app.js';

const TEXT = {
  galerie: 'Fotos aus allen Teilstreitkräften',
  karriere: 'Spiel deine Laufbahn vom Rekruten bis zum General',
  gefecht: 'Taktisches Rundenspiel mit realen Systemen',
  quiz: '30 Fragen rund um die Bundeswehr',
  dienstgrade: 'Alle Dienstgrade von Heer, Luftwaffe und Marine',
  einsaetze: 'Laufende und frühere Auslandseinsätze',
  geschichte: 'Von 1955 bis heute',
  fitness: 'Basis-Fitness-Test üben und Trainingsplan erstellen',
  funk: 'NATO-Alphabet & Morse-Code mit Ton',
  massband: 'Countdown bis zum Dienstzeitende – Tradition!',
  lexikon: 'Abkürzungen und Soldatensprache',
};

export async function render(el) {
  const groups = {};
  ROUTES.filter((r) => TEXT[r.path]).forEach((r) => (groups[r.group] ||= []).push(r));
  el.innerHTML = `
    <div class="page-head"><span class="kicker">Mehr</span><h1>Alle Funktionen</h1><hr class="rule"></div>
    ${Object.entries(groups).map(([g, rs]) => `
      <section class="section">
        <h2>${esc(g)}</h2>
        <div class="tiles">
          ${rs.map((r) => `<a class="tile" href="#/${r.path}" style="min-height:120px"><span class="tile-icon">${ICONS[r.icon]}</span><h3>${esc(r.title)}</h3><p>${esc(TEXT[r.path])}</p></a>`).join('')}
        </div>
      </section>`).join('')}
    <section class="section">
      <h2>App installieren</h2>
      <p class="muted">Du kannst „Bundeswehr“ wie eine normale App auf deinem Startbildschirm installieren: im Browser-Menü „Zum Startbildschirm hinzufügen“ bzw. „App installieren“ wählen. Viele Inhalte funktionieren danach auch offline.</p>
    </section>`;
}
