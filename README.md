# Sprint Planner

Multi-User Gantt-Chart Roadmap Planning Tool mit React Frontend und NestJS Backend.

## Voraussetzungen

- Node.js 20+ oder Bun 1.0+
- bun (empfohlen) oder npm

## Setup

### 1. Backend einrichten

```bash
cd sprintplanner-api
bun install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Dann `.env` bearbeiten und die Werte anpassen:
- `JWT_SECRET` - Geheimer Schlüssel für JWT Tokens
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth Credentials
- `GOOGLE_CALLBACK_URL` - z.B. `http://localhost:3000/auth/google/callback`
- `ALLOWED_DOMAINS` - Komma-getrennte Liste erlaubter Email-Domains
- AWS SES Credentials für Email-Versand (optional)

### 3. Datenbank migrieren

```bash
cd sprintplanner-api
bun run db:migrate
```

### 4. Frontend einrichten

```bash
cd sprintplanner-web
bun install
```

## Development starten

### Backend starten (Terminal 1)

```bash
cd sprintplanner-api
bun run dev
```

Backend läuft auf http://localhost:3000
WebSocket Server läuft auf Port 3001

### Frontend starten (Terminal 2)

```bash
cd sprintplanner-web
bun run dev
```

Frontend läuft auf http://localhost:5173

## Production Build

### Frontend bauen

```bash
cd sprintplanner-web
bun run build
```

Die gebauten Dateien landen in `sprintplanner-web/dist/`.

### Backend bauen

```bash
cd sprintplanner-api
bun run build
```

### Mit Docker

```bash
# Im Root-Verzeichnis
docker-compose up -d --build
```

## Projektstruktur

```
sprintplanner/
├── sprintplanner-api/     # NestJS Backend
│   ├── src/               # Source Code
│   ├── public/            # Statische Dateien (board.html)
│   ├── drizzle/           # Datenbank Migrationen
│   └── data.db            # SQLite Datenbank
├── sprintplanner-web/     # React Frontend
│   ├── src/
│   │   ├── components/    # Shared Components
│   │   ├── pages/         # Seiten (Dashboard, Users, GanttBoard)
│   │   ├── api/           # API Client
│   │   └── store/         # Zustand State Management
│   └── dist/              # Production Build
├── Dockerfile
└── docker-compose.yml
```

## Features

- Google OAuth Login
- Multi-User Boards mit Echtzeit-Synchronisation (SSE)
- Live Cursor-Sharing (WebSocket)
- Drag & Drop für Phasen
- Überlappende Phasen werden automatisch gestapelt
- Export/Import als JSON
- Board-Sharing mit Rollen (Owner, Editor, Viewer)

## URLs

- `/` - Login
- `/dashboard` - Board-Übersicht
- `/users` - Benutzerverwaltung (nur Admin)
- `/gantt/:id` - React Gantt Board
- `/board/:id` - Legacy Vanilla JS Board
