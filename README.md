# ReClaim — Production React App

Recovery companion: daily check-ins, pattern insights, Becca AI chat, leaderboard, and Firebase sync.

## Quick start

```bash
cd ~/Projects/reclaim
cp .env.example .env
npm install
npm run dev
```

For local Becca chat (proxy), use Netlify Dev so `/api/chat` hits the function:

```bash
npm install -g netlify-cli   # once
netlify dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Vitest unit tests (RI + check-in streak) |

## Environment variables

### Client (`.env` — Vite prefix)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_*` | Firebase web config (public in browser) |
| `VITE_API_BASE` | Empty in prod; set for custom API host if needed |
| `VITE_PAYMENTS_ENABLED` | `true` to enable payment UI (Stripe/PayPal TBD) |
| `VITE_SENTRY_DSN` | Optional Sentry DSN |

### Server (Netlify dashboard only)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Becca proxy — **never** in client |

## Architecture

- **React + Vite** SPA with React Router
- **Firebase Auth + Firestore** for accounts and leaderboard
- **Netlify Functions** proxy at `POST /.netlify/functions/chat` (redirected from `/api/chat`)
- **Becca never calls `api.anthropic.com` from the browser**

### Routes

| Path | Access |
|------|--------|
| `/`, `/landing`, `/signup`, `/learn` | Public |
| `/privacy`, `/terms` | Public |
| `/app/dashboard`, `/app/chat`, `/app/phases`, `/app/settings`, `/app/payment` | Protected (requires profile name) |

## Deploy (Netlify)

1. Connect repo or drag `dist/` after `npm run build`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `ANTHROPIC_API_KEY` in Netlify env
5. Set `VITE_FIREBASE_*` in Netlify env (or commit `.env.example` values — they are public client config)
6. Deploy Firestore rules/indexes via Firebase CLI (see **Firebase setup** below)

`netlify.toml` includes SPA fallback and `/api/chat` → function redirect.

## Firebase setup

### Console (one-time)

1. **Firebase Console** → project `reclaim-d2b9e` (or your project id in `.firebaserc`)
2. Enable **Email/Password** and **Google** sign-in providers
3. Add your Netlify URL under **Authentication → Settings → Authorized domains**
4. Optional: enable **App Check** for production hardening

### CLI — deploy Firestore rules & indexes

Firebase CLI is included as a dev dependency (`firebase-tools`). From the project root:

```bash
npm install
npx firebase login
npm run firebase:deploy
```

This deploys `firebase/firestore.rules` and `firebase/firestore.indexes.json` to project `reclaim-d2b9e` (see `.firebaserc`).

| Script | What it does |
|--------|----------------|
| `npm run firebase:deploy` | Rules + indexes |
| `npm run firebase:deploy:rules` | Rules only |
| `npm run firebase:deploy:indexes` | Indexes only |

**Note:** Hosting stays on Netlify; Firebase deploy here is for Firestore security rules and the leaderboard index only.

## Critical fixes vs monolith

- ✅ Single check-in modal (`#checkin-modal`) — no duplicate `#modal` IDs
- ✅ Pattern insights read from `checkins`, not `journeyGrid`
- ✅ Becca calls `/api/chat` proxy only
- ✅ Single settings UI at `/app/settings`
- ✅ Logout: `signOut` + `clearSessionStorage()` for all session keys

## Migration from monolith

The original ~2,800-line HTML app is preserved as reference only:

- See `legacy/ReClaim-monolith-reference.html` (copy note — source: `Downloads/ReClaim-44.txt`)

Do not deploy the monolith alongside this app at the same root without a strangler route plan.

## Project structure

```
src/
├── lib/           dates, storage, resilience, firebase, firestore
├── features/      checkin, becca, streak, leaderboard
├── hooks/         useAuth, useUserData (via useUser.jsx)
├── routes/        pages + AppShell
└── styles/        tokens.css, global.css
netlify/functions/ chat.mjs — Anthropic proxy + rate limit
firebase/          firestore.rules, firestore.indexes.json
```

## License

Private — ReClaim recovery app.
