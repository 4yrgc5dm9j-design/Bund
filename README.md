# Bundeswehr

Eine installierbare Web-App (PWA) rund um die Bundeswehr – im Look der Bundeswehr
(Anthrazit, Oliv, Schwarz-Rot-Gold, Tatzenkreuz) und optimiert für Smartphone und Desktop.

> Inoffizielle Informations- und Fan-App. Kein offizielles Angebot der Bundeswehr oder des BMVg.

## Funktionen

| Bereich | Inhalt |
|---|---|
| **Start** | Bild-Slideshow, Kennzahlen, „Wusstest du schon?“-Fakt des Tages, neueste Meldungen, Organisation der Teilstreitkräfte |
| **News** | Live-Nachrichten zur Bundeswehr (tagesschau-API, Google News) mit Filtern: Heer, Luftwaffe, Marine, Einsätze, Beschaffung, Wehrdienst, NATO, Litauen-Brigade + freie Suche |
| **Standortkarte** | ~115 Standorte (Heer, Luftwaffe, Marine, CIR, Sanität, Unterstützung, Schulen, Kommandos, Ausland) auf einer interaktiven Leaflet-Karte mit Filter, Suche und Liste; zuschaltbare Ebene mit Auslandseinsätzen |
| **Galerie** | Tausende frei lizenzierte Fotos von Wikimedia Commons (viele direkt von der Bundeswehr), Kategorien, Suche, Lightbox mit Urheberangabe |
| **Ausrüstung** | ~45 Systeme – Landfahrzeuge, Luftfahrzeuge, Schiffe & Boote, Waffen – mit technischen Daten, Beschreibung, Wikipedia-Auszug, Fotogalerie, Favoriten |
| **Karrieresimulator** | Laufbahn wählen (Mannschaften, Feldwebel, Offizier), Organisationsbereich und Verwendung; Quartal für Quartal entscheiden, befördert werden, Lehrgänge, Studium, Auslandseinsätze, Auszeichnungen, Dienstzeugnis |
| **Gefechtssimulator** | Rundenbasiertes Taktikspiel mit Leopard 2, Puma, Jägern, PzH 2000, Fennek und Tiger gegen fiktive Feindkräfte – Gelände, Deckung, Sichtlinien, Aufklärung (Fog of War), Steilfeuer, Erwiderungsfeuer, 3 Szenarien, NATO-Taktische Zeichen |
| **Extras** | Wissensquiz, Dienstgrade (Heer/Luftwaffe/Marine + NATO-Code), Einsätze, Geschichte (Zeitstrahl), Fitness-Check (BFT-Training), Funk & Morse (NATO-Alphabet, Morse mit Ton, Trainer), digitales Maßband bis zum DZE, Lexikon der Soldatensprache, Hell-/Dunkelmodus |

## Starten

Keine Build-Schritte nötig – reines HTML/CSS/JavaScript (ES-Module).

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Auf dem Handy über „Zum Startbildschirm hinzufügen“ als App installieren. Die App-Shell funktioniert dank Service Worker auch offline.

### Veröffentlichen

Der Workflow `.github/workflows/pages.yml` veröffentlicht die App bei jedem Push auf `main` über GitHub Pages
(in den Repository-Einstellungen unter *Pages* als Quelle „GitHub Actions“ wählen).

## Aufbau

```
index.html            App-Gerüst, Navigation
css/style.css         Design-System (Farben, Typografie, Komponenten, Dark Mode)
js/app.js             Router, Navigation, Lightbox, Theme, Service-Worker-Registrierung
js/lib/               Helfer, Wikimedia-/Wikipedia-Bilder, News-Quellen
js/data/              Standorte, Ausrüstung, Wissen (Quiz, Dienstgrade, Einsätze, Geschichte, Lexikon)
js/views/             Eine Datei pro Ansicht
vendor/leaflet/       Kartenbibliothek (BSD-2-Clause)
sw.js                 Offline-Cache
```

## Quellen & Lizenzen

- Fotos: Wikimedia Commons / Wikipedia – Urheber und Lizenz werden zu jedem Bild angezeigt.
- Karte: © OpenStreetMap-Mitwirkende, © CARTO.
- News: Inhalte der jeweils verlinkten Medien.
- Technische Daten sind gerundete Richtwerte aus öffentlichen Quellen (ohne Gewähr). Simulationen sind vereinfacht und fiktiv.
