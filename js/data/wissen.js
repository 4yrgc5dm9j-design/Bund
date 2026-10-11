// Wissensdaten: Fakten, Quiz, Dienstgrade, Einsätze, Geschichte, Lexikon.

export const FAKTEN = [
  'Die Bundeswehr wurde am 12. November 1955 gegründet – dem 200. Geburtstag des preußischen Heeresreformers Gerhard von Scharnhorst. 101 Freiwillige erhielten an diesem Tag ihre Ernennungsurkunden.',
  'Der Name „Bundeswehr“ wurde vom früheren General und FDP-Politiker Hasso von Manteuffel vorgeschlagen.',
  'Die Bundeswehr ist eine Parlamentsarmee: Bewaffnete Auslandseinsätze brauchen die Zustimmung des Bundestages.',
  'Das Leitbild der Bundeswehr ist der „Staatsbürger in Uniform“ – Grundlage ist das Konzept der Inneren Führung.',
  'Im Kalten Krieg hatte die Bundeswehr knapp 500.000 Soldaten. 1990 wurden Teile der NVA übernommen – die „Armee der Einheit“ entstand.',
  'Die Wehrpflicht wurde 1956 eingeführt und am 1. Juli 2011 ausgesetzt. Seit 2026 gibt es den neuen Wehrdienst mit verpflichtendem Fragebogen für junge Männer.',
  'Das Eiserne Kreuz in der Form des „Tatzenkreuzes“ ist das Hoheitszeichen der Bundeswehr – zu sehen auf Fahrzeugen, Flugzeugen und Schiffen.',
  'Der Große Zapfenstreich ist das höchste militärische Zeremoniell der Bundeswehr.',
  'Seit 2001 stehen Frauen alle Laufbahnen in der Bundeswehr offen – auch in den Kampftruppen.',
  'Die Universitäten der Bundeswehr in Hamburg und München wurden 1973 gegründet. Offiziere studieren dort in Trimestern – ein Master dauert meist nur rund vier Jahre.',
  'Bei der Evakuierungsoperation aus Kabul im August 2021 flog die Luftwaffe mit A400M mehr als 5.300 Menschen aus.',
  'Die Panzerbrigade 45 in Litauen ist die erste dauerhaft im Ausland stationierte Brigade der Bundeswehr. Sie soll bis 2027 rund 5.000 Soldatinnen und Soldaten umfassen.',
  'Das Segelschulschiff „Gorch Fock“ lief 1958 vom Stapel und hat seitdem Generationen von Offizieranwärtern der Marine ausgebildet.',
  'Der Kampfpanzer Leopard 2 ist seit 1979 im Dienst und wird von über einem Dutzend Staaten genutzt.',
  'Am 27. Februar 2022 kündigte die Bundesregierung ein Sondervermögen von 100 Milliarden Euro für die Bundeswehr an – die „Zeitenwende“.',
  'Die Fregatte „Hessen“ schoss 2024 im Roten Meer erstmals in der Geschichte der Marine feindliche Drohnen im Gefecht ab.',
  'Die U-Boote der Klasse 212A können dank Brennstoffzellen wochenlang getaucht bleiben – und sind fast lautlos.',
  'Feierliche Gelöbnisse finden jedes Jahr am 20. Juli im Bendlerblock in Berlin statt – in Erinnerung an das Attentat auf Hitler 1944.',
  'Die Alarmrotte der Luftwaffe (Quick Reaction Alert) ist rund um die Uhr in Bereitschaft und kann binnen Minuten in der Luft sein.',
  'Der Kosovo-Einsatz KFOR läuft seit 1999 und ist der am längsten andauernde Auslandseinsatz der Bundeswehr.',
  'Die Bundeswehr hilft regelmäßig im Inland, z. B. bei Hochwassern wie an der Oder 1997, an der Elbe 2002/2013 oder im Ahrtal 2021.',
  'Das Kommando Spezialkräfte (KSK) in Calw wurde 1996 aufgestellt. Die Marine hat mit den Kampfschwimmern ihre eigene Spezialeinheit.',
  'Die Bundeswehr gehört zu den größten Arbeitgebern Deutschlands und bildet in über 1.000 Berufen aus.',
  'Mit dem A400M kann die Luftwaffe auch auf unbefestigten Pisten landen – sogar auf Sand oder Gras.',
  'Die Puma-Schützenpanzer können je nach Schutzstufe im Airbus A400M transportiert werden.',
];

export const QUIZ = [
  { q: 'Wann wurde die Bundeswehr gegründet?', a: ['12. November 1955', '23. Mai 1949', '3. Oktober 1990', '1. Januar 1956'], c: 0 },
  { q: 'Wie heißt der Kampfpanzer der Bundeswehr?', a: ['Leopard 2', 'Puma', 'Tiger', 'Boxer'], c: 0 },
  { q: 'Welcher Dienstgrad entspricht in der Marine dem Major?', a: ['Korvettenkapitän', 'Fregattenkapitän', 'Kapitänleutnant', 'Kapitän zur See'], c: 0 },
  { q: 'Wer muss bewaffneten Auslandseinsätzen zustimmen?', a: ['Der Deutsche Bundestag', 'Der Bundespräsident allein', 'Der Generalinspekteur', 'Die NATO'], c: 0 },
  { q: 'Wann wurde die Wehrpflicht ausgesetzt?', a: ['2011', '2001', '1990', '2022'], c: 0 },
  { q: 'Was ist der „Puma“?', a: ['Ein Schützenpanzer', 'Ein Kampfhubschrauber', 'Eine Fregatte', 'Ein Sturmgewehr'], c: 0 },
  { q: 'In welchem Land ist die Panzerbrigade 45 stationiert?', a: ['Litauen', 'Polen', 'Estland', 'Rumänien'], c: 0 },
  { q: 'Welches Flugzeug ersetzt den Tornado in der nuklearen Teilhabe?', a: ['F-35A', 'Eurofighter', 'Rafale', 'F-16'], c: 0 },
  { q: 'Wie heißt das neue Standardgewehr, das das G36 ablöst?', a: ['G95', 'G38', 'G28', 'MG5'], c: 0 },
  { q: 'Wo befindet sich das Kommando Spezialkräfte (KSK)?', a: ['Calw', 'Munster', 'Koblenz', 'Eckernförde'], c: 0 },
  { q: 'Welcher Hubschrauber ersetzt den CH-53G?', a: ['CH-47F Chinook', 'NH90', 'Tiger', 'H145M'], c: 0 },
  { q: 'Was bedeutet die Abkürzung BMVg?', a: ['Bundesministerium der Verteidigung', 'Bundesmarine-Verwaltung', 'Bundesmilitärversorgung', 'Bund militärischer Verbände'], c: 0 },
  { q: 'Welches Schiff ist das Segelschulschiff der Marine?', a: ['Gorch Fock', 'Berlin', 'Sachsen', 'Elbe'], c: 0 },
  { q: 'Welcher Dienstgrad ist der höchste Unteroffizier-Dienstgrad im Heer?', a: ['Oberstabsfeldwebel', 'Stabsfeldwebel', 'Hauptfeldwebel', 'Oberfähnrich'], c: 0 },
  { q: 'Wie viele Sterne trägt ein General (OF-9) auf der Schulter?', a: ['Vier', 'Drei', 'Zwei', 'Fünf'], c: 0 },
  { q: 'Welches Leitbild prägt die Bundeswehr?', a: ['Staatsbürger in Uniform', 'Soldat ohne Fragen', 'Krieger des Volkes', 'Armee der Krone'], c: 0 },
  { q: 'Welche Fregattenklasse ist auf Luftverteidigung spezialisiert?', a: ['F124 Sachsen-Klasse', 'F123 Brandenburg-Klasse', 'F125 Baden-Württemberg-Klasse', 'K130 Braunschweig-Klasse'], c: 0 },
  { q: 'Wie hoch war das 2022 beschlossene Sondervermögen?', a: ['100 Mrd. Euro', '10 Mrd. Euro', '50 Mrd. Euro', '1 Billion Euro'], c: 0 },
  { q: 'Wo werden Offiziere der Marine ausgebildet?', a: ['Marineschule Mürwik', 'Offizierschule des Heeres', 'Führungsakademie Hamburg', 'Marinetechnikschule Parow'], c: 0 },
  { q: 'Welcher Einsatz läuft am längsten (seit 1999)?', a: ['KFOR im Kosovo', 'UNIFIL', 'EUFOR Althea', 'ISAF'], c: 0 },
  { q: 'Wofür steht „CIR“?', a: ['Cyber- und Informationsraum', 'Central Intelligence Reserve', 'Combat Infantry Regiment', 'Cyber-Internet-Resilienz'], c: 0 },
  { q: 'Welches Transportflugzeug nutzt die Luftwaffe hauptsächlich?', a: ['A400M', 'C-130J', 'C-17', 'Transall C-160 (neu)'], c: 0 },
  { q: 'Was ist ein „Spieß“?', a: ['Der Kompaniefeldwebel', 'Ein Bajonett', 'Der Kommandeur', 'Ein Rekrut'], c: 0 },
  { q: 'Welches Flugabwehrsystem stammt von Diehl Defence?', a: ['IRIS-T SLM', 'Patriot', 'Skyranger', 'NASAMS'], c: 0 },
  { q: 'Welches Fahrzeug ist ein Spähwagen der Aufklärungstruppe?', a: ['Fennek', 'Dingo', 'Wiesel', 'Büffel'], c: 0 },
  { q: 'Wie heißt das höchste militärische Zeremoniell der Bundeswehr?', a: ['Großer Zapfenstreich', 'Feierliches Gelöbnis', 'Appell', 'Flaggenparade'], c: 0 },
  { q: 'Was ist die PzH 2000?', a: ['Eine Panzerhaubitze', 'Ein Kampfpanzer', 'Eine Drohne', 'Ein Minenräumer'], c: 0 },
  { q: 'Welche Teilstreitkraft betreibt die P-8A Poseidon?', a: ['Marine', 'Luftwaffe', 'Heer', 'CIR'], c: 0 },
  { q: 'Wann wurden Frauen für alle Laufbahnen zugelassen?', a: ['2001', '1975', '1990', '2011'], c: 0 },
  { q: 'Was ist der höchste militärische Dienstposten der Bundeswehr?', a: ['Generalinspekteur', 'Wehrbeauftragter', 'Inspekteur des Heeres', 'Verteidigungsminister'], c: 0 },
];

// Dienstgrade: g = Gruppe, h = Heer/Luftwaffe, m = Marine, nato, ins = Abzeichen-Code (schematisch)
export const DIENSTGRADE = [
  { g: 'Mannschaften', h: 'Soldat / Schütze / Flieger', m: 'Matrose', nato: 'OR-1', ins: { t: 'm', n: 0 } },
  { g: 'Mannschaften', h: 'Gefreiter', m: 'Gefreiter', nato: 'OR-2', ins: { t: 'm', n: 1 } },
  { g: 'Mannschaften', h: 'Obergefreiter', m: 'Obergefreiter', nato: 'OR-3', ins: { t: 'm', n: 2 } },
  { g: 'Mannschaften', h: 'Hauptgefreiter', m: 'Hauptgefreiter', nato: 'OR-3', ins: { t: 'm', n: 3 } },
  { g: 'Mannschaften', h: 'Stabsgefreiter', m: 'Stabsgefreiter', nato: 'OR-4', ins: { t: 'm', n: 4 } },
  { g: 'Mannschaften', h: 'Oberstabsgefreiter', m: 'Oberstabsgefreiter', nato: 'OR-4', ins: { t: 'm', n: 5 } },
  { g: 'Unteroffiziere ohne Portepee', h: 'Unteroffizier', m: 'Maat', nato: 'OR-5', ins: { t: 'u', n: 0 } },
  { g: 'Unteroffiziere ohne Portepee', h: 'Fahnenjunker', m: 'Seekadett', nato: 'OR-5', ins: { t: 'u', n: 0, fj: 1 } },
  { g: 'Unteroffiziere ohne Portepee', h: 'Stabsunteroffizier', m: 'Obermaat', nato: 'OR-5', ins: { t: 'u', n: 1 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Feldwebel', m: 'Bootsmann', nato: 'OR-6', ins: { t: 'f', n: 0 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Fähnrich', m: 'Fähnrich zur See', nato: 'OR-6', ins: { t: 'f', n: 0, fj: 1 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Oberfeldwebel', m: 'Oberbootsmann', nato: 'OR-6', ins: { t: 'f', n: 1 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Oberfähnrich', m: 'Oberfähnrich zur See', nato: 'OR-7', ins: { t: 'f', n: 1, fj: 1 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Hauptfeldwebel', m: 'Hauptbootsmann', nato: 'OR-7', ins: { t: 'f', n: 2 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Stabsfeldwebel', m: 'Stabsbootsmann', nato: 'OR-8', ins: { t: 'f', n: 3 } },
  { g: 'Unteroffiziere mit Portepee', h: 'Oberstabsfeldwebel', m: 'Oberstabsbootsmann', nato: 'OR-9', ins: { t: 'f', n: 4 } },
  { g: 'Leutnante & Hauptleute', h: 'Leutnant', m: 'Leutnant zur See', nato: 'OF-1', ins: { t: 'o', n: 1 } },
  { g: 'Leutnante & Hauptleute', h: 'Oberleutnant', m: 'Oberleutnant zur See', nato: 'OF-1', ins: { t: 'o', n: 2 } },
  { g: 'Leutnante & Hauptleute', h: 'Hauptmann', m: 'Kapitänleutnant', nato: 'OF-2', ins: { t: 'o', n: 3 } },
  { g: 'Leutnante & Hauptleute', h: 'Stabshauptmann', m: 'Stabskapitänleutnant', nato: 'OF-2', ins: { t: 'o', n: 3, bar: 1 } },
  { g: 'Stabsoffiziere', h: 'Major', m: 'Korvettenkapitän', nato: 'OF-3', ins: { t: 's', n: 1 } },
  { g: 'Stabsoffiziere', h: 'Oberstleutnant', m: 'Fregattenkapitän', nato: 'OF-4', ins: { t: 's', n: 2 } },
  { g: 'Stabsoffiziere', h: 'Oberst', m: 'Kapitän zur See', nato: 'OF-5', ins: { t: 's', n: 3 } },
  { g: 'Generale & Admirale', h: 'Brigadegeneral', m: 'Flottillenadmiral', nato: 'OF-6', ins: { t: 'g', n: 1 } },
  { g: 'Generale & Admirale', h: 'Generalmajor', m: 'Konteradmiral', nato: 'OF-7', ins: { t: 'g', n: 2 } },
  { g: 'Generale & Admirale', h: 'Generalleutnant', m: 'Vizeadmiral', nato: 'OF-8', ins: { t: 'g', n: 3 } },
  { g: 'Generale & Admirale', h: 'General', m: 'Admiral', nato: 'OF-9', ins: { t: 'g', n: 4 } },
];

/** Schematisches Schulterabzeichen als SVG (keine exakte Nachbildung). */
export function insigniaSvg(ins, size = 44) {
  const { t, n = 0, fj, bar } = ins || {};
  const board = t === 'g' ? '#b39b4a' : '#2f3a2a';
  const parts = [`<rect x="14" y="2" width="20" height="40" rx="10" ry="6" fill="${board}" stroke="#111" stroke-width="1"/>`, `<circle cx="24" cy="8" r="2" fill="#c9c9c9"/>`];
  const star = (cy, color = '#d9d9d9') => `<path transform="translate(24 ${cy})" fill="${color}" d="M0-4 1.2-1.2 4-1.2 1.8.6 2.6 3.6 0 1.8-2.6 3.6-1.8.6-4-1.2-1.2-1.2z"/>`;
  if (t === 'm') {
    for (let i = 0; i < Math.min(n, 3); i++) parts.push(`<path d="M16 ${34 - i * 6} l8 -4 8 4" stroke="#d9d9d9" stroke-width="2" fill="none"/>`);
    if (n >= 4) parts.push(`<rect x="17" y="14" width="14" height="2" fill="#d9d9d9"/>`);
    if (n >= 5) parts.push(`<rect x="17" y="18" width="14" height="2" fill="#d9d9d9"/>`);
  }
  if (t === 'u' || t === 'f') {
    parts.push(`<path d="M15 ${t === 'u' && !n ? 42 : 40} V12 h18 V${t === 'u' && !n ? 42 : 40}" stroke="#c9c9c9" stroke-width="2.5" fill="none"/>`);
    if (t === 'f' || n) parts.push(`<path d="M15 40 H33" stroke="#c9c9c9" stroke-width="2.5"/>`);
    for (let i = 0; i < n && t === 'f'; i++) parts.push(`<path d="M18 ${34 - i * 5} l6 -3 6 3" stroke="#c9c9c9" stroke-width="1.8" fill="none"/>`);
    if (fj) parts.push(`<rect x="15" y="24" width="18" height="3" fill="#c9c9c9"/>`);
  }
  if (t === 'o') {
    for (let i = 0; i < n; i++) parts.push(star(16 + i * 9));
    if (bar) parts.push(`<rect x="17" y="40" width="14" height="2" fill="#d9d9d9"/>`);
  }
  if (t === 's' || t === 'g') {
    const c = t === 'g' ? '#2b2b2b' : '#d9d9d9';
    parts.push(`<path d="M18 38 q6 -6 12 0" stroke="${c}" stroke-width="2" fill="none"/><path d="M18 36 q-1 -4 2 -6 M30 36 q1 -4 -2 -6" stroke="${c}" stroke-width="1.5" fill="none"/>`);
    for (let i = 0; i < n; i++) parts.push(star(14 + i * 6.5, c));
  }
  return `<svg viewBox="0 0 48 44" width="${size}" height="${size}" role="img" aria-hidden="true">${parts.join('')}</svg>`;
}

export const EINSAETZE = [
  { name: 'Panzerbrigade 45 / eFP Litauen', ort: 'Litauen', lat: 54.9, lng: 23.9, status: 'laufend', seit: '2017 (Brigade seit 2025)', text: 'Deutschland führt die NATO-Kampfgruppe in Litauen und stationiert dauerhaft eine Panzerbrigade zur Abschreckung an der NATO-Ostflanke.' },
  { name: 'KFOR', ort: 'Kosovo', lat: 42.66, lng: 21.16, status: 'laufend', seit: '1999', text: 'NATO-geführte Friedenstruppe im Kosovo – der längste Einsatz der Bundeswehr.' },
  { name: 'EUFOR Althea', ort: 'Bosnien und Herzegowina', lat: 43.85, lng: 18.41, status: 'laufend', seit: '2004 (Wiederbeteiligung seit 2022)', text: 'EU-Mission zur Stabilisierung von Bosnien und Herzegowina.' },
  { name: 'UNIFIL', ort: 'Libanon (Seegebiet)', lat: 33.9, lng: 35.2, status: 'laufend', seit: '2006', text: 'Die Marine überwacht vor der Küste des Libanon den Waffenschmuggel auf See und bildet die libanesische Marine aus.' },
  { name: 'EUNAVFOR Aspides', ort: 'Rotes Meer', lat: 15.5, lng: 41.5, status: 'laufend', seit: '2024', text: 'Schutz der Handelsschifffahrt vor Angriffen der Huthi-Miliz. Die Fregatte Hessen wehrte 2024 erfolgreich Drohnen ab.' },
  { name: 'EUNAVFOR MED Irini', ort: 'Mittelmeer', lat: 33.5, lng: 18.5, status: 'laufend', seit: '2020', text: 'Überwachung des UN-Waffenembargos gegen Libyen.' },
  { name: 'Counter Daesh / Capacity Building Iraq', ort: 'Irak & Jordanien', lat: 34.0, lng: 40.5, status: 'laufend', seit: '2015', text: 'Beitrag zur Anti-IS-Koalition: Luftbetankung aus Jordanien, Ausbildung und Beratung im Irak.' },
  { name: 'UNMISS', ort: 'Südsudan', lat: 4.85, lng: 31.58, status: 'laufend', seit: '2011', text: 'Beteiligung an der UN-Mission mit Stabs- und Verbindungsoffizieren.' },
  { name: 'MINURSO', ort: 'Westsahara', lat: 27.15, lng: -13.2, status: 'laufend', seit: '2013', text: 'Militärbeobachter der UN überwachen den Waffenstillstand.' },
  { name: 'NATO Air Policing Baltikum', ort: 'Estland / Litauen', lat: 58.9, lng: 25.4, status: 'wiederkehrend', seit: '2005', text: 'Eurofighter der Luftwaffe sichern regelmäßig den Luftraum der baltischen Staaten.' },
  { name: 'Baltic Sentry', ort: 'Ostsee', lat: 55.6, lng: 17.0, status: 'laufend', seit: '2025', text: 'NATO-Aktivität zum Schutz kritischer Unterwasser-Infrastruktur wie Kabel und Pipelines.' },
  { name: 'ISAF / Resolute Support', ort: 'Afghanistan', lat: 36.7, lng: 67.1, status: 'beendet', seit: '2001–2021', text: 'Größter und verlustreichster Einsatz der Bundeswehr. 59 deutsche Soldaten kamen ums Leben. Abschluss mit der Evakuierung aus Kabul im August 2021.' },
  { name: 'MINUSMA', ort: 'Mali', lat: 16.27, lng: -0.04, status: 'beendet', seit: '2013–2023', text: 'UN-Stabilisierungsmission; die Bundeswehr betrieb u. a. das Camp Castor in Gao.' },
  { name: 'SFOR / IFOR', ort: 'Bosnien und Herzegowina', lat: 44.2, lng: 17.9, status: 'beendet', seit: '1995–2004', text: 'Absicherung des Dayton-Friedensabkommens.' },
  { name: 'Hochwasser-Amtshilfe Ahrtal', ort: 'Rheinland-Pfalz', lat: 50.54, lng: 7.11, status: 'beendet', seit: '2021', text: 'Tausende Soldatinnen und Soldaten halfen nach der Flutkatastrophe mit Bergepanzern, Pionieren und Hubschraubern.' },
];

export const GESCHICHTE = [
  { y: '1950', t: 'Himmeroder Denkschrift', d: 'Ehemalige Offiziere entwerfen im Kloster Himmerod die Grundlagen für westdeutsche Streitkräfte.' },
  { y: '1955', t: 'Gründung der Bundeswehr', d: 'Am 12. November erhalten die ersten 101 Freiwilligen ihre Ernennungsurkunden. Die Bundesrepublik tritt der NATO bei.' },
  { y: '1956', t: 'Wehrpflicht & Teilstreitkräfte', d: 'Einführung der allgemeinen Wehrpflicht; Heer, Luftwaffe und Marine werden aufgebaut.' },
  { y: '1962', t: 'Sturmflut Hamburg', d: 'Erster großer Katastropheneinsatz im Inland: Soldaten retten über 1.000 Menschen.' },
  { y: '1973', t: 'Universitäten der Bundeswehr', d: 'In Hamburg und München nehmen die Hochschulen für Offiziere den Betrieb auf.' },
  { y: '1979', t: 'Leopard 2', d: 'Der neue Kampfpanzer wird eingeführt und prägt die Panzertruppe bis heute.' },
  { y: '1990', t: 'Armee der Einheit', d: 'Mit der Deutschen Einheit werden Teile der Nationalen Volksarmee übernommen.' },
  { y: '1994', t: 'Urteil zum Parlamentsvorbehalt', d: 'Das Bundesverfassungsgericht entscheidet: Bewaffnete Auslandseinsätze brauchen die Zustimmung des Bundestages.' },
  { y: '1999', t: 'Kosovo', d: 'Erster Kampfeinsatz im NATO-Rahmen; seitdem Beteiligung an KFOR.' },
  { y: '2001', t: 'Frauen in allen Laufbahnen', d: 'Nach einem Urteil des Europäischen Gerichtshofs öffnen sich alle Laufbahnen für Frauen.' },
  { y: '2002', t: 'Afghanistan', d: 'Beginn des ISAF-Einsatzes – fast 20 Jahre Präsenz am Hindukusch.' },
  { y: '2011', t: 'Aussetzung der Wehrpflicht', d: 'Die Bundeswehr wird zur Freiwilligenarmee; Einführung des Freiwilligen Wehrdienstes.' },
  { y: '2017', t: 'Kommando CIR', d: 'Der Organisationsbereich Cyber- und Informationsraum wird aufgestellt. Deutschland führt die NATO-Kampfgruppe in Litauen.' },
  { y: '2021', t: 'Evakuierung Kabul', d: 'Größte Evakuierungsoperation der Bundeswehr; Ende des Afghanistan-Einsatzes.' },
  { y: '2022', t: 'Zeitenwende', d: 'Nach dem russischen Angriff auf die Ukraine: Sondervermögen von 100 Mrd. Euro.' },
  { y: '2024', t: 'Neue Struktur', d: 'Aufstellung des Operativen Führungskommandos; die Fregatte Hessen schützt die Schifffahrt im Roten Meer.' },
  { y: '2025', t: 'Brigade Litauen', d: 'Die Panzerbrigade 45 wird in Vilnius in Dienst gestellt – erste dauerhaft im Ausland stationierte Brigade.' },
  { y: '2026', t: 'Neuer Wehrdienst', d: 'Junge Männer erhalten einen verpflichtenden Fragebogen; der Wehrdienst wird attraktiver und flexibler.' },
];

export const LEXIKON = [
  ['ABC-Abwehr', 'Schutz vor atomaren, biologischen und chemischen Gefahren.'],
  ['Alarmposten', 'Wache, die bei Gefahr Alarm auslöst.'],
  ['Antreten', 'Sich in Formation aufstellen.'],
  ['BAAINBw', 'Bundesamt für Ausrüstung, Informationstechnik und Nutzung der Bundeswehr (Koblenz) – zuständig für die Beschaffung.'],
  ['Biwak', 'Behelfsmäßiges Nachtlager im Gelände.'],
  ['BMVg', 'Bundesministerium der Verteidigung.'],
  ['Bund', 'Umgangssprachlich für die Bundeswehr („beim Bund sein“).'],
  ['DZE', 'Dienstzeitende.'],
  ['EGB', 'Erweiterte Grundbefähigung – Infanterieausbildung für Spezialkräfteanwärter.'],
  ['FWDL', 'Freiwillig Wehrdienstleistende.'],
  ['Flecktarn', 'Das typische fünffarbige Tarnmuster der Bundeswehr.'],
  ['GA', 'Grundausbildung – die ersten Wochen als Rekrut.'],
  ['Gelöbnis', 'Feierliches Versprechen der Rekruten, der Bundesrepublik treu zu dienen.'],
  ['GÜZ', 'Gefechtsübungszentrum Heer in der Altmark – hier wird mit Lasersimulatoren geübt.'],
  ['Innere Führung', 'Führungsphilosophie der Bundeswehr: Soldaten als mündige Bürger mit Rechten und Pflichten.'],
  ['KdoH / KdoLw / MarKdo', 'Kommando Heer / Kommando Luftwaffe / Marinekommando.'],
  ['KSK', 'Kommando Spezialkräfte (Calw).'],
  ['Kompaniefeldwebel', 'Der „Spieß“ – ranghöchster Unteroffizier einer Kompanie und „Mutter der Kompanie“.'],
  ['Maßband', 'Tradition: Wehrpflichtige schnitten jeden Tag ein Stück ihres Maßbandes bis zum Dienstzeitende ab.'],
  ['MELLS', 'Mehrrollenfähiges Leichtes Lenkflugkörpersystem (Spike LR).'],
  ['Nato-Alphabet', 'Buchstabieralphabet im Funkverkehr: Alfa, Bravo, Charlie …'],
  ['OPZ', 'Operationszentrale.'],
  ['QRA', 'Quick Reaction Alert – Alarmrotte der Luftwaffe.'],
  ['SaZ', 'Soldat auf Zeit (z. B. SaZ 12 = für 12 Jahre verpflichtet).'],
  ['BS', 'Berufssoldat.'],
  ['Stube', 'Gemeinschaftszimmer in der Kaserne.'],
  ['Stubendurchgang', 'Kontrolle der Stube auf Ordnung und Sauberkeit.'],
  ['TaktLwG', 'Taktisches Luftwaffengeschwader.'],
  ['TrÜbPl', 'Truppenübungsplatz.'],
  ['UvD / GvD', 'Unteroffizier vom Dienst / Gefreiter vom Dienst.'],
  ['Zapfenstreich', 'Ende der Ausgehzeit; der Große Zapfenstreich ist das höchste Zeremoniell.'],
  ['ZDv', 'Zentrale Dienstvorschrift.'],
  ['Zeitenwende', 'Begriff für den sicherheitspolitischen Kurswechsel ab Februar 2022.'],
];

export const NATO_ALPHABET = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India',
  J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo',
  S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
  0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner',
};

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...',
  8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.',
};
