# CookMarked

A full-stack web application for saving, organizing, and rediscovering short-form video reels (Instagram, YouTube Shorts, TikTok, Facebook Reels) and streaming platform links into AI-categorized personal collections.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Known Issues](#known-issues)

---

## Project Overview

CookMarked lets users paste a reel/video URL into a modal, which the backend then processes synchronously:

1. **Scrapes metadata** (title, description, thumbnail) from the URL via `og:` tags using multiple User-Agent strategies and an OMDB API fallback for streaming platform titles.
2. **Categorizes the reel** using Google Gemini 2.5 Flash — analyzing thumbnail image, title, description, and the user's existing collection names to either route the reel into an existing collection or create a new one.
3. **Stores the reel** in SQLite with full metadata.

The frontend is a single-page React app with four primary tabs: Feed, Collections, Favorites, and Profile. It uses Clerk for authentication and communicates with the Express backend via a typed fetch wrapper.

---

## Tech Stack

### Frontend

| Package | Version | Role |
|---|---|---|
| `react` | ^19.0.1 | UI framework |
| `react-dom` | ^19.0.1 | DOM rendering |
| `@clerk/clerk-react` | ^5.61.8 | Authentication (sign-in, session management) |
| `motion` (Framer Motion) | ^12.23.24 | Page and element animations (`AnimatePresence`, `motion`) |
| `lucide-react` | ^0.546.0 | Icon library |
| `tailwindcss` | ^4.1.14 | Utility-first CSS (via Vite plugin) |
| `@tailwindcss/vite` | ^4.1.14 | Tailwind v4 Vite integration |
| `vite` | ^6.2.3 | Build tool and dev server |
| `typescript` | ~5.8.2 | Static typing |
| `express` | ^4.21.2 | SSR/static server (production `server.ts`) |
| `esbuild` | ^0.25.0 | Server bundle for production (`server.cjs`) |
| `@google/genai` | ^2.4.0 | Gemini SDK (present in deps, not currently wired to a view) |

### Backend

| Package | Version | Role |
|---|---|---|
| `express` | ^5.2.1 | HTTP server and routing |
| `@clerk/clerk-sdk-node` | ^4.13.23 | Server-side Clerk JWT verification |
| `better-sqlite3` | ^12.10.0 | Embedded SQLite database (synchronous) |
| `@google/generative-ai` | ^0.24.1 | Gemini AI SDK for reel categorization |
| `axios` | ^1.16.1 | HTTP client (metadata scraping, thumbnail download) |
| `cheerio` | ^1.2.0 | HTML parsing for `og:` metadata extraction |
| `cors` | ^2.8.6 | Cross-origin resource sharing |
| `multer` | ^2.0.2 | Avatar file upload handling |
| `bullmq` | ^5.76.10 | Redis-backed job queue (defined but worker is commented out) |
| `ioredis` | ^5.10.1 | Redis client for BullMQ |
| `dotenv` | ^17.4.2 | Environment variable loading |

---

## Architecture

```
cookmarked/
├── backend/                    # Node.js / Express API
│   ├── src/
│   │   ├── index.js            # Express app entry point; CORS, routes, error handler
│   │   ├── config.js           # Env var loading and validation
│   │   ├── db/
│   │   │   └── database.js     # SQLite schema init, migrations, helper functions
│   │   ├── routes/
│   │   │   ├── reels.js        # Reel CRUD + AI categorization pipeline
│   │   │   ├── collections.js  # Collection CRUD + sharing
│   │   │   ├── search.js       # Full-text search across reels and collections
│   │   │   ├── users.js        # User profile, avatar upload, stats
│   │   │   └── instagramWebhook.js  # Meta webhook verification and event handler
│   │   ├── services/
│   │   │   ├── geminiService.js     # Gemini 2.5 Flash categorization with vision
│   │   │   ├── metadataScraper.js   # Multi-strategy og:meta + OMDB scraper
│   │   │   ├── urlExtractor.js      # URL detection and platform identification
│   │   │   └── instagramReplyService.js  # Meta Messenger reply helper
│   │   ├── middleware/
│   │   │   ├── authenticateToken.js # Clerk JWT verification + DB user sync
│   │   │   └── verifyMetaSignature.js   # HMAC-SHA256 Meta webhook signature check
│   │   ├── handlers/
│   │   │   └── instagramWebhookHandler.js  # Instagram DM webhook event processor
│   │   └── queue/
│   │       ├── reelQueue.js    # BullMQ queue definition (exponential backoff, 3 retries)
│   │       └── reelProcessor.js # BullMQ worker (currently commented out in index.js)
│   └── cookmarked.db           # SQLite database file (gitignored)
│
└── frontend/                   # React + Vite SPA
    ├── src/
    │   ├── main.tsx            # React root; ClerkProvider wraps entire app
    │   ├── App.tsx             # ~2000 line monolithic component; all views, state, tabs
    │   ├── types.ts            # TypeScript interfaces: Reel, Collection, UserProfile, etc.
    │   ├── data.ts             # Static seed data: platforms, notification settings
    │   ├── index.css           # Global Tailwind styles and CSS custom properties
    │   ├── api/
    │   │   ├── config.ts       # Exports API_BASE from VITE_API_URL env var
    │   │   └── reelService.ts  # All API calls: typed fetch wrapper, mapReel/mapCollection
    │   └── components/
    │       ├── AuthScreen.tsx      # Legacy email/password + Google OAuth UI (unused; Clerk replaced it)
    │       ├── Header.tsx          # Top header bar (mobile)
    │       ├── BottomNav.tsx       # Mobile bottom navigation tabs
    │       ├── Logo.tsx            # SVG logo component
    │       ├── SaveReelModal.tsx   # URL paste modal; calls POST /api/reels
    │       └── ShareCollectionModal.tsx  # Share link generation and copy UI
    └── server.ts               # Express static server for production deployment
```

### Request Flow — Saving a Reel

```
User pastes URL in SaveReelModal
        │
        ▼
POST /api/reels (bearer token in Authorization header)
        │
        ├─ authenticateToken middleware
        │     ├─ Clerk verifies JWT
        │     └─ Syncs Clerk user → local SQLite users table (INSERT OR SELECT)
        │
        ├─ scrapeMetadata(url)
        │     ├─ Strategy 1: Mobile UA (iPhone Safari)
        │     ├─ Strategy 2: Social bots (facebookexternalhit, Twitterbot)
        │     ├─ Strategy 3: Amazon ASIN normalization (for Prime Video links)
        │     └─ Strategy 4: OMDB API title/poster fallback
        │
        ├─ detectPlatform(url) → Instagram | YouTube | TikTok | Facebook | Netflix | Prime Video | Other
        │
        ├─ categorizeReel() via Gemini 2.5 Flash
        │     ├─ Downloads thumbnail as base64 (axios, 8s timeout, 5MB limit)
        │     ├─ Sends multimodal prompt (text + image) to Gemini
        │     ├─ Gemini returns JSON: { category, title, tags, cover_topic, ... }
        │     ├─ matchExistingCollection() fuzzy-matches against user's collection names
        │     └─ Falls back to inferCategoryFromText() regex if Gemini fails
        │
        ├─ getOrCreateCollectionForCategory() → auto-creates collection if needed
        │
        └─ INSERT INTO reels → returns normalized reel object
```

---

## Key Features

### Reel Management
- **Save any video URL** — Instagram Reels, YouTube Shorts, TikTok, Facebook Reels, Netflix, Prime Video, and generic URLs
- **AI auto-categorization** — Gemini 2.5 Flash analyzes thumbnail image + metadata and routes the reel into the correct collection automatically
- **Favorite toggle** — `POST /api/reels/:id/favorite`
- **Watched/unwatched toggle** — `POST /api/reels/:id/watched`
- **Personal notes** — `PATCH /api/reels/:id/note`
- **Delete reel** — `DELETE /api/reels/:id`
- **Random reel** — `GET /api/reels/random` — returns a random reel, optionally filtered by collection or platform
- **Favorites feed** — `GET /api/reels/favorites`

### Collections
- **Create / rename / delete collections** — deletion safely migrates orphan reels to an "Other" collection
- **Emoji + description** per collection
- **Favorite a collection** — pinning
- **Auto-created collections** — backend creates collections on demand when AI assigns a new category
- **Collection metadata** — reel count, platforms list, cover image (latest thumbnail), last updated timestamp
- **Share collections** — generates a unique, public `share_token`; shared link returns full collection + reels without auth

### Search
- Full-text `LIKE` search across reel titles, categories, and collection names — `GET /api/search?q=`

### User Profile
- **Stats endpoint** — total reels, total collections, total favorites — `GET /api/users/me/stats`
- **Profile update** — name and avatar URL — `PATCH /api/users/me`
- **Avatar upload** — multipart form upload stored to `/uploads/avatars/` — `PATCH /api/users/me/avatar`

### Platform Detection
Regex-based detection against URL patterns for:
`Instagram` · `YouTube` · `TikTok` · `Facebook` · `Netflix` · `Prime Video`

### Instagram Webhook (Implemented, not active in prod)
- Meta webhook verification (GET challenge-response)
- HMAC-SHA256 signature verification on POST events
- Parses incoming DM events and extracts URLs from attachment payloads or message text
- Infrastructure present for saving reels via Instagram DM; worker is commented out pending Redis setup

### Frontend UI
- **Feed tab** — grid of saved reels, filterable by collection; each card opens the original URL
- **Collections tab** — searchable grid; click to enter collection detail view with per-collection reel list
- **Favorites tab** — favorited reels, filterable by platform
- **Profile tab** — Clerk `UserButton`, user stats, platform connection list (UI only), notification settings toggle
- **Notifications tab** — seeded static notifications with filter chips (All / Alerts / Trends / Connections)
- **Responsive layout** — desktop sidebar (md+) + mobile bottom navigation
- **Animations** — `AnimatePresence` / `motion` for tab transitions and modal entrance/exit
- **Save Reel Modal** — URL input, collection picker, note field, submits to backend
- **Share Collection Modal** — generates and copies share link

---

## API Reference

All routes require `Authorization: Bearer <clerk_jwt>` except share endpoints.

### Reels

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reels` | Save a reel; triggers scrape + AI categorization |
| `GET` | `/api/reels/random` | Get a random reel (`?category=`, `?collection_id=`, `?platform=`) |
| `GET` | `/api/reels/favorites` | Get all favorited reels |
| `DELETE` | `/api/reels/:id` | Delete a reel |
| `POST` | `/api/reels/:id/favorite` | Toggle favorite status |
| `PATCH` | `/api/reels/:id/note` | Update personal note |
| `POST` | `/api/reels/:id/watched` | Toggle watched status |
| `GET` | `/api/reels/:id/status` | Get reel processing status |

### Collections

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/collections` | List all collections (`?favorite=`, `?category=`, `?platform=`, `?sort=`, `?limit=`) |
| `GET` | `/api/collections/:id` | Get collection + all reels; updates `last_opened_at` |
| `POST` | `/api/collections` | Create collection |
| `PATCH` | `/api/collections/:id` | Update name/description/emoji |
| `DELETE` | `/api/collections/:id` | Delete; orphan reels moved to "Other" |
| `POST` | `/api/collections/:id/favorite` | Toggle collection favorite |
| `POST` | `/api/share/:id` | Generate/retrieve share token |
| `GET` | `/api/share/:shareToken` | Fetch shared collection (no auth required) |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/users/me` | Update name / avatar URL |
| `PATCH` | `/api/users/me/avatar` | Upload avatar image (multipart) |
| `GET` | `/api/users/me/stats` | Get total reels, collections, favorites count |

### Other

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — `{ ok: true, service: "cookmarked" }` |
| `GET` | `/api/webhooks/instagram` | Meta webhook verification (challenge-response) |
| `POST` | `/api/webhooks/instagram` | Meta webhook event receiver |
| `GET` | `/api/search?q=` | Search reels + collections by query string |

---

## Database Schema

SQLite (`better-sqlite3`), file: `backend/cookmarked.db`.

```sql
users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id        TEXT UNIQUE,          -- Clerk user ID
  instagram_id    TEXT UNIQUE,
  email           TEXT UNIQUE,
  password_hash   TEXT,
  name            TEXT,
  avatar_url      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
)

collections (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  emoji           TEXT,
  is_favorite     INTEGER DEFAULT 0,
  share_token     TEXT UNIQUE,          -- set on first share
  last_opened_at  DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
)

reels (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  collection_id   INTEGER,              -- nullable; references collections(id)
  category_id     INTEGER,              -- legacy, kept for schema compat
  url             TEXT NOT NULL,
  title           TEXT,
  thumbnail       TEXT,
  platform        TEXT,                 -- Instagram | YouTube | TikTok | ...
  category        TEXT,                 -- human-readable category name
  note            TEXT,
  is_favorite     INTEGER DEFAULT 0,
  is_watched      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'saved',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
)

categories (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
)
```

> The schema applies migrations on startup via `ensureColumn()` and a safe table-swap for nullable `category_id`. Orphaned reels (no `collection_id`) are auto-migrated into an "Other" collection on every boot.

---

## Authentication

### Clerk Integration

- **Frontend**: `ClerkProvider` wraps the app in `main.tsx`. `useAuth()`, `SignedIn`, `SignedOut`, and `UserButton` components from `@clerk/clerk-react` ^5.61.8 control access gating.
- **Backend**: `@clerk/clerk-sdk-node` ^4.13.23. `ClerkExpressRequireAuth()` middleware validates the JWT on every protected route.
- **User sync**: After Clerk validates the token, `syncUserMiddleware` looks up or creates the user in the local SQLite `users` table using `clerk_id`. The internal numeric `user.id` is then attached to `req.user` for all downstream handlers.
- **Token flow**: Frontend calls `window.Clerk.session.getToken()` and attaches the JWT as `Authorization: Bearer <token>` on every API request.

### Legacy Auth (not in use)
`AuthScreen.tsx` contains a custom email/password + Google OAuth UI that references now-removed `login()` / `register()` functions. This component is not rendered in the current app. Auth is fully delegated to Clerk.

---

## Deployment

| Layer | Platform | URL |
|---|---|---|
| Backend | Render | `https://cookmarked.onrender.com` |
| Frontend | Vercel | `https://cookmarked-nine.vercel.app` |

### Backend (Render)
- Runtime: Node.js
- Start command: `node src/index.js`
- The SQLite `cookmarked.db` file lives on Render's ephemeral disk — **data is reset on redeploy**. A persistent disk mount is required for production data durability.
- BullMQ / Redis queue is defined in code but the worker (`reelProcessor.js`) is **commented out** in `index.js`. Queue features are not active in the deployed build.

### Frontend (Vercel)
- Framework: Vite (React SPA)
- Build output: `dist/`
- The `server.ts` Express static server is used for production (`node dist/server.cjs`), wrapping the Vite build.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | HTTP listen port (default: `3000`) |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key |
| `FRONTEND_URL` | No | Allowed CORS origin (default: `http://localhost:5173`) |
| `CLERK_SECRET_KEY` | Yes (implicit) | Clerk backend secret (consumed by `@clerk/clerk-sdk-node`) |
| `META_APP_SECRET` | No | Meta app secret for Instagram webhook HMAC validation |
| `META_VERIFY_TOKEN` | No | Meta webhook verify token (challenge-response) |
| `META_PAGE_ACCESS_TOKEN` | No | Meta page access token for sending replies |
| `REDIS_URL` | No | Redis connection URL for BullMQ (default: `redis://localhost:6379`) |
| `OMDB_API_KEY` | No | OMDB API key for streaming title/poster fallback |
| `NODE_ENV` | No | Environment (`dev` / `production`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk frontend publishable key |
| `VITE_API_URL` | **Yes** | Backend base URL (e.g., `https://cookmarked.onrender.com`) |

---

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY and CLERK_SECRET_KEY at minimum
node src/index.js
# API available at http://localhost:3000
```

### Frontend

```bash
cd frontend
# Create .env with:
# VITE_API_URL=http://localhost:3000
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
npm install
npm run dev
# Dev server at http://localhost:5173
```

---

## Known Issues

### CORS Configuration
The backend sets `origin` to `process.env.FRONTEND_URL || 'http://localhost:5173'`. In the Render deployment, `FRONTEND_URL` must be explicitly set to `https://cookmarked-nine.vercel.app`, otherwise cross-origin requests from Vercel will fail.

```js
// backend/src/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // must match Vercel URL in prod
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

### API URL Environment Variable
The frontend reads `VITE_API_URL` at **build time**:

```ts
// frontend/src/api/config.ts
export const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
```

If `VITE_API_URL` is not set in Vercel's environment variables before building, all API calls will target `undefined/api` and fail. This must be configured in Vercel project settings.

### SQLite on Render Ephemeral Disk
Render's free tier does not persist the filesystem between deploys. All saved reels and collections are lost on each new deployment. Fix: attach a Render persistent disk and update the `database.js` path accordingly.

### BullMQ Worker Disabled
The queue worker (`reelProcessor.js`) is commented out in `index.js`. The queue infrastructure (`bullmq`, `ioredis`) and the `reelQueue.js` definition are present but inactive. Reels are processed synchronously in the route handler. The worker requires a live Redis instance to be re-enabled.

---

## Project Status

Core reel save/organize/browse flow is functional end-to-end in the deployed environment. Auth (Clerk), AI categorization (Gemini 2.5 Flash), collection sharing, and the full REST API are implemented and deployed. Active work is focused on resolving the CORS and environment variable issues described above.
