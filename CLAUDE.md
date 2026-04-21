# vinctum-web

Vinctum P2P platformunun React frontend'i. Go backend (vinctum-core) Gateway servisi ile HTTP uzerinden iletisir.

## Tech Stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4
- React Router DOM 7, Axios
- JWT auth (access + refresh token rotation)

## Project Structure

```
src/
  components/
    Layout.tsx              # Sidebar layout (nav + user profile + logout)
    ProtectedRoute.tsx      # Auth guard, redirects to /login
  context/
    AuthContext.tsx          # Global auth state, token interceptors
  lib/
    api.ts                  # Axios instance (baseURL: /api)
    auth-api.ts             # Auth API functions (MOCK=true for dev)
    device-api.ts           # Device/pairing/session API (MOCK=true for dev)
    fingerprint.ts          # Browser fingerprint + device type detection
    mock-data.ts            # Mock nodes and anomalies for dashboard
  pages/
    Home.tsx                # Public landing page, auth-aware header (Sign in / Dashboard+Account)
    Account.tsx             # Protected, own header, profile info + sign out
    Login.tsx, Register.tsx  # Auth pages
    VerifyEmail.tsx, CheckEmail.tsx  # Email verification flow
    Dashboard.tsx           # Protected, sidebar layout, stats + devices + quick actions
    Devices.tsx             # Device management + pairing flow
    Sessions.tsx            # Peer session management
    Transfers.tsx           # E2E encrypted file transfers
  types/
    api.ts                  # ML API types (NodeMetrics, ScoreResponse, etc.)
    auth.ts                 # Auth types (User, LoginRequest, etc.)
    device.ts               # Device types (Device, PeerSession, PairingCode, etc.)
  App.tsx                   # Routes + AuthProvider
  main.tsx                  # Entry point
  index.css                 # Tailwind import
```

## Commands

```bash
# Dev server (port 3000)
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Conventions

- Two layout modes: Home/Account have own header (no sidebar), Dashboard/Devices/Sessions/Transfers use sidebar Layout
- Dark theme: bg-gray-950 base, gray-900 cards, gray-800 borders
- MOCK flag in auth-api.ts and device-api.ts: set to true for frontend-only dev
- Mock login: test@vinctum.app / 12345678
- Vite proxy: /api -> http://localhost:8080 (Gateway)
- Status badges: emerald=good, yellow=warning, red=critical/bad
- All API calls go through /api prefix (proxied to Gateway)
- Auth tokens stored in localStorage (vinctum_access_token, vinctum_refresh_token, vinctum_user)
- Axios interceptors auto-attach Bearer token and handle 401 refresh
