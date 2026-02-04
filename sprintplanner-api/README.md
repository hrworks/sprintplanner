# Sprint Planner API

Multi-User Gantt-Chart Roadmap-Planungstool mit Realtime-Collaboration.

## Features

- 🔐 Google OAuth Login (Domain-restricted)
- 📋 Board Management mit Rollen (Owner/Editor/Viewer)
- 👥 Board-Sharing per Email-Einladung
- 🔄 Realtime Sync via SSE
- 🖱️ Live Cursor Sharing via WebSocket
- 🌐 Öffentliche Boards

## Tech Stack

- NestJS + TypeScript
- SQLite + Drizzle ORM
- WebSocket (`ws`)
- Nodemailer

## Setup

### 1. Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add callback URL: `http://localhost:3000/auth/google/callback`
4. Copy Client ID & Secret to `.env`

### 3. Install & Run

```bash
bun install
bun run db:generate
bun run db:migrate
bun run dev
```

## Deployment

### Docker

```bash
bun run build
docker-compose up -d
```

### Nginx

Copy `nginx.conf` to `/etc/nginx/sites-available/` and adjust domain.

```bash
sudo certbot --nginx -d sprintplanner.example.com
sudo systemctl reload nginx
```

### Backup

Add to crontab for daily backups:

```bash
0 2 * * * /path/to/backup.sh
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /auth/google | - | Start OAuth |
| GET | /api/me | JWT | Current user |
| GET | /api/boards | JWT | List boards |
| POST | /api/boards | JWT | Create board |
| GET | /api/boards/:id | JWT/Public | Get board |
| PUT | /api/boards/:id | JWT+Editor | Update board |
| DELETE | /api/boards/:id | JWT+Owner | Delete board |
| GET | /api/boards/:id/members | JWT | List members |
| POST | /api/boards/:id/members | JWT+Owner | Invite member |
| GET | /api/boards/:id/stream | JWT/Public | SSE updates |

## WebSocket (Port 3001)

```
ws://host:3001?token=JWT

→ {"type": "join", "boardId": "xxx"}
→ {"type": "cursor", "x": 100, "y": 200}
← {"type": "users", "users": [...]}
← {"type": "cursor", "userId": "...", "x": 100, "y": 200}
```
