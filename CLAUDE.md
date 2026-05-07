# vinctum-web

Vinctum P2P platformunun React frontend'i. Go backend (vinctum-core) Gateway servisi ile HTTP uzerinden iletisir.

## Tech Stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4
- React Router DOM 7, Axios, Sonner (toast notifications)
- JWT auth (access + refresh token rotation)

## Project Structure

```
src/
  components/
    ErrorBoundary.tsx       # Global error boundary with fallback UI
    Layout.tsx              # Sidebar layout (nav + user profile + logout + notification badge)
    ProtectedRoute.tsx      # Auth guard, redirects to /login
  context/
    AuthContext.tsx          # Global auth state, token interceptors
    NotificationContext.tsx  # Notification polling (15s), toast on new friend requests
  lib/
    api.ts                  # Axios instance (baseURL: /api)
    auth-api.ts             # Auth API functions
    device-api.ts           # Device/pairing/session/friend-devices/visibility API
    device-key.ts           # X25519 device key generation, ECDH key derivation
    fingerprint.ts          # Browser fingerprint + device type detection
    friend-api.ts           # Friend requests, search users, notifications count
    ml-api.ts               # ML service API (node scoring, anomaly detection)
    transfer-api.ts         # Transfer API (chunked upload/download, E2E encryption, NDJSON streams)
  pages/
    Home.tsx                # Public landing page, auth-aware header
    Account.tsx             # Protected, own header, profile + settings + danger zone
    Login.tsx, Register.tsx  # Auth pages
    ForgotPassword.tsx      # Password reset request
    ResetPassword.tsx       # Password reset with token
    VerifyEmail.tsx, CheckEmail.tsx  # Email verification flow
    Dashboard.tsx           # Protected, sidebar layout, stats + devices + quick actions
    Devices.tsx             # Device management + pairing flow + public/private visibility toggle
    Sessions.tsx            # Peer session management
    Transfers.tsx           # E2E encrypted file transfers (device/session/friend send modes)
    Friends.tsx             # Friend list, pending requests, user search
    Incoming.tsx            # Incoming file receive with progress tracking
    Notifications.tsx       # Notification feed (friend requests), links to Friends page
    Anomalies.tsx           # Network page with metrics and security scan
    NotFound.tsx            # 404 page
  types/
    api.ts                  # ML API types (NodeMetrics, ScoreResponse, etc.)
    auth.ts                 # Auth types (User, LoginRequest, etc.)
    device.ts               # Device types (Device, PeerSession, Friend, etc.)
    friend.ts               # Friend types (Friend, UserInfo, NotificationCount)
    transfer.ts             # Transfer types (TransferInfo, TransferStatus, etc.)
  App.tsx                   # Routes + AuthProvider + NotificationProvider + ErrorBoundary + Sonner
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

- Two layout modes: Home/Account have own header (no sidebar), all other protected pages use sidebar Layout
- Dark theme: oklch-based CSS variables (--bg, --fg, --accent, --line, --muted, --amber, --red)
- Glass card styles: glass-card, glass-card-static, drop-zone
- Inline styles preferred over tailwind classes for consistency
- Vite proxy: /api -> http://localhost:8080 (Gateway)
- Status badges: emerald/accent=good, amber=warning, red=critical
- All API calls go through /api prefix (proxied to Gateway)
- Auth tokens stored in localStorage (vinctum_access_token, vinctum_refresh_token, vinctum_user)
- Axios interceptors auto-attach Bearer token and handle 401 refresh
- Device visibility: public (friends can see and send files) / private (only owner)
- Transfer send modes: Device (own devices), Session (all devices in session), Friend (friend's public devices)
- Notification polling every 15s, toast notification on new friend requests with "View" action
