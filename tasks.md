# Sprint Planner - Multi-User System

## Tech Stack
- Backend: **NestJS** (TypeScript)
- Database: **SQLite**
- ORM: **Drizzle ORM**
- Auth: Google OAuth 2.0 (Domain-restricted)
- Email: Nodemailer + SMTP
- Realtime: **Native WebSocket** (`ws` Library) für Cursor + Presence, SSE für Board-Updates
- Frontend: Vanilla JS (bestehend)

---

## Phase 1: Grundstruktur & Datenbank

### 1.1 Projekt-Setup
- [ ] NestJS Projekt erstellen: `nest new sprintplanner-api`
- [ ] Drizzle ORM installieren: `drizzle-orm`, `drizzle-kit`, `better-sqlite3`
- [ ] Basis-Module erstellen (auth, boards, shares, users)
- [ ] .env Konfiguration
- [ ] CORS für Frontend konfigurieren

### 1.2 Datenbank-Schema (Drizzle)
- [ ] Users Tabelle
- [ ] Boards Tabelle (mit isPublic Flag)
- [ ] BoardMembers Tabelle (role: owner/editor/viewer)
- [ ] UserSettings Tabelle (showMyCursor)
- [ ] Schema erstellen und Migration

---

## Phase 2: Authentifizierung

### 2.1 Google OAuth Setup
- [ ] Google Cloud Console: OAuth 2.0 Client erstellen
- [ ] @nestjs/passport + passport-google-oauth20
- [ ] AuthModule mit Google Strategy
- [ ] GET /auth/google - Login starten
- [ ] GET /auth/google/callback - OAuth Callback
- [ ] Domain-Whitelist prüfen (z.B. nur @devset.de)
- [ ] JWT Token generieren (@nestjs/jwt)

### 2.2 Auth Guards
- [ ] JwtAuthGuard - Muss eingeloggt sein
- [ ] OptionalAuthGuard - Für öffentliche Boards
- [ ] BoardAccessGuard - Prüft Board-Zugriff + Rolle

### 2.3 Frontend Auth
- [ ] Login-Button mit Google
- [ ] Token im localStorage
- [ ] Auth-Header bei API-Calls
- [ ] User-Avatar + Logout oben rechts

---

## Phase 3: Board Management

### 3.1 API Endpoints
- [ ] GET /api/boards - Alle Boards (eigene + geteilte + öffentliche)
- [ ] POST /api/boards - Neues Board erstellen
- [ ] GET /api/boards/:id - Board laden
- [ ] PUT /api/boards/:id - Board speichern (Editor+)
- [ ] DELETE /api/boards/:id - Board löschen (Owner only)
- [ ] PATCH /api/boards/:id/visibility - Öffentlich/Privat setzen (Owner)

### 3.2 Board-Übersicht (Dashboard)
- [ ] Grid/Liste aller Boards
- [ ] Tabs: "Meine Boards" | "Geteilt mit mir" | "Öffentlich"
- [ ] Board-Karte: Name, Owner, letzte Änderung, Teilnehmer-Avatare
- [ ] Neues Board erstellen Button
- [ ] Board löschen (mit Bestätigung)

### 3.3 Board-Ansicht
- [ ] Klick auf Board → Pipeline öffnet sich
- [ ] Header: Board-Name (editierbar für Owner/Editor)
- [ ] Rechts oben: Teilen-Button + aktive User-Avatare
- [ ] Zurück zur Übersicht Button

---

## Phase 4: Sharing & Permissions

### 4.1 Rollen-System
- [ ] **Owner**: Vollzugriff, kann teilen, löschen, Rollen ändern, veröffentlichen
- [ ] **Editor**: Kann bearbeiten
- [ ] **Viewer**: Nur lesen

### 4.2 API Endpoints
- [ ] GET /api/boards/:id/members - Alle Mitglieder
- [ ] POST /api/boards/:id/members - User einladen (per Email)
- [ ] PATCH /api/boards/:id/members/:id - Rolle ändern (Owner only)
- [ ] DELETE /api/boards/:id/members/:id - Mitglied entfernen

### 4.3 Share-Modal (Frontend)
- [ ] Teilen-Button öffnet Modal
- [ ] Email eingeben + Rolle wählen (Editor/Viewer)
- [ ] Liste aktueller Mitglieder mit Rollen
- [ ] Rolle ändern Dropdown (Owner only)
- [ ] Mitglied entfernen Button
- [ ] Toggle: "Öffentlich zugänglich" (Owner only)
- [ ] Öffentlicher Link zum Kopieren

---

## Phase 5: Email-System

### 5.1 Setup
- [ ] Nodemailer konfigurieren
- [ ] Email-Templates (HTML)

### 5.2 Einladungs-Flow
- [ ] Template: "X hat dich zu Board Y eingeladen"
- [ ] Einladungs-Link mit Token
- [ ] GET /invite/:token - Einladung annehmen
- [ ] Wenn User existiert → direkt hinzufügen
- [ ] Wenn nicht → nach Login hinzufügen

---

## Phase 6: Realtime - Board Sync

### 6.1 SSE für Board-Updates
- [ ] GET /api/boards/:id/stream - SSE Endpoint
- [ ] EventEmitter bei Board-Änderungen
- [ ] Client: EventSource Verbindung
- [ ] Bei Update: Board neu laden

### 6.2 Aktive User anzeigen
- [ ] WebSocket: User joined/left Board
- [ ] Liste aktiver User im Board speichern (in-memory)
- [ ] Avatare oben rechts anzeigen
- [ ] Tooltip mit Namen

---

## Phase 7: Live Cursor Sharing

### 7.1 User Settings
- [ ] GET /api/users/me/settings
- [ ] PATCH /api/users/me/settings
- [ ] Setting: `showMyCursor` (boolean) - Zeige meinen Cursor anderen
- [ ] Setting: `showOtherCursors` (boolean) - Zeige mir andere Cursor

### 7.2 WebSocket Server (native ws)
- [ ] `ws` Library installieren
- [ ] WebSocketGateway in NestJS (oder standalone ws server)
- [ ] JWT Auth bei WebSocket Connection (via query param oder first message)
- [ ] Events: `cursor:move`, `cursor:leave`
- [ ] Throttling: Max 20 Updates/Sekunde pro User
- [ ] Broadcast nur an User im selben Board

### 7.3 Frontend Cursor
- [ ] Andere Cursor als farbige Pfeile + Name anzeigen
- [ ] Smooth Animation (CSS transition)
- [ ] Toggle in UI: "Cursor anzeigen" (eigene Einstellung)
- [ ] Cursor ausblenden wenn User inaktiv (5s)

---

## Phase 8: UI/UX

### 8.1 Dashboard
- [ ] Responsive Grid für Boards
- [ ] Sortierung: Zuletzt bearbeitet
- [ ] Suche nach Board-Name
- [ ] Empty State: "Noch keine Boards"

### 8.2 Board Header
- [ ] Board-Name (inline editierbar)
- [ ] Teilen-Button (Icon)
- [ ] Aktive User Avatare (max 5, dann +X)
- [ ] Cursor-Toggle Button
- [ ] Zurück-Button

### 8.3 User Menu
- [ ] Avatar Dropdown
- [ ] Einstellungen (Cursor-Präferenzen)
- [ ] Logout

---

## Phase 9: Security & Deployment

### 9.1 Security
- [ ] HTTPS erzwingen
- [ ] CORS konfigurieren
- [ ] Rate Limiting
- [ ] Input Validation (class-validator)
- [ ] Permission Checks in allen Endpoints

### 9.2 Deployment
- [ ] Build: `npm run build`
- [ ] PM2 für Prozess-Management
- [ ] SQLite Backup-Script (cron)
- [ ] Nginx Reverse Proxy + SSL

---

## Datenbank Schema (Drizzle)

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  googleId: text('google_id').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  showMyCursor: integer('show_my_cursor', { mode: 'boolean' }).notNull().default(true),
  showOtherCursors: integer('show_other_cursors', { mode: 'boolean' }).notNull().default(true),
});

export const boards = sqliteTable('boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  data: text('data').notNull().default('{"projects":[],"connections":[]}'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const boardMembers = sqliteTable('board_members', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  invitedEmail: text('invited_email').notNull(),
  role: text('role', { enum: ['owner', 'editor', 'viewer'] }).notNull().default('viewer'),
  invitedAt: integer('invited_at', { mode: 'timestamp' }).notNull().defaultNow(),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
});
```

---

## API Übersicht

| Method | Endpoint | Auth | Beschreibung |
|--------|----------|------|--------------|
| GET | /auth/google | - | Google Login |
| GET | /auth/google/callback | - | OAuth Callback |
| GET | /api/me | JWT | Aktueller User |
| GET | /api/users/me/settings | JWT | User Settings |
| PATCH | /api/users/me/settings | JWT | Settings ändern |
| GET | /api/boards | JWT | Boards auflisten |
| POST | /api/boards | JWT | Board erstellen |
| GET | /api/boards/:id | JWT/Public | Board laden |
| PUT | /api/boards/:id | JWT+Editor | Board speichern |
| DELETE | /api/boards/:id | JWT+Owner | Board löschen |
| PATCH | /api/boards/:id/visibility | JWT+Owner | Öffentlich setzen |
| GET | /api/boards/:id/members | JWT+Member | Mitglieder |
| POST | /api/boards/:id/members | JWT+Owner | Einladen |
| PATCH | /api/boards/:id/members/:mid | JWT+Owner | Rolle ändern |
| DELETE | /api/boards/:id/members/:mid | JWT+Owner | Entfernen |
| GET | /api/boards/:id/stream | JWT/Public | SSE Updates |
| WS | /ws | JWT (query) | Cursor + Presence |
| GET | /invite/:token | - | Einladung annehmen |

---

## WebSocket Protocol (native ws)

Connection: `ws://host/ws?token=JWT_TOKEN`

### Messages (JSON)

**Client → Server:**
```json
{"type": "join", "boardId": "xxx"}
{"type": "leave", "boardId": "xxx"}
{"type": "cursor", "boardId": "xxx", "x": 123, "y": 456}
```

**Server → Client:**
```json
{"type": "users", "boardId": "xxx", "users": [{"id": "...", "name": "...", "avatar": "..."}]}
{"type": "cursor", "userId": "xxx", "name": "Max", "color": "#e94560", "x": 123, "y": 456}
{"type": "cursor_leave", "userId": "xxx"}
```

---

## Geschätzter Aufwand

| Phase | Aufwand |
|-------|---------|
| 1. Grundstruktur + DB | 3-4h |
| 2. Auth | 4-5h |
| 3. Board Management | 4-5h |
| 4. Sharing & Permissions | 4-5h |
| 5. Email | 2-3h |
| 6. Realtime Board Sync | 3-4h |
| 7. Live Cursor | 4-5h |
| 8. UI/UX | 5-6h |
| 9. Security & Deploy | 3-4h |
| **Gesamt** | **32-41h** |

---

## Projektstruktur

```
sprintplanner-api/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── google.strategy.ts
│   │   ├── jwt.strategy.ts
│   │   └── guards/
│   ├── boards/
│   │   ├── boards.module.ts
│   │   ├── boards.controller.ts
│   │   ├── boards.service.ts
│   │   └── boards.gateway.ts (WebSocket mit ws)
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   ├── mail/
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   └── templates/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── migrations/
│   ├── app.module.ts
│   └── main.ts
├── public/
│   └── sprintplanner.html (Frontend)
├── data.db
├── drizzle.config.ts
├── .env
└── package.json
```

---

## Nächste Schritte

1. [ ] Google Cloud Projekt + OAuth Client erstellen
2. [ ] NestJS Projekt initialisieren
3. [ ] Drizzle + SQLite Setup
4. [ ] Phase 1 starten
