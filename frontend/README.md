# CookMarked 🔖

AI-powered reel & video bookmarking platform. Save reels from Instagram, TikTok, YouTube, and Facebook — AI auto-categorizes everything.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State | Zustand |
| Server State | TanStack Query v5 |
| HTTP | Axios |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| QR | qrcode.react |
| Confetti | canvas-confetti |

---

## Project Structure

```
src/
├── api/            # Axios client + QueryClient
├── components/
│   ├── cards/      # ReelCard, CollectionCard
│   ├── layout/     # Sidebar, Topbar, BottomNav, FAB
│   ├── loaders/    # Skeletons, PageLoader
│   ├── modals/     # SaveReelModal, RandomReelModal, ShareModal
│   └── ui/         # PlatformBadge, PlatformFilter, EmptyState, ErrorState
├── constants/      # Platforms, categories, query keys
├── hooks/          # useCollections, useReels, useSearch
├── layouts/        # AppLayout, AuthLayout
├── pages/
│   ├── auth/       # Login, Register, ForgotPassword, ResetPassword
│   ├── collections/# Collections, CollectionDetail
│   ├── dashboard/  # Dashboard, Favorites, Search
│   ├── settings/   # Settings
│   └── shared/     # SharedCollection, NotFound
├── routes/         # AppRouter, ProtectedRoute
├── services/       # authService, collectionService, reelService, searchService, userService
├── store/          # authStore (Zustand), uiStore (Zustand)
├── styles/         # globals.css
└── utils/          # cn, detectPlatform, timeAgo, formatCount, etc.
```

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo>
cd cookmarked
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run dev server

```bash
npm run dev
```

Opens at **http://localhost:3000**

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Backend API Expected Endpoints

```
POST   /auth/register        { name, email, password }
POST   /auth/login           { email, password }
POST   /auth/refresh         { refresh_token }
GET    /auth/me

GET    /collections          ?platform=&category=&sort=&limit=
POST   /collections          { name, category }
GET    /collections/:id
PATCH  /collections/:id
DELETE /collections/:id
POST   /collections/:id/favorite
POST   /share/:id

POST   /reels                { url }
DELETE /reels/:id
POST   /reels/:id/favorite
PATCH  /reels/:id/note       { note }
GET    /reels/favorites

GET    /search               ?q=

PATCH  /users/me             { name, email }
PATCH  /users/me/password    { currentPassword, newPassword }
```

---

## Key Features

- ✅ JWT auth with refresh token handling
- ✅ Protected routes with auto-redirect
- ✅ AI reel saving flow with animated progress states
- ✅ Platform detection from URL (Instagram/TikTok/YouTube/Facebook)
- ✅ Collection management with grid/list toggle
- ✅ Random reel picker with confetti animation
- ✅ Public share pages with QR code generation
- ✅ Global search with debounce + recent searches
- ✅ Optimistic UI updates on delete
- ✅ Skeleton loaders on every data screen
- ✅ Framer Motion page transitions + stagger animations
- ✅ Dark glassmorphism design system
- ✅ Mobile-first with bottom nav + FAB
- ✅ Responsive across mobile / tablet / desktop

---

## Design System

**Colors:**
- Background: `#080810` base, `#0e0e1a` surface, `#14141f` elevated
- Accent: `#7c6dff` primary purple
- Text: `#f0f0ff` primary, `#8888aa` secondary, `#4a4a6a` muted

**Typography:**
- Display: Clash Display (headers)
- Body: Cabinet Grotesk (UI)

**Components use:**
- `glass` / `glass-strong` utility classes for blur panels
- `card-hover` for smooth hover elevation
- `btn-primary` / `btn-ghost` for buttons
- `input-field` for all form inputs

---

## Notes

- Mock data is shown when the backend is offline — the UI is always populated for demo purposes
- All API calls gracefully fall back to mock data
- The app is fully functional as a frontend demo without a backend
