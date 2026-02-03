# Sprint Planner - System Prompt

Du arbeitest am **Sprint Planner**, einem Gantt-Chart-basierten Roadmap-Planungstool.

## Aktueller Stand

### Bestehende Dateien

**`sprintplanner.html`** - Komplettes Frontend (Single-File HTML+CSS+JS):
- Gantt-Chart Editor mit Drag & Drop
- Projekte mit Phasen (Balken im Chart)
- Phase-Verbindungen via Bezier-Kurven
- Ctrl+Drag zum Kopieren, Drag zwischen Projekten
- Detail-Panel zum Bearbeiten von Phasen
- Zoom, Datumsbereich, Minimap
- Dark/Light Mode
- LocalStorage für lokale Speicherung
- Export/Import JSON
- Share-Link mit komprimierten Daten in URL

**`sync.php`** - Einfacher Sync-Server:
- SSE (Server-Sent Events) für Realtime-Updates
- Channel-basierte Synchronisation
- Speichert Daten in `sync_data/CHANNEL.json`
- Nur für lokale Nutzung gedacht (keine Auth)

**`tasks.md`** - Detaillierte Aufgabenliste für Multi-User System

## Ziel: Multi-User System

Wir bauen ein vollständiges Backend mit:

### Tech Stack
- **NestJS** (TypeScript)
- **SQLite** + **Drizzle ORM**
- **Google OAuth 2.0** (Domain-restricted)
- **Native WebSocket** (`ws`) für Cursor-Sharing
- **SSE** für Board-Updates
- **Nodemailer** für Einladungs-Emails

### Kern-Features
1. **Board-Übersicht** - Dashboard mit allen zugänglichen Boards
2. **Google SSO** - Login nur für bestimmte Domains
3. **Rollen-System** - Owner / Editor / Viewer (nachträglich änderbar)
4. **Board-Sharing** - Per Email einladen, Rollen zuweisen
5. **Öffentliche Boards** - Optional für jeden sichtbar
6. **Live Cursor** - Mauszeiger anderer User anzeigen (schaltbar)
7. **Aktive User** - Avatare der User im Board anzeigen
8. **Realtime Sync** - Änderungen sofort bei allen sichtbar

### Datenbank (Drizzle Schema)
- `users` - Google-Auth User
- `userSettings` - Cursor-Präferenzen
- `boards` - Board-Daten als JSON, isPublic Flag
- `boardMembers` - Rollen (owner/editor/viewer), Einladungen

### API Struktur
- `/auth/google` - OAuth Flow
- `/api/boards` - CRUD für Boards
- `/api/boards/:id/members` - Mitglieder verwalten
- `/api/boards/:id/stream` - SSE für Updates
- `/ws` - WebSocket für Cursor + Presence
- `/invite/:token` - Einladungen annehmen

## Wichtige Hinweise

- SQLite für einfaches Backup (1 Datei)
- Docker zum deployment nötig
- Frontend bleibt Vanilla JS (sprintplanner.html erweitern)
- `ws` Library statt Socket.io (minimal, keine externe Abhängigkeit)
- Alle Details in `tasks.md` (9 Phasen, ~35-40h Aufwand)

## Nächste Schritte

Siehe `tasks.md` - Phase 1 beginnen:
1. NestJS Projekt erstellen
2. Drizzle + SQLite Setup
3. Basis-Module (auth, boards, users)
