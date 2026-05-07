# vinctum-web

Vinctum P2P platformunun React frontend'i. Go backend ([vinctum-core](https://github.com/saitddundar/vinctum-core)) Gateway servisi ile HTTP uzerinden iletisir.

## Tech Stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4
- React Router DOM 7, Axios, Sonner
- JWT auth (access + refresh token rotation)

## Getting Started

```bash
# Install dependencies
npm install

# Dev server (port 3000)
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Development

- **Vite proxy**: `/api` -> `http://localhost:8080` (Gateway)
- Backend services must be running (see [vinctum-core](https://github.com/saitddundar/vinctum-core))

## Features

### Authentication
- Email/password login with JWT access + refresh token rotation
- Email verification flow
- Password reset flow

### Device Management
- Register browser as a device (auto-approved)
- Device pairing via 6-character codes (generate, redeem, approve)
- Public/private visibility toggle per device
- Device detail panel with type, status, visibility, node ID, fingerprint

### File Transfers
- End-to-end encrypted (AES-256-GCM, client-side)
- X25519 ECDH key derivation per transfer
- Chunked upload/download with progress tracking
- Three send modes:
  - **Device** -- send to your own devices
  - **Session** -- send to all devices in a peer session
  - **Friend** -- send to a friend's public devices
- Transfer pipeline visualization (prepare, encrypt, upload, verify, complete)
- Incoming file receive page with download + decryption

### Friends
- Search users by username
- Send/accept/reject friend requests
- View friend's public devices for file transfer

### Notifications
- Real-time notification badge in topbar (15s polling)
- Toast notification when new friend request arrives
- Dedicated notifications page with friend request feed
- Click notification to navigate to Friends page

### Network & Security
- Network metrics dashboard
- ML-powered node security scanning
- Anomaly detection visualization

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Public landing page |
| `/login` | Login | Email/password auth |
| `/register` | Register | New account |
| `/verify` | VerifyEmail | Email verification |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset with token |
| `/dashboard` | Dashboard | Stats, devices, quick actions |
| `/devices` | Devices | Device management + pairing |
| `/sessions` | Sessions | Peer session management |
| `/transfers` | Transfers | Send files (device/session/friend) |
| `/incoming` | Incoming | Receive files |
| `/friends` | Friends | Friend list, requests, search |
| `/notifications` | Notifications | Notification feed |
| `/network` | Anomalies | Network metrics + security |
| `/account` | Account | Profile, settings, danger zone |
