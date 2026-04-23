# vinctum-web

Vinctum P2P platformunun React frontend'i. Go backend ([vinctum-core](https://github.com/vinctum/vinctum-core)) Gateway servisi ile HTTP uzerinden iletisir.

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

- **Mock mode**: `MOCK=true` flag in `auth-api.ts`, `device-api.ts`, and `transfer-api.ts` for frontend-only development
- **Mock login**: `test@vinctum.app` / `12345678`
- **Vite proxy**: `/api` -> `http://localhost:8080` (Gateway)
