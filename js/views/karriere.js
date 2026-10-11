// Karrieresimulator: Vom Rekruten bis zum Dienstzeitende.
// Jede Runde = ein Quartal. Entscheidungen verändern Werte, Werte bestimmen Beförderungen.

import { esc, $, $$, pick, clamp, store, rand, toast } from '../lib/util.js';
import { DIENSTGRADE, insigniaSvg } from '../data/wissen.js';

const TSK = {
  heer: { name: 'Heer', verw: ['Panzergrenadier', 'Panzertruppe', 'Fallschirmjäger', 'Gebirgsjäger', 'Pionier', 'Artillerie', 'Heeresflieger', 'Aufklärer'] },
  luftwaffe: { name: 'Luftwaffe', verw: ['Jetpilot', 'Transportpilot', 'Flugabwehrraketen', 'Fluggerätmechaniker', 'Objektschutz', 'Fluglotse'] },
  marine: { name: 'Marine', verw: ['Fregatte (Waffensysteme)', 'Schiffstechnik', 'U-Boot', 'Seebataillon', 'Marineflieger', 'Kampfschwimmer'] },
  cir: { name: 'Cyber- und Informationsraum', verw: ['IT-Spezialist', 'Cyber-Operationen', 'Elektronische Kampfführung', 'Geoinformation'] },
  san: { name: 'Sanitätsdienst', verw: ['Notfallsanitäter', 'Pflegefachkraft', 'Sanitätsoffizier (Arzt)'] },
  ustg: { name: 'Unterstützungsbereich', verw: ['Feldjäger', 'Logistik', 'ABC-Abwehr', 'Kraftfahrer'] },
};

const LAUFBAHN = {
  mann: { name: 'Mannschaften', jahre: [1, 2, 4], ladder: [['Soldat / Schütze / Flieger', 0], ['Gefreiter', 3], ['Obergefreiter', 12], ['Hauptgefreiter', 24], ['Stabsgefreiter', 42], ['Oberstabsgefreiter', 66]] },
  uffz: { name: 'Feldwebel', jahre: [8, 12], ladder: [['Soldat / Schütze / Flieger', 0], ['Gefreiter', 6], ['Unteroffizier', 15], ['Stabsunteroffizier', 24], ['Feldwebel', 36], ['Oberfeldwebel', 60], ['Hauptfeldwebel', 96], ['Stabsfeldwebel', 144], ['Oberstabsfeldwebel', 192]] },
  offz: { name: 'Offizier', jahre: [13, 15], ladder: [['Soldat / Schütze / Flieger', 0], ['Gefreiter', 6], ['Fahnenjunker', 12], ['Fähnrich', 24], ['Oberfähnrich', 36], ['Leutnant', 48], ['Oberleutnant', 66], ['Hauptmann', 96], ['Major', 150], ['Oberstleutnant', 186], ['Oberst', 246], ['Brigadegeneral', 306], ['Generalmajor', 342], ['Generalleutnant', 378], ['General', 414]] },
};

const STATS = [['fitness', 'Fitness'], ['wissen', 'Fachwissen'], ['fuehrung', 'Führung'], ['team', 'Kameradschaft'], ['moral', 'Motivation'], ['gesund', 'Gesundheit']];

function rankInfo(s) {
  const [h] = LAUFBAHN[s.lb].ladder[s.rank];
  const d = DIENSTGRADE.find((x) => x.h === h) || DIENSTGRADE[0];
  let name = s.tsk === 'marine' ? d.m : d.h;
  if (s.rank === 0) name = s.tsk === 'marine' ? 'Matrose' : s.tsk === 'luftwaffe' ? 'Flieger' : s.verw === 'Panzergrenadier' ? 'Panzergrenadier' : s.verw.includes('jäger') ? 'Jäger' : 'Soldat';
  if (s.lb === 'offz' && s.rank > 0 && s.rank < 5 && !/Fahnenjunker|Fähnrich|Seekadett/.test(name)) name += ' (OA)';
  if (s.lb === 'uffz' && s.rank === 1) name += ' (FA)';
  if (s.verw === 'Sanitätsoffizier (Arzt)' && s.rank >= 7) {
    const san = { Hauptmann: 'Stabsarzt', Kapitänleutnant: 'Stabsarzt', Major: 'Oberstabsarzt', Korvettenkapitän: 'Oberstabsarzt', Oberstleutnant: 'Oberfeldarzt', Fregattenkapitän: 'Flottillenarzt', Oberst: 'Oberstarzt', 'Kapitän zur See': 'Flottenarzt', Brigadegeneral: 'Generalarzt', Flottillenadmiral: 'Admiralarzt', Generalmajor: 'Generalstabsarzt', Konteradmiral: 'Admiralstabsarzt', Generalleutnant: 'Generaloberstabsarzt', Vizeadmiral: 'Admiraloberstabsarzt' };
    name = san[name] || name;
  }
  return { name, nato: d.nato, ins: d.ins };
}

// ----------------------------------------------------------------------------
// Ereignisse. when(s) → bool, choices: [{t, d?, fx, chance?, fail?, msg, failMsg}]
// fx: Werte-Änderungen; besondere Schlüssel: bew (Beurteilung), einsatz, medal, flag, jahre
// ----------------------------------------------------------------------------
const dm = (s) => s.m - (s.lbStart || 0);
const isKampf = (s) => /Panzer|jäger|Pionier|Artillerie|Seebataillon|Kampfschwimmer|Aufklärer|Objektschutz|Feldjäger/.test(s.verw);
const EVENTS = [
  // ---- Grundausbildung ----
  { id: 'ga1', once: true, when: (s) => s.m === 0, title: 'Tag 1: Grundausbildung', text: 'Einkleidung, Stube beziehen, erster Antritt. Dein Zugführer brüllt über den Flur. Wie startest du?',
    choices: [
      { t: 'Voll motiviert – Spind perfekt einräumen', fx: { moral: 5, wissen: 3, bew: 2 }, msg: 'Dein Spind wird beim ersten Stubendurchgang als Vorbild gezeigt.' },
      { t: 'Erst mal die Kameraden kennenlernen', fx: { team: 8, moral: 3 }, msg: 'Deine Stube hält ab sofort zusammen wie Pech und Schwefel.' },
      { t: 'Unauffällig bleiben', fx: { moral: -2 }, msg: 'Du gehst in der Masse unter – nicht schlimm, aber auch nicht gut.' },
    ] },
  { id: 'ga2', once: true, when: (s) => s.m === 3, title: 'Biwak & Gefechtsdienst', text: 'Drei Tage im Gelände, Regen, Alarmposten um 3 Uhr nachts. Dein Kamerad hat seine Isomatte vergessen.',
    choices: [
      { t: 'Ich teile meine Ausrüstung', fx: { team: 8, gesund: -3, bew: 2 }, msg: 'Kalte Nacht – aber der Zug spricht noch Wochen davon.' },
      { t: 'Ich melde es dem Gruppenführer', fx: { fuehrung: 3, team: -2 }, msg: 'Problem gelöst, auch wenn einige das als Petzen sehen.' },
      { t: 'Sein Problem', fx: { team: -8 }, msg: 'Der Kamerad wird krank, die Gruppe ist sauer auf dich.' },
    ] },
  { id: 'gel', once: true, when: (s) => s.m === 6, title: 'Feierliches Gelöbnis', text: 'Vor Familie und Freunden sprichst du die Worte: „… der Bundesrepublik Deutschland treu zu dienen und das Recht und die Freiheit des deutschen Volkes tapfer zu verteidigen.“',
    choices: [{ t: 'Mit fester Stimme sprechen', fx: { moral: 10 }, msg: 'Gänsehaut-Moment. Du bist jetzt richtig angekommen.' }] },

  // ---- Laufbahnspezifisch ----
  { id: 'studium', once: true, when: (s) => s.lb === 'offz' && s.m === 15, title: 'Studium an der Universität der Bundeswehr', text: 'Jetzt geht es nach Hamburg oder München. Welches Studienfach wählst du?',
    choices: [
      { t: 'Informatik / Cyber-Sicherheit', fx: { wissen: 15, fitness: -5, flag: 'studium:Informatik' }, msg: 'Nächte im Rechenzentrum – aber ein sehr gefragter Abschluss.' },
      { t: 'Staats- und Sozialwissenschaften', fx: { wissen: 10, fuehrung: 5, flag: 'studium:Politik' }, msg: 'Du verstehst Sicherheitspolitik jetzt wirklich.' },
      { t: 'Maschinenbau / Luft- und Raumfahrttechnik', fx: { wissen: 14, moral: -2, flag: 'studium:Maschinenbau' }, msg: 'Hart, aber du baust beim Trimester-Projekt eine eigene Drohne.' },
      { t: 'Humanmedizin (zivile Uni)', when: (s) => s.tsk === 'san', fx: { wissen: 18, moral: -4, flag: 'studium:Medizin' }, msg: 'Sechs Jahre Medizinstudium warten – du bekommst dabei weiter Sold.' },
    ] },
  { id: 'studEnd', once: true, when: (s) => s.lb === 'offz' && s.m === 45, title: 'Masterarbeit', text: 'Die Abgabe naht. Wie gehst du die letzten Wochen an?',
    choices: [
      { t: 'Durchziehen – jede freie Minute schreiben', fx: { wissen: 8, gesund: -5, bew: 4 }, msg: 'Note 1,3! Dein Kommandeur gratuliert persönlich.' },
      { t: 'Solide abschließen, Sport nicht vergessen', fx: { wissen: 4, fitness: 4, bew: 2 }, msg: 'Bestanden mit 2,0 – und fit geblieben.' },
    ] },
  { id: 'uffzLg', once: true, when: (s) => s.lb === 'uffz' && dm(s) === 12, title: 'Unteroffizierlehrgang', text: 'An der Unteroffizierschule lernst du, eine Gruppe zu führen. Die Abschlussprüfung: ein Gefechtsszenario.',
    choices: [
      { t: 'Klar und laut führen', fx: { fuehrung: 10 }, chance: 0.7, failMsg: 'Du verhaspelst dich bei der Befehlsausgabe – knapp bestanden.', fail: { fuehrung: 3, moral: -3 }, msg: 'Lehrgangsbester! Deine Gruppe folgt dir blind.' },
      { t: 'Die Gruppe mitdenken lassen', fx: { fuehrung: 6, team: 6 }, msg: 'Kooperativer Führungsstil – kommt gut an.' },
    ] },
  { id: 'fwLg', once: true, when: (s) => s.lb === 'uffz' && dm(s) === 30, title: 'Feldwebellehrgang & Fachausbildung', text: 'Du wirst zum Spezialisten in deiner Verwendung als {verw}. Ziel: IHK-Abschluss oder Meisterprüfung.',
    choices: [
      { t: 'Zusätzlich den Meister machen', fx: { wissen: 14, moral: -3, bew: 3, flag: 'meister' }, msg: 'Meisterbrief in der Tasche – wertvoll für immer.' },
      { t: 'Fokus auf militärische Führung', fx: { fuehrung: 10, wissen: 5 }, msg: 'Du bist bereit, einen Zug als stellvertretender Zugführer zu unterstützen.' },
    ] },
  { id: 'kompChef', once: true, when: (s) => s.lb === 'offz' && s.rank >= 7, title: 'Kompaniechef', text: 'Du übernimmst eine Kompanie mit über 100 Soldatinnen und Soldaten. Der Spieß bittet dich zum ersten Gespräch.',
    choices: [
      { t: 'Ich höre erst zu', fx: { fuehrung: 10, team: 8, bew: 3 }, msg: 'Der Spieß wird zu deinem wichtigsten Verbündeten.' },
      { t: 'Ich setze sofort klare Standards', fx: { fuehrung: 8, team: -3, bew: 4 }, msg: 'Die Kompanie zieht an – einige murren.' },
    ] },
  { id: 'spiess', once: true, when: (s) => s.lb === 'uffz' && s.rank >= 6, title: 'Angebot: Kompaniefeldwebel', text: 'Du kannst „Spieß“ werden – die „Mutter der Kompanie“. Viel Verantwortung, wenig Freizeit.',
    choices: [
      { t: 'Ja – das ist meine Berufung', fx: { fuehrung: 12, moral: 5, gesund: -3, bew: 5, flag: 'spiess' }, msg: 'Du trägst jetzt die Kordel des Kompaniefeldwebels.' },
      { t: 'Lieber Fachdienst bleiben', fx: { wissen: 6, moral: 3 }, msg: 'Du wirst zum gefragten Experten deiner Einheit.' },
    ] },
  { id: 'lgan', once: true, when: (s) => s.lb === 'offz' && s.rank === 8, title: 'Generalstabslehrgang?', text: 'Die besten Stabsoffiziere werden an der Führungsakademie in Hamburg zum Generalstabsoffizier ausgebildet. Die Auswahl ist hart.',
    choices: [
      { t: 'Bewerben', fx: { bew: 0 }, chance: -1, msg: '', failMsg: '' },
      { t: 'Nein, ich bleibe in der Truppe', fx: { moral: 4 }, msg: 'Du führst lieber Soldaten als Akten.' },
    ] },

  // ---- Verwendungsabhängig ----
  { id: 'fsjg', once: true, when: (s) => /Fallschirmjäger|Kampfschwimmer/.test(s.verw) && s.m >= 6, title: 'Fallschirmspringerlehrgang', text: 'Altenstadt: Dein erster Sprung aus der Transall-Nachfolgerin A400M. Die Tür geht auf …',
    choices: [{ t: 'Springen!', fx: { moral: 10, fitness: 3, medal: 'Fallschirmspringerabzeichen' }, chance: 0.92, fail: { gesund: -15, moral: -5 }, failMsg: 'Harte Landung – Bänderriss. Du springst später nach.', msg: 'Kappe offen, Herz rast – du hast es geschafft!' }] },
  { id: 'pilot', once: true, when: (s) => /pilot|Heeresflieger|Marineflieger/i.test(s.verw) && s.m >= 24, title: 'Flugausbildung in den USA', text: 'Sheppard Air Force Base, Texas: Die Euro-NATO-Jetpilotenausbildung ist eine der härtesten der Welt.',
    choices: [
      { t: 'Alles geben', fx: { wissen: 12, moral: 8, medal: 'Tätigkeitsabzeichen Militärluftfahrzeugführer' }, chance: 0.75, fail: { moral: -15, flag: 'washout' }, failMsg: 'Ausgesiebt („Wash-out“). Du wechselst in eine andere fliegerische Verwendung.', msg: 'Du bekommst deine Schwingen! Ein Traum wird wahr.' },
    ] },
  { id: 'uboot', once: true, when: (s) => s.verw === 'U-Boot' && s.m >= 12, title: 'Erste Fahrt auf U 33', text: '6 Wochen unter Wasser, 28 Leute, kein Tageslicht. Der Kommandant beobachtet, wie du mit der Enge klarkommst.',
    choices: [
      { t: 'Ruhe bewahren, Routine finden', fx: { team: 10, moral: 3, medal: 'U-Boot-Kriegsabzeichen (Tätigkeitsabzeichen U-Boot-Personal)' }, msg: 'Du bist jetzt ein echter „Ubootfahrer“.' },
      { t: 'Viel lernen – jede Station kennenlernen', fx: { wissen: 10, gesund: -3 }, msg: 'Nach der Fahrt kennst du jedes Ventil.' },
    ] },
  { id: 'cyber', when: (s) => s.tsk === 'cir' && s.m >= 9, title: 'Cyber-Angriff auf das Netz', text: 'Ungewöhnlicher Datenverkehr im Bundeswehrnetz. Es ist 2 Uhr nachts.',
    choices: [
      { t: 'Sofort isolieren und melden', fx: { wissen: 5, fuehrung: 4, bew: 4 }, msg: 'Angriff gestoppt – das Lagezentrum lobt dein Handeln.' },
      { t: 'Erst die Angreifer beobachten', fx: { wissen: 9 }, chance: 0.6, fail: { bew: -5 }, failMsg: 'Die Angreifer bemerken dich und löschen ihre Spuren.', msg: 'Wertvolle Erkenntnisse über die Täter gesammelt!' },
    ] },
  { id: 'san', when: (s) => s.tsk === 'san' && s.m >= 9, title: 'Notfall bei der Übung', text: 'Bei einer Übung verletzt sich ein Soldat schwer. Du bist als Erste/r vor Ort.',
    choices: [{ t: 'Erstversorgung nach Schema', fx: { wissen: 6, moral: 6, bew: 5 }, msg: 'Der Soldat ist stabil. Später bedankt er sich persönlich bei dir.' }] },
  { id: 'einzelk', once: true, when: (s) => isKampf(s) && s.lb !== 'mann' && s.m >= 18, title: 'Einzelkämpferlehrgang', text: 'Hammelburg: Wochenlang Überleben, Orientierung, Hunger und Schlafentzug.',
    choices: [
      { t: 'Antreten', fx: { fitness: 10, moral: 8, medal: 'Einzelkämpferabzeichen' }, chance: 0.65, fail: { moral: -6, gesund: -5 }, failMsg: 'Am Tag 9 bricht dein Knöchel. Abbruch.', msg: 'Durchgehalten! Du trägst jetzt das Einzelkämpferabzeichen.' },
      { t: 'Noch nicht – erst fitter werden', fx: { fitness: 4 }, msg: 'Kluge Entscheidung, nächstes Jahr bist du bereit.' },
    ] },

  // ---- Wiederkehrend ----
  { id: 'bft', when: (s) => s.m >= 6, title: 'Basis-Fitness-Test', text: 'Sprinttest, Klimmhang, 1.000-m-Lauf. Jährliche Pflicht.',
    choices: [
      { t: 'Vorher intensiv trainieren', fx: { fitness: 6, moral: -1 }, msg: 'Neue Bestzeit über 1.000 m!' },
      { t: 'Spontan antreten', fx: {}, chance: 'fitness', fail: { bew: -2, moral: -3 }, failMsg: 'Nicht bestanden – Wiederholung in 3 Monaten.', msg: 'Bestanden, ganz entspannt.' },
    ] },
  { id: 'schiess', when: (s) => s.m >= 3, title: 'Schießausbildung', text: 'Auf der Schießbahn geht es um die Schützenschnur.',
    choices: [
      { t: 'Konzentriert schießen', fx: { wissen: 2 }, chance: 0.6, fail: {}, failMsg: 'Knapp daneben – diesmal keine Schnur.', msg: 'Treffer! Du erhältst die Schützenschnur.', medalOnSuccess: 'Schützenschnur' },
    ] },
  { id: 'uebung', when: (s) => s.m >= 6, title: 'Großübung', text: 'NATO-Übung mit Tausenden Soldaten aus 20 Nationen. Deine Einheit soll einen Abschnitt halten.',
    choices: [
      { t: 'Initiative zeigen', fx: { fuehrung: 6, bew: 3, gesund: -2 }, chance: 0.7, fail: { bew: -2 }, failMsg: 'Dein Vorstoß wird vom „Gegner“ ausmanövriert.', msg: 'Die Schiedsrichter loben deine Lagebeurteilung.' },
      { t: 'Auftrag sauber erfüllen', fx: { wissen: 4, bew: 2 }, msg: 'Solide Leistung.' },
      { t: 'Kontakte zu internationalen Kameraden knüpfen', fx: { team: 6, wissen: 2 }, msg: 'Du hast jetzt Freunde in fünf Ländern.' },
    ] },
  { id: 'einsatz', when: (s) => s.m >= 12 && !s.flags.inEinsatz, title: 'Auslandseinsatz', text: 'Deine Einheit wird für {einsatz} angefragt. Vier bis sechs Monate weg von zu Hause.',
    choices: [
      { t: 'Freiwillig melden', fx: { moral: 4, wissen: 6, fuehrung: 3, team: 6, bew: 5, einsatz: 1, gesund: -4 }, msg: 'Einsatz erfolgreich abgeschlossen. Du erhältst die Einsatzmedaille.' },
      { t: 'Familiäre Gründe – diesmal nicht', fx: { moral: 2, bew: -1 }, msg: 'Verständnis vom Vorgesetzten, nächstes Mal bist du dabei.' },
    ] },
  { id: 'amtshilfe', when: (s) => s.m >= 6, title: 'Hochwasser-Amtshilfe', text: 'Ein Fluss tritt über die Ufer. Die Bundeswehr wird zur Amtshilfe angefordert.',
    choices: [{ t: 'Sandsäcke schleppen – 14 Stunden am Tag', fx: { fitness: 4, moral: 8, team: 5, gesund: -3, bew: 2, medal: 'Einsatzmedaille Fluthilfe' }, msg: 'Die Bevölkerung bedankt sich mit Kuchen und Applaus.' }] },
  { id: 'konflikt', when: (s) => s.m >= 9, title: 'Ärger in der Einheit', text: 'Zwei Kameraden geraten aneinander, die Stimmung kippt.',
    choices: [
      { t: 'Schlichten', fx: { fuehrung: 5, team: 4 }, msg: 'Handschlag – die Sache ist erledigt.' },
      { t: 'Dem Vorgesetzten melden', fx: { bew: 1, team: -2 }, msg: 'Offiziell geregelt.' },
      { t: 'Raushalten', fx: { team: -3, moral: -2 }, msg: 'Die Stimmung bleibt schlecht.' },
    ] },
  { id: 'verletzt', when: (s) => s.m >= 6, title: 'Verletzung beim Sport', text: 'Beim Dienstsport knickst du um. Der Truppenarzt rät zu Schonung.',
    choices: [
      { t: 'Ausheilen lassen', fx: { gesund: 6, fitness: -4, moral: -2 }, msg: 'Nach drei Wochen bist du wieder voll da.' },
      { t: 'Zähne zusammenbeißen', fx: { fitness: 1 }, chance: 0.4, fail: { gesund: -14, moral: -5 }, failMsg: 'Die Verletzung verschlimmert sich – Sportverbot für zwei Monate.', msg: 'Glück gehabt, es hält.' },
    ] },
  { id: 'lehrgang', when: (s) => s.m >= 18, title: 'Lehrgangsplatz frei', text: 'Kurzfristig wird ein Platz auf einem Speziallehrgang frei – aber du hattest Urlaub geplant.',
    choices: [
      { t: 'Urlaub verschieben, Lehrgang machen', fx: { wissen: 8, moral: -3, bew: 3 }, msg: 'Neue Qualifikation erworben.' },
      { t: 'Urlaub nehmen', fx: { moral: 8, gesund: 4 }, msg: 'Erholt zurück im Dienst.' },
    ] },
  { id: 'medien', when: (s) => s.m >= 24, title: 'Social-Media-Anfrage', text: 'Die Presseabteilung möchte dich für ein Karriere-Video drehen.',
    choices: [
      { t: 'Gerne!', fx: { moral: 5, bew: 1 }, msg: 'Dein Video hat 200.000 Aufrufe. Du wirst in der Kaserne erkannt.' },
      { t: 'Lieber nicht', fx: {}, msg: 'Okay, jemand anderes macht es.' },
    ] },
  { id: 'nacht', when: (s) => s.m >= 12, title: 'Wache am Wochenende', text: 'Dir wird am Wochenende ein UvD-/GvD-Dienst zugeteilt – eigentlich hattest du andere Pläne.',
    choices: [
      { t: 'Gewissenhaft durchziehen', fx: { bew: 2, moral: -2 }, msg: 'Ruhige Wache – und dein Vorgesetzter merkt sich das.' },
      { t: 'Mit einem Kameraden tauschen', fx: { team: 2, moral: 2 }, msg: 'Du übernimmst dafür seinen Dienst nächsten Monat.' },
    ] },
  { id: 'leistung', once: true, when: (s) => s.m >= 12, title: 'Leistungsabzeichen', text: 'Schießen, Sport, Marsch, Erste Hilfe – das Leistungsabzeichen ist eine echte Herausforderung.',
    choices: [{ t: 'Antreten', fx: { fitness: 3 }, chance: 'fitness', fail: { moral: -2 }, failMsg: 'Beim 6-km-Marsch fehlen 40 Sekunden.', msg: 'Bestanden!', medalOnSuccess: 'Leistungsabzeichen' }] },
  { id: 'fortbildung', when: (s) => s.m >= 30 && s.wissen < 70, title: 'Fernstudium nebenher?', text: 'Die Bundeswehr fördert Weiterbildung. Ein berufsbegleitender Kurs würde dir helfen.',
    choices: [
      { t: 'Ja, abends lernen', fx: { wissen: 8, moral: -2, gesund: -2 }, msg: 'Zertifikat erhalten.' },
      { t: 'Kein Bedarf', fx: { moral: 2 }, msg: 'Mehr Freizeit.' },
    ] },
  { id: 'versetzung', when: (s) => s.m >= 36 && s.lb !== 'mann', title: 'Versetzung', text: 'Eine Versetzung an einen anderen Standort steht an – 500 km von zu Hause.',
    choices: [
      { t: 'Annehmen – Karriere geht vor', fx: { bew: 4, moral: -4, wissen: 3 }, msg: 'Neuer Standort, neue Aufgaben, neue Chancen.' },
      { t: 'Heimatnahe Verwendung beantragen', fx: { moral: 5, bew: -2 }, msg: 'Antrag genehmigt, die Familie freut sich.' },
    ] },
];

const EINSAETZE = ['die Brigade in Litauen', 'KFOR im Kosovo', 'UNIFIL vor dem Libanon', 'EUNAVFOR Aspides im Roten Meer', 'Air Policing im Baltikum', 'EUFOR Althea in Bosnien', 'die Ausbildungsmission im Irak'];

function newState(form) {
  const base = { fitness: 50, wissen: 35, fuehrung: 30, team: 50, moral: 70, gesund: 85 };
  if (form.staerke === 'fit') base.fitness += 15;
  if (form.staerke === 'klug') base.wissen += 15;
  if (form.staerke === 'leader') base.fuehrung += 15;
  return { ...base, name: form.name || 'Rekrut', lb: form.lb, tsk: form.tsk, verw: form.verw, jahre: Number(form.jahre), m: 0, rank: 0, bew: 50, medals: [], log: [], seen: {}, flags: {}, einsaetze: 0, over: false, bs: false, cur: null };
}

function applyFx(s, fx, log) {
  for (const [k, v] of Object.entries(fx || {})) {
    if (k === 'bew') s.bew = clamp(s.bew + v, 0, 100);
    else if (k === 'einsatz') { s.einsaetze += v; addMedal(s, 'Einsatzmedaille der Bundeswehr'); }
    else if (k === 'medal') addMedal(s, v);
    else if (k === 'flag') s.flags[v] = true;
    else if (k in s && typeof s[k] === 'number') s[k] = clamp(s[k] + v, 0, 100);
  }
  const deltas = Object.entries(fx || {}).filter(([k, v]) => typeof v === 'number' && STATS.some(([sk]) => sk === k) && v);
  if (deltas.length && log) log.push(deltas.map(([k, v]) => `${STATS.find(([sk]) => sk === k)[1]} ${v > 0 ? '+' : ''}${v}`).join(', '));
}
function addMedal(s, m) { if (!s.medals.includes(m)) s.medals.push(m); }

function pickEvent(s) {
  const ok = EVENTS.filter((e) => e.when(s) && !(e.once && s.seen[e.id]));
  // feste Meilensteine haben Vorrang
  const fixed = ok.filter((e) => e.once && ['ga1', 'ga2', 'gel', 'studium', 'studEnd', 'uffzLg', 'fwLg'].includes(e.id));
  if (fixed.length) return fixed[0];
  // Nicht zweimal hintereinander dasselbe
  const pool = ok.filter((e) => e.id !== s.lastEvent);
  return pool.length && Math.random() < 0.85 ? pick(pool) : null;
}

function promotionCheck(s) {
  const ladder = LAUFBAHN[s.lb].ladder;
  const next = ladder[s.rank + 1];
  if (!next || dm(s) < next[1]) return null;
  const score = (s.fitness + s.wissen * 1.2 + s.fuehrung * (s.lb === 'mann' ? 0.5 : 1.3) + s.team * 0.6 + s.bew * 1.6) / 6.2;
  // höhere Ränge sind selektiver
  const need = s.rank + 1 >= 11 ? 78 : s.rank + 1 >= 9 ? 66 : s.rank + 1 >= 6 ? 50 : 35;
  const gs = s.flags.generalstab ? 10 : 0;
  if (score + gs + rand(-6, 6) >= need) { s.rank++; return rankInfo(s).name; }
  return null;
}

function medalsByTime(s) {
  const y = s.m / 12;
  if (y >= 5 && s.bew >= 55) addMedal(s, 'Ehrenzeichen der Bundeswehr in Bronze');
  if (y >= 10 && s.bew >= 65) addMedal(s, 'Ehrenzeichen der Bundeswehr in Silber');
  if (y >= 20 && s.bew >= 75) addMedal(s, 'Ehrenzeichen der Bundeswehr in Gold');
}

// ----------------------------------------------------------------------------
export async function render(el) {
  let s = store.get('karriere');
  if (s && !s.flags) s = null;

  const save = () => store.set('karriere', s);

  function startScreen() {
    el.innerHTML = `
      <div class="page-head">
        <span class="kicker">Simulation</span>
        <h1>Karrieresimulator</h1>
        <hr class="rule">
        <p>Erlebe deine eigene Laufbahn in der Bundeswehr: Grundausbildung, Lehrgänge, Studium, Auslandseinsätze und Beförderungen. Jede Runde ist ein Quartal – deine Entscheidungen bestimmen, wie weit du kommst. Vom Rekruten bis zum General?</p>
      </div>
      <div class="sim-grid section">
        <form class="sim-panel" id="startForm">
          <h2>Personalakte anlegen</h2>
          <label class="field"><span>Name</span><input class="input" name="name" maxlength="30" placeholder="z. B. Alex Schneider" required></label>
          <label class="field"><span>Laufbahn</span>
            <select class="input" name="lb">
              <option value="mann">Mannschaften – schnell einsteigen, Praxis pur</option>
              <option value="uffz" selected>Feldwebel – Spezialist und Ausbilder</option>
              <option value="offz">Offizier – Studium und Führungsverantwortung</option>
            </select></label>
          <label class="field"><span>Organisationsbereich</span>
            <select class="input" name="tsk">${Object.entries(TSK).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Verwendung</span><select class="input" name="verw"></select></label>
          <label class="field"><span>Verpflichtungszeit</span><select class="input" name="jahre"></select></label>
          <label class="field"><span>Deine Stärke</span>
            <select class="input" name="staerke">
              <option value="fit">Sportlich</option><option value="klug">Technisch begabt</option><option value="leader">Geborene Führungskraft</option>
            </select></label>
          <button class="btn" type="submit">Dienst antreten</button>
        </form>
        <aside class="sim-panel">
          <h3>So funktioniert's</h3>
          <ul class="small" style="padding-left:18px;margin:0 0 12px">
            <li>Jede Runde = 3 Monate Dienstzeit.</li>
            <li>Entscheidungen verändern Fitness, Fachwissen, Führung, Kameradschaft, Motivation und Gesundheit.</li>
            <li>Beförderungen hängen von Dienstzeit, Werten und Beurteilung ab.</li>
            <li>Sinkt Gesundheit oder Motivation auf 0, endet der Dienst vorzeitig.</li>
            <li>Am Ende deiner Verpflichtung kannst du verlängern oder Berufssoldat werden.</li>
          </ul>
          <p class="small muted">Vereinfachtes Spiel. Echte Infos zu Laufbahnen gibt es auf <a href="https://www.bundeswehrkarriere.de" target="_blank" rel="noopener">bundeswehrkarriere.de</a>.</p>
        </aside>
      </div>`;
    const f = $('#startForm', el);
    const upd = () => {
      const tsk = f.tsk.value, lb = f.lb.value;
      f.verw.innerHTML = TSK[tsk].verw.filter((v) => lb === 'offz' || v !== 'Sanitätsoffizier (Arzt)').map((v) => `<option>${esc(v)}</option>`).join('');
      f.jahre.innerHTML = LAUFBAHN[lb].jahre.map((j) => `<option value="${j}">${lb === 'mann' && j < 4 ? `Freiwilliger Wehrdienst (${j * 12} Monate)` : `Soldat auf Zeit ${j} Jahre`}</option>`).join('');
    };
    f.lb.addEventListener('change', upd); f.tsk.addEventListener('change', upd); upd();
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      s = newState(Object.fromEntries(new FormData(f)));
      s.log.push({ m: 0, t: `Dienstantritt als ${rankInfo(s).name} – ${s.verw}, ${TSK[s.tsk].name}.`, c: 'good' });
      nextTurn();
    });
  }

  function nextTurn() {
    if (s.over) return endScreen();
    const ev = pickEvent(s);
    s.cur = ev ? ev.id : 'routine';
    if (ev) s.seen[ev.id] = true;
    s.lastEvent = s.cur;
    save();
    game();
  }

  function fmtZeit(m) { const y = Math.floor(m / 12), r = m % 12; return `${y} J. ${r} M.`; }

  function game() {
    const ev = EVENTS.find((e) => e.id === s.cur);
    const r = rankInfo(s);
    const totalM = s.jahre * 12;
    const fill = (txt) => txt.replace('{verw}', s.verw).replace('{einsatz}', s.einsatzZiel || (s.einsatzZiel = pick(EINSAETZE)));
    let choices = ev ? ev.choices.filter((c) => !c.when || c.when(s)) : [];
    if (ev && ev.id === 'lgan') {
      choices = [
        { t: 'Bewerben', gen: true },
        ev.choices[1],
      ];
    }
    el.innerHTML = `
      <div class="page-head"><span class="kicker">Karrieresimulator · ${esc(TSK[s.tsk].name)} · ${esc(s.verw)}</span><h1>${esc(s.name)}</h1></div>
      <div class="sim-grid section">
        <div>
          <div class="sim-panel event-card">
            <span class="kicker">Dienstzeit ${fmtZeit(s.m)}</span>
            ${ev ? `<h3>${esc(ev.title)}</h3><p>${esc(fill(ev.text))}</p>
              <div class="choices">${choices.map((c, i) => `<button class="choice" data-i="${i}"><b>${esc(c.t)}</b>${c.chance ? `<small>Risiko: ${typeof c.chance === 'number' ? Math.round((1 - c.chance) * 100) + ' % Misserfolg' : 'abhängig von deiner Fitness'}</small>` : ''}</button>`).join('')}</div>`
              : `<h3>Dienstalltag</h3><p>Ein ruhiges Quartal: Ausbildung, Wachdienst, Materialpflege und Sport. Wie nutzt du die Zeit?</p>
              <div class="choices">
                <button class="choice" data-r="fitness"><b>Mehr Sport</b><small>Fitness ↑</small></button>
                <button class="choice" data-r="wissen"><b>Vorschriften und Technik pauken</b><small>Fachwissen ↑</small></button>
                <button class="choice" data-r="team"><b>Kameradschaftsabend organisieren</b><small>Kameradschaft ↑, Motivation ↑</small></button>
                <button class="choice" data-r="rest"><b>Überstunden abfeiern</b><small>Gesundheit ↑, Motivation ↑</small></button>
              </div>`}
          </div>
          <div class="sim-panel" style="margin-top:16px">
            <h3>Dienstzeit</h3>
            <div class="progress"><i style="width:${Math.min(100, s.m / totalM * 100)}%"></i></div>
            <p class="small muted" style="margin:0">${fmtZeit(s.m)} von ${s.bs ? 'bis zur Pensionierung' : s.jahre + ' Jahren'} · ${s.einsaetze} Auslandseinsätze</p>
            <div class="log" id="log">${s.log.slice().reverse().map((l) => `<div class="${l.c || ''}"><b>${fmtZeit(l.m)}</b> – ${esc(l.t)}</div>`).join('')}</div>
          </div>
        </div>
        <aside class="sim-panel">
          <div class="rank-badge">${insigniaSvg(r.ins, 54).replace('<svg', '<svg class="ins"')}<div><b>${esc(r.name)}</b><span>${esc(r.nato)} · ${esc(LAUFBAHN[s.lb].name)}laufbahn${s.bs ? ' · Berufssoldat' : ''}</span></div></div>
          ${STATS.map(([k, l]) => `<div class="attr"><span>${l}</span><div class="bar"><i style="width:${s[k]}%;${s[k] < 25 ? 'background:var(--rot)' : ''}"></i></div><b>${s[k]}</b></div>`).join('')}
          <div class="attr"><span>Beurteilung</span><div class="bar"><i style="width:${s.bew}%;background:var(--gold)"></i></div><b>${s.bew}</b></div>
          <h3 style="margin-top:16px">Auszeichnungen</h3>
          ${s.medals.length ? `<ul class="small" style="padding-left:18px;margin:0">${s.medals.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="small muted">Noch keine.</p>'}
          <button class="btn secondary small" id="reset" style="margin-top:16px">Neue Karriere</button>
        </aside>
      </div>`;

    $$('.choice[data-i]', el).forEach((b) => b.addEventListener('click', () => choose(ev, choices[Number(b.dataset.i)])));
    $$('.choice[data-r]', el).forEach((b) => b.addEventListener('click', () => routine(b.dataset.r)));
    $('#reset', el).addEventListener('click', () => { if (confirm('Aktuelle Karriere wirklich beenden?')) { store.del('karriere'); s = null; startScreen(); } });
  }

  function routine(kind) {
    const fx = { fitness: { fitness: 5, moral: -1 }, wissen: { wissen: 5, moral: -1 }, team: { team: 5, moral: 3 }, rest: { gesund: 6, moral: 4, bew: -1 } }[kind];
    const tmp = [];
    applyFx(s, fx, tmp);
    s.log.push({ m: s.m, t: `Dienstalltag. ${tmp.join('')}` });
    advance();
  }

  function choose(ev, c) {
    const tmp = [];
    let msg = c.msg, ok = true;
    if (c.gen) {
      const score = (s.wissen + s.fuehrung + s.bew * 2) / 4;
      ok = score + rand(-8, 8) > 68;
      if (ok) { s.flags.generalstab = true; applyFx(s, { wissen: 10, fuehrung: 8, bew: 6 }, tmp); msg = 'Ausgewählt! Nach zwei Jahren an der Führungsakademie trägst du die Kragenspiegel des Generalstabsdienstes. Der Weg zum General ist offen.'; }
      else { applyFx(s, { moral: -6 }, tmp); msg = 'Leider nicht ausgewählt. Die Konkurrenz war zu stark.'; }
    } else {
      let chance = c.chance;
      if (chance === 'fitness') chance = clamp(s.fitness / 100 + 0.2, 0.2, 0.95);
      ok = !chance || Math.random() < chance;
      if (ok) { applyFx(s, c.fx, tmp); if (c.medalOnSuccess) addMedal(s, c.medalOnSuccess); }
      else { applyFx(s, c.fail, tmp); msg = c.failMsg; }
      if (ev.id === 'einsatz' && c.fx.einsatz) s.einsatzZiel = null;
    }
    const net = Object.entries((ok ? c.fx : c.fail) || {}).reduce((a, [k, v]) => a + (typeof v === 'number' && k !== 'einsatz' ? v : 0), 0);
    s.log.push({ m: s.m, t: `${ev.title}: ${msg}${tmp.length ? ' (' + tmp.join('') + ')' : ''}`, c: !ok || net < 0 ? 'bad' : net > 0 ? 'good' : '' });
    toast(msg);
    advance();
  }

  function advance() {
    s.m += 3;
    // natürliche Entwicklung
    s.moral = clamp(s.moral - 1, 0, 100);
    s.bew = clamp(Math.round(s.bew - (s.bew - 50) * 0.04), 0, 100); // Beurteilungen gleichen sich über die Zeit an
    if (s.m / 12 > 15) s.gesund = clamp(s.gesund - 1, 0, 100);
    const prom = promotionCheck(s);
    if (prom) { s.log.push({ m: s.m, t: `Beförderung: ${prom}! 🎖`, c: 'good' }); s.moral = clamp(s.moral + 8, 0, 100); toast(`Beförderung: ${prom}`); }
    medalsByTime(s);

    if (s.gesund <= 0) return finish('Dienstunfähig: Deine Gesundheit lässt den Dienst nicht mehr zu.');
    if (s.moral <= 0) return finish('Du hast den Antrag auf Entlassung gestellt – die Motivation war aufgebraucht.');
    if (s.m >= 40 * 12) return finish('Nach 40 Dienstjahren gehst du in den wohlverdienten Ruhestand.');
    if (!s.bs && s.m >= s.jahre * 12) return verlaengerung();
    nextTurn();
  }

  function verlaengerung() {
    save();
    const canBS = s.lb !== 'mann' && s.bew >= 60;
    el.querySelector('.event-card').innerHTML = `
      <span class="kicker">Dienstzeitende erreicht</span>
      <h3>Wie geht es weiter?</h3>
      <p>Deine Verpflichtungszeit von ${s.jahre} Jahren ist abgelaufen. Deine Beurteilung liegt bei ${s.bew} Punkten.</p>
      <div class="choices">
        <button class="choice" data-v="ext"><b>Weiterverpflichten (+${s.lb === 'mann' ? 2 : 4} Jahre)</b></button>
        ${canBS ? '<button class="choice" data-v="bs"><b>Übernahme als Berufssoldat beantragen</b><small>Dienst bis zur Altersgrenze</small></button>' : '<button class="choice" disabled><b>Berufssoldat</b><small>Erst ab Beurteilung 60 und nicht in der Mannschaftslaufbahn</small></button>'}
        ${s.lb === 'mann' ? '<button class="choice" data-v="uffz"><b>In die Feldwebellaufbahn wechseln</b><small>Neue Verpflichtung 8 Jahre</small></button>' : ''}
        <button class="choice" data-v="end"><b>Ins Zivilleben wechseln</b><small>Mit Berufsförderungsdienst (BFD)</small></button>
      </div>`;
    $$('.choice[data-v]', el).forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.v;
      if (v === 'end') return finish('Du verlässt die Bundeswehr mit Stolz und startest mit dem Berufsförderungsdienst ins Zivilleben.');
      if (v === 'ext') { s.jahre += s.lb === 'mann' ? 2 : 4; s.log.push({ m: s.m, t: 'Weiterverpflichtet.', c: 'good' }); }
      if (v === 'bs') { s.bs = true; s.jahre = 40; s.log.push({ m: s.m, t: 'Übernahme als Berufssoldat!', c: 'good' }); }
      if (v === 'uffz') {
        const idx = LAUFBAHN.uffz.ladder.findIndex(([, m]) => m > 12);
        s.lb = 'uffz'; s.rank = Math.min(s.rank, idx - 1); s.jahre = Math.ceil(s.m / 12) + 8; s.lbStart = s.m - 9;
        s.seen.uffzLg = false; s.seen.fwLg = false;
        s.log.push({ m: s.m, t: 'Laufbahnwechsel zum Feldwebelanwärter.', c: 'good' });
      }
      nextTurn();
    }));
  }

  function finish(reason) {
    s.over = true; s.endReason = reason; save();
    endScreen();
  }

  function endScreen() {
    const r = rankInfo(s);
    const score = Math.round(s.rank * 120 + s.medals.length * 40 + s.einsaetze * 60 + s.bew * 3 + s.m);
    const best = store.get('karriereBest', 0);
    if (score > best) store.set('karriereBest', score);
    el.innerHTML = `
      <div class="page-head"><span class="kicker">Karrieresimulator</span><h1>Dienstzeugnis</h1><hr class="rule"><p>${esc(s.endReason || '')}</p></div>
      <div class="sim-grid section">
        <div class="sim-panel">
          <div class="rank-badge">${insigniaSvg(r.ins, 54).replace('<svg', '<svg class="ins"')}<div><b>${esc(r.name)} ${esc(s.name)}</b><span>${esc(TSK[s.tsk].name)} · ${esc(s.verw)}</span></div></div>
          <table class="specs"><tbody>
            <tr><th>Dienstzeit</th><td>${Math.floor(s.m / 12)} Jahre, ${s.m % 12} Monate</td></tr>
            <tr><th>Endgültiger Dienstgrad</th><td>${esc(r.name)} (${esc(r.nato)})</td></tr>
            <tr><th>Auslandseinsätze</th><td>${s.einsaetze}</td></tr>
            <tr><th>Beurteilung</th><td>${s.bew} / 100</td></tr>
            <tr><th>Auszeichnungen</th><td>${s.medals.map(esc).join('<br>') || '–'}</td></tr>
            <tr><th>Karrierepunkte</th><td><b>${score}</b> ${score > best ? '– neuer Rekord!' : `(Rekord: ${best})`}</td></tr>
          </tbody></table>
          <button class="btn" id="again" style="margin-top:16px">Neue Karriere starten</button>
        </div>
        <aside class="sim-panel"><h3>Lebenslauf</h3><div class="log" style="max-height:480px">${s.log.map((l) => `<div class="${l.c || ''}"><b>${fmtZeit(l.m)}</b> – ${esc(l.t)}</div>`).join('')}</div></aside>
      </div>`;
    $('#again', el).addEventListener('click', () => { store.del('karriere'); s = null; startScreen(); });
  }

  if (!s) startScreen();
  else if (s.over) endScreen();
  else game();
}
