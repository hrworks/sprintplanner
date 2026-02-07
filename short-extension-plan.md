# Sprint Planner - Feature-Erweiterungsplan (Kurzfassung)

> Erstellt: 2026-02-08  
> Quellen: Codebase-Analyse, GanttPRO Features, Wrike Features

---

## Aktueller Stand

Dein Sprint Planner hat bereits:
- ✅ Gantt-Chart mit Drag & Drop
- ✅ Projekte mit Phasen
- ✅ Multi-User mit Rollen (Owner/Editor/Viewer)
- ✅ Echtzeit-Sync (SSE + WebSocket Cursor)
- ✅ Connections zwischen Phasen
- ✅ Status-System für Projekte
- ✅ Filter (Status, Locked, Completed)
- ✅ JSON Import/Export

---

## Team & Resource Management

### 1. Assignees pro Phase
**Priorität: 10/10**

**Was fehlt:** Aktuell können Phasen keiner Person zugewiesen werden. Das `subtitle`-Feld wird manchmal als Workaround genutzt.

**Einbettung:** Erweiterung des Phase-Objekts um `assigneeIds[]`. Im DetailPanel ein Dropdown zur Auswahl von Board-Mitgliedern. Auf den Gantt-Balken kleine Avatare anzeigen.

**Vorteile:**
- Klare Verantwortlichkeiten pro Phase
- Grundlage für Workload-Berechnung
- Filter nach Person möglich
- Team sieht sofort wer woran arbeitet

---

### 2. Team-Ansicht (Resource View)
**Priorität: 10/10**

**Was fehlt:** Es gibt nur die Projekt-Ansicht. Keine Möglichkeit zu sehen, was eine einzelne Person alles zu tun hat.

**Einbettung:** Toggle-Button in der Topbar zwischen "Projekt-Ansicht" und "Team-Ansicht". In der Team-Ansicht sind die Zeilen = Personen statt Projekte. Alle zugewiesenen Phasen einer Person erscheinen horizontal in ihrer Zeile.

**Vorteile:**
- Sofortiger Überblick über individuelle Auslastung
- Erkennen von Überschneidungen bei einer Person
- Sprint-Planung aus Team-Perspektive
- Ressourcen-Engpässe werden sichtbar

---

### 3. Workload-Ansicht
**Priorität: 9/10**

**Was fehlt:** Keine Visualisierung der Auslastung. Man sieht nicht, wer überlastet ist oder Kapazität hat.

**Einbettung:** Neues Panel (ähnlich wie das DetailPanel) oder eigener Tab. Zeigt pro Person einen Balken mit Auslastung in Prozent. Rot bei Überlastung (>100%), Grün bei freier Kapazität.

**Vorteile:**
- Burnout-Prävention durch frühzeitiges Erkennen von Überlastung
- Bessere Verteilung der Arbeit
- Datenbasierte Sprint-Planung
- Kapazitätsengpässe vor Projektstart erkennen

---

### 4. Kapazitätsplanung
**Priorität: 8/10**

**Was fehlt:** Keine Definition wie viele Stunden pro Tag/Woche eine Person verfügbar ist.

**Einbettung:** Pro Board-Ressource ein Feld `capacity` (Standard: 8h/Tag) und `workingDays` (Standard: Mo-Fr). Einstellbar über ein Modal pro Person.

**Vorteile:**
- Realistische Workload-Berechnung
- Teilzeit-Mitarbeiter korrekt abbilden
- Basis für automatische Überlastungs-Warnungen

---

### 5. Persönliche Kalender / Abwesenheiten
**Priorität: 7/10**

**Was fehlt:** Urlaub, Krankheit, Feiertage werden nicht berücksichtigt.

**Einbettung:** Pro Ressource eine Liste von Abwesenheiten (Typ, Start, Ende, Notiz). Im Gantt-Chart als graue Bereiche in der Person-Zeile sichtbar. Workload-Berechnung berücksichtigt diese automatisch.

**Vorteile:**
- Realistische Planung über Urlaubszeiten
- Keine Zuweisung an abwesende Personen
- Transparenz für das gesamte Team

---

### 6. Virtuelle Ressourcen
**Priorität: 6/10**

**Was fehlt:** Platzhalter für noch nicht bekannte Personen (z.B. "Externer Entwickler", "Neue Stelle").

**Einbettung:** Beim Hinzufügen einer Ressource wählen zwischen "Team-Mitglied" (verknüpft mit User) oder "Virtuell" (nur Name). Virtuelle Ressourcen haben ein anderes Icon.

**Vorteile:**
- Planung auch wenn Team noch nicht komplett
- Budgetierung für externe Ressourcen
- Später durch echte Person ersetzbar

---

### 7. Multiple Assignees pro Phase
**Priorität: 6/10**

**Was fehlt:** Aktuell wäre nur ein Assignee möglich. Manche Phasen brauchen mehrere Personen.

**Einbettung:** `assigneeIds` ist bereits als Array geplant. Multi-Select Dropdown im DetailPanel. Auf dem Balken mehrere Avatare (max 3, dann "+2").

**Vorteile:**
- Teamarbeit an einer Phase abbildbar
- Stunden können aufgeteilt werden
- Realistische Darstellung von Pair-Programming etc.

---

## Task Management

### 8. Progress-Tracking (Fortschritt in %)
**Priorität: 8/10**

**Was fehlt:** Kein Fortschritt pro Phase. Man sieht nicht wie weit eine Phase ist.

**Einbettung:** Neues Feld `progress` (0-100) im Phase-Objekt. Slider im DetailPanel. Auf dem Gantt-Balken als halbtransparente Füllung oder vertikale Linie sichtbar.

**Vorteile:**
- Sprint-Fortschritt auf einen Blick
- Projekt-Fortschritt automatisch berechenbar
- Erkennen von stagnierenden Phasen
- Basis für Burndown-Charts

---

### 9. Deadlines mit Warnungen
**Priorität: 8/10**

**Was fehlt:** Nur Start/End-Datum. Keine explizite Deadline mit visueller Warnung bei Überschreitung.

**Einbettung:** Optionales `deadline`-Feld (kann vom Enddatum abweichen). Überfällige Phasen (Deadline < heute UND progress < 100%) werden rot markiert. Optional: Browser-Notification.

**Vorteile:**
- Proaktives Erkennen von Verzögerungen
- Unterscheidung zwischen "geplantes Ende" und "muss fertig sein bis"
- Visuelle Dringlichkeit im Chart

---

### 10. Subtasks / Checklisten
**Priorität: 6/10**

**Was fehlt:** Phasen können nicht in kleinere Aufgaben unterteilt werden.

**Einbettung:** Array `subtasks[]` mit `{id, title, completed}` pro Phase. Checkbox-Liste im DetailPanel. Progress kann automatisch aus Subtasks berechnet werden.

**Vorteile:**
- Granularere Aufgabenverwaltung
- Fortschritt durch Abhaken statt manuelle Prozent-Eingabe
- Bessere Übersicht bei komplexen Phasen

---

### 11. Prioritäten
**Priorität: 5/10**

**Was fehlt:** Keine Dringlichkeitsstufen. Alle Phasen sind "gleich wichtig".

**Einbettung:** Enum-Feld `priority` (critical/high/normal/low) mit Farb-Icons. Filter in der Sidebar. Optional: Sortierung nach Priorität.

**Vorteile:**
- Fokus auf das Wichtigste
- Schnelle visuelle Unterscheidung
- Filterbar für "nur kritische Tasks"

---

## Planungs-Features

### 12. Auto-Scheduling
**Priorität: 7/10**

**Was fehlt:** Connections existieren, aber beim Verschieben einer Phase werden abhängige Phasen nicht automatisch mit verschoben.

**Einbettung:** Toggle "Auto-Scheduling" in der Topbar. Wenn aktiv: Beim Verschieben einer Phase werden alle via Connection abhängigen Phasen um denselben Zeitraum verschoben.

**Vorteile:**
- Konsistente Abhängigkeiten
- Weniger manuelle Arbeit bei Planänderungen
- Realistische Auswirkungen von Verzögerungen sichtbar

---

### 13. Baseline-Vergleich
**Priorität: 7/10**

**Was fehlt:** Kein Vergleich zwischen ursprünglichem Plan und aktuellem Stand.

**Einbettung:** Button "Baseline speichern" erstellt Snapshot der aktuellen BoardData. Toggle "Baseline anzeigen" zeigt den Original-Plan als transparente Balken hinter den aktuellen.

**Vorteile:**
- Sichtbar wie stark der Plan abgewichen ist
- Lessons Learned für zukünftige Schätzungen
- Stakeholder-Kommunikation über Planänderungen

---

### 14. Critical Path
**Priorität: 5/10**

**Was fehlt:** Keine automatische Berechnung welche Phasen das Projektende direkt beeinflussen.

**Einbettung:** Algorithmus berechnet die längste Kette von abhängigen Phasen. Diese werden rot hervorgehoben. Toggle in der Topbar.

**Vorteile:**
- Fokus auf die wichtigsten Phasen
- Erkennen wo Verzögerungen kritisch sind
- Professionelles Projektmanagement-Feature

---

## Zeit-Management

### 15. Time Tracking / Zeiterfassung
**Priorität: 6/10**

**Was fehlt:** Keine Erfassung der tatsächlich gearbeiteten Stunden.

**Einbettung:** Pro Phase ein Array `timeLogs[]` mit `{userId, date, hours, note}`. Button "Zeit loggen" im DetailPanel. Summe wird angezeigt und mit `estimatedHours` verglichen.

**Vorteile:**
- Ist vs. Soll Vergleich
- Basis für Rechnungsstellung
- Bessere Schätzungen in Zukunft
- Nachweis der geleisteten Arbeit

---

### 16. Geschätzte Stunden (Estimation)
**Priorität: 7/10**

**Was fehlt:** Keine Schätzung wie lange eine Phase dauern soll.

**Einbettung:** Feld `estimatedHours` pro Phase. Eingabe im DetailPanel. Wird für Workload-Berechnung verwendet.

**Vorteile:**
- Realistische Kapazitätsplanung
- Grundlage für Workload-Ansicht
- Vergleich mit tatsächlicher Zeit möglich

---

## Reporting & Export

### 17. PDF/PNG Export
**Priorität: 4/10**

**Was fehlt:** Nur JSON-Export. Kein visueller Export für Stakeholder.

**Einbettung:** Button "Als Bild exportieren" nutzt html2canvas oder ähnliche Library. PDF-Export über Browser-Print oder jsPDF.

**Vorteile:**
- Teilbar mit Nicht-Nutzern
- Präsentationen und Reports
- Archivierung von Projektständen

---

### 18. Dashboards / Reports
**Priorität: 4/10**

**Was fehlt:** Keine aggregierte Übersicht über mehrere Boards oder Projekte.

**Einbettung:** Neue Seite "/reports" mit Widgets: Projekte nach Status, Überfällige Phasen, Team-Auslastung, Fortschritt pro Projekt.

**Vorteile:**
- Management-Übersicht
- Schnelles Erkennen von Problemen
- Datenbasierte Entscheidungen

---

## Collaboration

### 19. Kommentare pro Phase
**Priorität: 5/10**

**Was fehlt:** Keine Diskussion direkt an einer Phase. Nur das Beschreibungsfeld.

**Einbettung:** Array `comments[]` mit `{userId, text, createdAt}` pro Phase. Kommentar-Bereich im DetailPanel mit @-Mentions.

**Vorteile:**
- Kontext bleibt bei der Phase
- Keine externen Tools nötig
- Historie der Diskussion

---

### 20. Notifications / Benachrichtigungen
**Priorität: 5/10**

**Was fehlt:** Keine Benachrichtigungen bei Änderungen oder Zuweisungen.

**Einbettung:** Bei Zuweisung, Kommentar, oder Deadline-Nähe: E-Mail und/oder Browser-Push. Einstellbar pro User.

**Vorteile:**
- Proaktive Information
- Keine wichtigen Änderungen verpassen
- Weniger "hast du gesehen dass..."-Fragen

---

## Priorisierte Roadmap

### Phase 1: Team-Grundlagen (Priorität 10)
1. Assignees pro Phase
2. Team-Ansicht

### Phase 2: Kapazität & Tracking (Priorität 8-9)
3. Workload-Ansicht
4. Progress-Tracking
5. Kapazitätsplanung
6. Geschätzte Stunden

### Phase 3: Planung (Priorität 7)
7. Auto-Scheduling
8. Baseline-Vergleich
9. Deadlines mit Warnungen
10. Persönliche Kalender

### Phase 4: Nice-to-Have (Priorität 4-6)
11. Subtasks
12. Time Tracking
13. Prioritäten
14. Virtuelle Ressourcen
15. Multiple Assignees
16. Critical Path
17. Kommentare
18. Notifications
19. PDF/PNG Export
20. Dashboards

---

## Zusammenfassung

Die wichtigsten fehlenden Features für einen vollwertigen Sprint Planner sind:

| Rang | Feature | Priorität | Begründung |
|------|---------|-----------|------------|
| 1 | Assignees pro Phase | 10/10 | Grundlage für alles Team-bezogene |
| 2 | Team-Ansicht | 10/10 | Kernfeature für Sprintplanung |
| 3 | Workload-Ansicht | 9/10 | Überlastung erkennen |
| 4 | Progress-Tracking | 8/10 | Sprint-Fortschritt sichtbar |
| 5 | Kapazitätsplanung | 8/10 | Realistische Planung |
| 6 | Deadlines | 8/10 | Verzögerungen erkennen |
| 7 | Auto-Scheduling | 7/10 | Konsistente Abhängigkeiten |
| 8 | Baseline | 7/10 | Plan vs. Realität |
| 9 | Estimation | 7/10 | Basis für Workload |
| 10 | Kalender | 7/10 | Urlaub berücksichtigen |

Mit den Top-3-Features (Assignees, Team-Ansicht, Workload) hättest du bereits einen deutlichen Mehrwert gegenüber dem aktuellen Stand und könntest dich von einfachen Gantt-Tools abheben.
